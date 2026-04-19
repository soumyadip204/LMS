import express from 'express';
import { getCourseReviews, addReview, deleteReview } from '../controllers/review.controller.js';
import auth from '../middleware/auth.middleware.js';
import authorize from '../middleware/role.middleware.js';

const router = express.Router();

router.get('/course/:courseId', getCourseReviews);
router.post('/course/:courseId', auth, authorize('learner'), addReview);
router.delete('/:id', auth, deleteReview);

export default router;
