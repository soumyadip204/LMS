import express from 'express';
import { getProfile, updateProfile, getInstructorProfile } from '../controllers/user.controller.js';
import auth from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.get('/instructor/:id', getInstructorProfile);

export default router;
