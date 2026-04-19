import express from 'express';
import {
  getAllUsers,
  deleteUser,
  changeUserRole,
  getAllCoursesAdmin,
  deleteCourseAdmin,
  getStats,
} from '../controllers/admin.controller.js';
import auth from '../middleware/auth.middleware.js';
import authorize from '../middleware/role.middleware.js';

const router = express.Router();

// All admin routes require admin role
router.use(auth, authorize('admin'));

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/role', changeUserRole);
router.get('/courses', getAllCoursesAdmin);
router.delete('/courses/:id', deleteCourseAdmin);

export default router;
