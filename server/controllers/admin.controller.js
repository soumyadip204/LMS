import User from '../models/User.js';
import Course from '../models/Course.js';
import Review from '../models/Review.js';

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Admin
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({ users });
  } catch (error) {
    console.error('GetAllUsers error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Admin
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot delete an admin user.' });
    }

    // If instructor, delete their courses and remove enrollments
    if (user.role === 'instructor') {
      const courses = await Course.find({ instructor: user._id });
      for (const course of courses) {
        // Remove from enrolled students
        await User.updateMany(
          { enrolledCourses: course._id },
          { $pull: { enrolledCourses: course._id } }
        );
        // Delete reviews
        await Review.deleteMany({ course: course._id });
      }
      await Course.deleteMany({ instructor: user._id });
    }

    // If learner, remove from enrolled courses
    if (user.role === 'learner') {
      for (const courseId of user.enrolledCourses) {
        await Course.findByIdAndUpdate(courseId, {
          $pull: { enrolledStudents: user._id },
          $inc: { enrollmentCount: -1 },
        });
      }
      // Delete their reviews
      await Review.deleteMany({ user: user._id });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'User deleted successfully.' });
  } catch (error) {
    console.error('DeleteUser error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// @desc    Change user role
// @route   PUT /api/admin/users/:id/role
// @access  Admin
export const changeUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!role || !['learner', 'instructor'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be learner or instructor.' });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot change admin role.' });
    }

    user.role = role;
    await user.save();

    res.json({
      message: `User role changed to ${role} successfully.`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('ChangeUserRole error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// @desc    Get all courses (including unpublished)
// @route   GET /api/admin/courses
// @access  Admin
export const getAllCoursesAdmin = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate('instructor', 'name email')
      .sort({ createdAt: -1 });

    res.json({ courses });
  } catch (error) {
    console.error('GetAllCoursesAdmin error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// @desc    Delete any course (admin)
// @route   DELETE /api/admin/courses/:id
// @access  Admin
export const deleteCourseAdmin = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found.' });
    }

    // Remove from instructor's createdCourses
    await User.findByIdAndUpdate(course.instructor, {
      $pull: { createdCourses: course._id },
    });

    // Remove from enrolled students
    await User.updateMany(
      { enrolledCourses: course._id },
      { $pull: { enrolledCourses: course._id } }
    );

    // Delete reviews
    await Review.deleteMany({ course: course._id });

    await Course.findByIdAndDelete(req.params.id);

    res.json({ message: 'Course deleted successfully.' });
  } catch (error) {
    console.error('DeleteCourseAdmin error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// @desc    Get platform statistics
// @route   GET /api/admin/stats
// @access  Admin
export const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalLearners = await User.countDocuments({ role: 'learner' });
    const totalInstructors = await User.countDocuments({ role: 'instructor' });
    const totalCourses = await Course.countDocuments();
    const publishedCourses = await Course.countDocuments({ isPublished: true });
    const totalReviews = await Review.countDocuments();

    // Total enrollments across all courses
    const enrollmentAgg = await Course.aggregate([
      { $group: { _id: null, totalEnrollments: { $sum: '$enrollmentCount' } } },
    ]);
    const totalEnrollments = enrollmentAgg.length > 0 ? enrollmentAgg[0].totalEnrollments : 0;

    // Top 5 courses by enrollment
    const topCourses = await Course.find({ isPublished: true })
      .populate('instructor', 'name')
      .sort({ enrollmentCount: -1 })
      .limit(5)
      .select('title enrollmentCount averageRating category');

    // Recent users
    const recentUsers = await User.find()
      .select('name email role createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    // Category distribution
    const categoryDist = await Course.aggregate([
      { $match: { isPublished: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      stats: {
        totalUsers,
        totalLearners,
        totalInstructors,
        totalCourses,
        publishedCourses,
        totalReviews,
        totalEnrollments,
      },
      topCourses,
      recentUsers,
      categoryDistribution: categoryDist,
    });
  } catch (error) {
    console.error('GetStats error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};
