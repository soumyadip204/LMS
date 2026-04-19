import Course from '../models/Course.js';
import User from '../models/User.js';

// @desc    Create a new course
// @route   POST /api/courses
// @access  Instructor
export const createCourse = async (req, res) => {
  try {
    const { title, description, thumbnail, category, tags, lectures } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({ message: 'Title, description, and category are required.' });
    }

    const course = await Course.create({
      title,
      description,
      thumbnail,
      category,
      tags: tags || [],
      lectures: lectures || [],
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

    res.json({ course });
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

    const { title, description, thumbnail, category, tags, lectures, isPublished } = req.body;
    const updateData = {};

    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (thumbnail !== undefined) updateData.thumbnail = thumbnail;
    if (category) updateData.category = category;
    if (tags) updateData.tags = tags;
    if (lectures) updateData.lectures = lectures;
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
