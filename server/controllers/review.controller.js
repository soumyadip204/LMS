import Review from '../models/Review.js';
import Course from '../models/Course.js';

// @desc    Get reviews for a course
// @route   GET /api/reviews/course/:courseId
// @access  Public
export const getCourseReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ course: req.params.courseId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({ reviews });
  } catch (error) {
    console.error('GetCourseReviews error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// @desc    Add a review to a course
// @route   POST /api/reviews/course/:courseId
// @access  Learner (enrolled)
export const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const courseId = req.params.courseId;

    if (!rating) {
      return res.status(400).json({ message: 'Rating is required.' });
    }

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found.' });
    }

    // Check if user is enrolled
    if (!course.enrolledStudents.includes(req.user._id)) {
      return res.status(403).json({ message: 'You must be enrolled in this course to review it.' });
    }

    // Check for existing review
    const existingReview = await Review.findOne({ course: courseId, user: req.user._id });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this course.' });
    }

    // Create review
    const review = await Review.create({
      course: courseId,
      user: req.user._id,
      rating,
      comment: comment || '',
    });

    // Update course average rating
    const allReviews = await Review.find({ course: courseId });
    const avgRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await Course.findByIdAndUpdate(courseId, {
      averageRating: Math.round(avgRating * 10) / 10,
      totalReviews: allReviews.length,
    });

    const populatedReview = await Review.findById(review._id).populate('user', 'name avatar');

    res.status(201).json({ message: 'Review added successfully.', review: populatedReview });
  } catch (error) {
    console.error('AddReview error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Owner or Admin
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found.' });
    }

    // Check ownership or admin
    if (
      review.user.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized to delete this review.' });
    }

    const courseId = review.course;
    await Review.findByIdAndDelete(req.params.id);

    // Recalculate average rating
    const allReviews = await Review.find({ course: courseId });
    const avgRating =
      allReviews.length > 0
        ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
        : 0;

    await Course.findByIdAndUpdate(courseId, {
      averageRating: Math.round(avgRating * 10) / 10,
      totalReviews: allReviews.length,
    });

    res.json({ message: 'Review deleted successfully.' });
  } catch (error) {
    console.error('DeleteReview error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};
