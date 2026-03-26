import express from 'express';
import {
  enrollCourse,
  getMyEnrollments,
  checkEnrollment,
  getCourseStudents,
} from '../controllers/enrollmentController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { enrollCourseSchema } from '../validators/enrollment.validator.js';

const router = express.Router();

// POST /api/enrollments  { courseId }
router.post('/', protect, authorize('student'), validate(enrollCourseSchema), enrollCourse);

// GET /api/enrollments/my  (and alias)
router.get('/my', protect, getMyEnrollments);
router.get('/my-courses', protect, getMyEnrollments);

// GET /api/enrollments/check/:courseId
router.get('/check/:courseId', protect, checkEnrollment);

// GET /api/enrollments/course/:courseId  (instructor view)
router.get('/course/:courseId', protect, authorize('instructor', 'admin'), getCourseStudents);

export default router;
