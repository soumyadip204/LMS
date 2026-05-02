import ForumThread from '../models/ForumThread.js';
import Course from '../models/Course.js';

// @desc    Get all threads for a course
// @route   GET /api/forums/:courseId
// @access  Private (Enrolled students and Instructor)
export const getCourseThreads = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is enrolled or instructor
    const isEnrolled = course.enrolledStudents.some(
      (studentId) => studentId.toString() === req.user._id.toString()
    );
    const isInstructor = course.instructor.toString() === req.user._id.toString();

    if (!isEnrolled && !isInstructor && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const threads = await ForumThread.find({ course: courseId })
      .populate('user', 'name avatar role')
      .populate('replies.user', 'name avatar role')
      .sort({ createdAt: -1 });

    res.json(threads);
  } catch (error) {
    console.error('getCourseThreads error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a new thread
// @route   POST /api/forums/:courseId
// @access  Private (Enrolled students and Instructor)
export const createThread = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, content } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const isEnrolled = course.enrolledStudents.some(
      (studentId) => studentId.toString() === req.user._id.toString()
    );
    const isInstructor = course.instructor.toString() === req.user._id.toString();

    if (!isEnrolled && !isInstructor && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const thread = await ForumThread.create({
      course: courseId,
      user: req.user._id,
      title,
      content,
      replies: []
    });

    const populatedThread = await ForumThread.findById(thread._id).populate('user', 'name avatar role');

    // Emit event if we wanted to (handled in socket.js optionally)

    res.status(201).json(populatedThread);
  } catch (error) {
    console.error('createThread error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
