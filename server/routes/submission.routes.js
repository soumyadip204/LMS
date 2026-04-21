import express from 'express';
import {
  submitAssignment,
  submitQuiz,
  getMySubmissions
} from '../controllers/submission.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect); // Ensure user is logged in
router.use(authorize('learner', 'instructor')); // Either can view/take realistically but logic handles course enrollment check

router.post('/assignment/:courseId/:assignmentId', submitAssignment);
router.post('/quiz/:courseId/:quizId', submitQuiz);
router.get('/course/:courseId', getMySubmissions);

export default router;
