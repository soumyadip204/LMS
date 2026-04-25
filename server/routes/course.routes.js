import express from 'express';
import {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  enrollCourse,
  unenrollCourse,
  getMyCourses,
  getEnrolledCourses,
  createCourseReview,
} from '../controllers/course.controller.js';
import auth from '../middleware/auth.middleware.js';
import authorize from '../middleware/role.middleware.js';

const router = express.Router();

// Public routes
router.get('/', getCourses);

// Protected routes (must come before /:id)
router.get('/my-courses', auth, authorize('instructor'), getMyCourses);
router.get('/enrolled', auth, authorize('learner'), getEnrolledCourses);

// Course CRUD
router.post('/', auth, authorize('instructor'), createCourse);
router.get('/:id', getCourseById);
router.put('/:id', auth, authorize('instructor'), updateCourse);
router.delete('/:id', auth, authorize('instructor', 'admin'), deleteCourse);
router.post('/:id/reviews', auth, createCourseReview);

// Enrollment
router.post('/:id/enroll', auth, authorize('learner'), enrollCourse);
router.post('/:id/unenroll', auth, authorize('learner'), unenrollCourse);

export default router;
