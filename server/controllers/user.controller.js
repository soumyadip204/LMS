import User from '../models/User.js';

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

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { name, bio, avatar } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (avatar !== undefined) updateData.avatar = avatar;

    const user = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true,
    });

    res.json({
      message: 'Profile updated successfully.',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
      },
    });
  } catch (error) {
    console.error('UpdateProfile error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// @desc    Get public instructor profile
// @route   GET /api/users/instructor/:id
// @access  Public
export const getInstructorProfile = async (req, res) => {
  try {
    const instructor = await User.findById(req.params.id)
      .select('name avatar bio createdCourses createdAt')
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
