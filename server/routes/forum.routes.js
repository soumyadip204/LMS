import express from 'express';
import { getCourseThreads, createThread } from '../controllers/forum.controller.js';
import auth from '../middleware/auth.middleware.js';

const router = express.Router();

router.route('/:courseId')
  .get(auth, getCourseThreads)
  .post(auth, createThread);

export default router;
