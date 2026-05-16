import Course from '../models/Course.js';
import User from '../models/User.js';
import QuizSubmission from '../models/QuizSubmission.js';
import AssignmentSubmission from '../models/AssignmentSubmission.js';
import ForumThread from '../models/ForumThread.js';
import Review from '../models/Review.js';

// Helper to calculate total duration in minutes
const computeTotalDuration = (modules) => {
  let total = 0;
  if (!modules || !Array.isArray(modules)) return total;
  modules.forEach(m => {
    if (m.items && Array.isArray(m.items)) {
      m.items.forEach(item => {
        if (item.duration) total += Number(item.duration);
        if (item.time) total += Number(item.time);
      });
    }
  });
  return total;
};

// @desc    Create a new course
// @route   POST /api/courses
// @access  Instructor
export const createCourse = async (req, res) => {
  try {
    const { title, description, whatYouWillLearn, thumbnail, category, tags, modules } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({ message: 'Title, description, and category are required.' });
    }

    const course = await Course.create({
      title,
      description,
      whatYouWillLearn: whatYouWillLearn || [],
      thumbnail,
      category,
      tags: tags || [],
      modules: modules || [],
      totalDuration: computeTotalDuration(modules),
      instructor: req.user._id,
    });

    // Add course to instructor's createdCourses
    await User.findByIdAndUpdate(req.user._id, {
      $push: { createdCourses: course._id },
    });

    res.status(201).json({ message: 'Course created successfully.', course });
  } catch (error) {
    console.error('CreateCourse error:', error);
    res.status(500).json({ message: 'Server error while creating course.' });
  }
};

// @desc    Get all published courses (with filters)
// @route   GET /api/courses
// @access  Public
export const getCourses = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;
    const query = { isPublished: true };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const total = await Course.countDocuments(query);
    const courses = await Course.find(query)
      .populate('instructor', 'name avatar')
      .select('-enrolledStudents')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      courses,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
    });
  } catch (error) {
    console.error('GetCourses error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// @desc    Get single course by ID
// @route   GET /api/courses/:id
// @access  Public
export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name avatar bio')
      .populate('enrolledStudents', 'name avatar');

    if (!course) {
      return res.status(404).json({ message: 'Course not found.' });
    }

    const reviews = await Review.find({ course: req.params.id })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({ course: { ...course.toObject(), reviews } });
  } catch (error) {
    console.error('GetCourseById error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// @desc    Update a course
// @route   PUT /api/courses/:id
// @access  Instructor (owner)
export const updateCourse = async (req, res) => {
  try {
    let course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found.' });
    }

    // Check ownership
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only update your own courses.' });
    }

    const { title, description, whatYouWillLearn, thumbnail, category, tags, modules, isPublished } = req.body;
    const updateData = {};

    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (whatYouWillLearn) updateData.whatYouWillLearn = whatYouWillLearn;
    if (thumbnail !== undefined) updateData.thumbnail = thumbnail;
    if (category) updateData.category = category;
    if (tags) updateData.tags = tags;
    if (modules) {
      updateData.modules = modules;
      updateData.totalDuration = computeTotalDuration(modules);
    }
    if (isPublished !== undefined) updateData.isPublished = isPublished;

    course = await Course.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate('instructor', 'name avatar');

    res.json({ message: 'Course updated successfully.', course });
  } catch (error) {
    console.error('UpdateCourse error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// @desc    Delete a course
// @route   DELETE /api/courses/:id
// @access  Instructor (owner) or Admin
export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found.' });
    }

    // Check ownership or admin
    if (
      course.instructor.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized to delete this course.' });
    }

    // Remove course from instructor's createdCourses
    await User.findByIdAndUpdate(course.instructor, {
      $pull: { createdCourses: course._id },
    });

    // Remove course from all enrolled students
    await User.updateMany(
      { enrolledCourses: course._id },
      { $pull: { enrolledCourses: course._id } }
    );

    await Course.findByIdAndDelete(req.params.id);

    res.json({ message: 'Course deleted successfully.' });
  } catch (error) {
    console.error('DeleteCourse error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// @desc    Enroll in a course
// @route   POST /api/courses/:id/enroll
// @access  Learner
export const enrollCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found.' });
    }

    if (!course.isPublished) {
      return res.status(400).json({ message: 'Cannot enroll in an unpublished course.' });
    }

    // Check if already enrolled
    if (course.enrolledStudents.includes(req.user._id)) {
      return res.status(400).json({ message: 'You are already enrolled in this course.' });
    }

    // Add student to course
    course.enrolledStudents.push(req.user._id);
    course.enrollmentCount += 1;
    await course.save();

    // Add course to user's enrolledCourses
    await User.findByIdAndUpdate(req.user._id, {
      $push: { enrolledCourses: course._id },
    });

    res.json({ message: 'Successfully enrolled in the course.' });
  } catch (error) {
    console.error('EnrollCourse error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// @desc    Unenroll from a course
// @route   POST /api/courses/:id/unenroll
// @access  Learner
export const unenrollCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found.' });
    }

    // Check if enrolled
    if (!course.enrolledStudents.includes(req.user._id)) {
      return res.status(400).json({ message: 'You are not enrolled in this course.' });
    }

    // Remove student from course
    course.enrolledStudents = course.enrolledStudents.filter(
      (id) => id.toString() !== req.user._id.toString()
    );
    course.enrollmentCount = Math.max(0, course.enrollmentCount - 1);
    await course.save();

    // Remove course from user's enrolledCourses
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { enrolledCourses: course._id },
    });

    res.json({ message: 'Successfully unenrolled from the course.' });
  } catch (error) {
    console.error('UnenrollCourse error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// @desc    Get instructor's own courses
// @route   GET /api/courses/my-courses
// @access  Instructor
export const getMyCourses = async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user._id })
      .populate('instructor', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({ courses });
  } catch (error) {
    console.error('GetMyCourses error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// @desc    Get learner's enrolled courses
// @route   GET /api/courses/enrolled
// @access  Learner
export const getEnrolledCourses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'enrolledCourses',
      populate: { path: 'instructor', select: 'name avatar' },
    });

    res.json({ courses: user.enrolledCourses });
  } catch (error) {
    console.error('GetEnrolledCourses error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};



// @desc    Get course analytics
// @route   GET /api/courses/:id/analytics
// @access  Instructor/Admin
export const getCourseAnalytics = async (req, res) => {
  try {
    const courseId = req.params.id;
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view analytics' });
    }

    // 1. Enrollment & Engagement
    const totalEnrolled = course.enrolledStudents.length;
    const forumThreads = await ForumThread.find({ course: courseId });
    const totalThreads = forumThreads.length;
    const totalReplies = forumThreads.reduce((acc, thread) => acc + thread.replies.length, 0);
    
    // 2. Interactive Items Count
    let totalAssignments = 0;
    let totalQuizzes = 0;
    course.modules.forEach(m => {
      m.items.forEach(item => {
        if (item.type === 'assignment') totalAssignments++;
        if (item.type === 'quiz') totalQuizzes++;
      });
    });
    const totalInteractiveItems = totalAssignments + totalQuizzes;

    // 3. Submissions & Grades
    const quizSubmissions = await QuizSubmission.find({ courseId: courseId });
    const assignmentSubmissions = await AssignmentSubmission.find({ courseId: courseId });

    // Calculate active students (students who submitted at least one thing)
    const activeStudentIds = new Set();
    let totalQuizScore = 0;
    let totalQuizMax = 0;
    let gradedAssignments = 0;
    let totalAssignmentScore = 0;

    quizSubmissions.forEach(sub => {
      activeStudentIds.add(sub.studentId.toString());
      totalQuizScore += sub.score;
      // We need max score to get percentage, but we can just use average score for now
    });

    assignmentSubmissions.forEach(sub => {
      activeStudentIds.add(sub.studentId.toString());
      if (sub.status === 'graded' && sub.score != null) {
        gradedAssignments++;
        totalAssignmentScore += sub.score;
      }
    });

    const activeStudents = activeStudentIds.size;
    
    // Calculate average progress
    // Progress for a student = (their submissions) / totalInteractiveItems
    // Total submissions = quizSubmissions.length + assignmentSubmissions.length
    // Average progress = (Total submissions / totalEnrolled) / totalInteractiveItems
    let averageProgress = 0;
    if (totalEnrolled > 0 && totalInteractiveItems > 0) {
      const submissionsPerStudent = (quizSubmissions.length + assignmentSubmissions.length) / totalEnrolled;
      averageProgress = (submissionsPerStudent / totalInteractiveItems) * 100;
    }

    const averageQuizScore = quizSubmissions.length > 0 ? (totalQuizScore / quizSubmissions.length).toFixed(1) : 0;
    const averageAssignmentScore = gradedAssignments > 0 ? (totalAssignmentScore / gradedAssignments).toFixed(1) : 0;

    // 4. Individual Learner Tracking
    const enrolledUsers = await User.find({ _id: { $in: course.enrolledStudents } }, 'name email avatar');
    
    const studentPerformance = enrolledUsers.map(user => {
      const studentIdStr = user._id.toString();
      
      const studentQuizzes = quizSubmissions.filter(sub => sub.studentId.toString() === studentIdStr);
      const studentAssignments = assignmentSubmissions.filter(sub => sub.studentId.toString() === studentIdStr);
      
      const studentQuizScore = studentQuizzes.reduce((acc, sub) => acc + sub.score, 0);
      const avgQuiz = studentQuizzes.length > 0 ? (studentQuizScore / studentQuizzes.length).toFixed(1) : 0;
      
      const gradedAssigns = studentAssignments.filter(sub => sub.status === 'graded' && sub.score != null);
      const studentAssignScore = gradedAssigns.reduce((acc, sub) => acc + sub.score, 0);
      const avgAssign = gradedAssigns.length > 0 ? (studentAssignScore / gradedAssigns.length).toFixed(1) : 0;
      
      const totalSubs = studentQuizzes.length + studentAssignments.length;
      const progress = totalInteractiveItems > 0 ? Math.min(Math.round((totalSubs / totalInteractiveItems) * 100), 100) : 0;
      
      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        progress,
        completedQuizzes: studentQuizzes.length,
        averageQuizScore: Number(avgQuiz),
        completedAssignments: studentAssignments.length,
        averageAssignmentScore: Number(avgAssign)
      };
    });

    res.json({
      enrollment: {
        totalEnrolled,
        activeStudents,
        engagementRate: totalEnrolled > 0 ? Math.round((activeStudents / totalEnrolled) * 100) : 0
      },
      performance: {
        averageProgress: Math.min(Math.round(averageProgress), 100),
        averageQuizScore: Number(averageQuizScore),
        averageAssignmentScore: Number(averageAssignmentScore),
        totalSubmissions: quizSubmissions.length + assignmentSubmissions.length
      },
      engagement: {
        totalReviews: course.totalReviews || 0,
        averageRating: course.averageRating || 0,
        forumThreads: totalThreads,
        forumReplies: totalReplies
      },
      studentPerformance
    });
  } catch (error) {
    console.error('getCourseAnalytics error:', error);
    res.status(500).json({ message: 'Server error fetching analytics' });
  }
};
