import User from '../models/User.js';
import bcrypt from 'bcryptjs';

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('enrolledCourses', 'title thumbnail category instructor')
      .populate('createdCourses', 'title thumbnail category enrollmentCount isPublished');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({ user });
  } catch (error) {
    console.error('GetProfile error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// @desc    Update user profile (role-gated fields)
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const { name, bio, avatar, password, experience, domainInterests, educationalQualifications, skills, occupation } = req.body;
    const role = user.role;

    // --- Fields all roles can edit ---
    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar;

    // --- Password (all roles) ---
    if (password) {
      if (password.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters.' });
      }
      user.password = password; // pre-save hook handles hashing
    }

    // --- Instructor-only fields ---
    if (role === 'instructor') {
      if (experience !== undefined) user.experience = experience;
      if (educationalQualifications !== undefined) user.educationalQualifications = educationalQualifications;
      if (skills !== undefined) user.skills = skills;
    }

    // --- Learner-only fields ---
    if (role === 'learner') {
      if (domainInterests !== undefined) user.domainInterests = domainInterests;
      if (educationalQualifications !== undefined) user.educationalQualifications = educationalQualifications;
      if (skills !== undefined) user.skills = skills;
      if (occupation !== undefined) user.occupation = occupation;
    }

    await user.save();

    // Return user without password
    const updatedUser = user.toObject();
    delete updatedUser.password;

    res.json({
      message: 'Profile updated successfully.',
      user: updatedUser,
    });
  } catch (error) {
    console.error('UpdateProfile error:', error);
    res.status(500).json({ message: error.message || 'Server error.' });
  }
};

// @desc    Get public instructor profile
// @route   GET /api/users/instructor/:id
// @access  Public
export const getInstructorProfile = async (req, res) => {
  try {
    const instructor = await User.findById(req.params.id)
      .select('name avatar bio experience educationalQualifications skills createdCourses createdAt')
      .populate({
        path: 'createdCourses',
        match: { isPublished: true },
        select: 'title thumbnail category enrollmentCount averageRating',
      });

    if (!instructor) {
      return res.status(404).json({ message: 'Instructor not found.' });
    }

    res.json({ instructor });
  } catch (error) {
    console.error('GetInstructorProfile error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};
