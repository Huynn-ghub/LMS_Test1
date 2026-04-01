/**
 * Course Review Routes
 * Routes for admin to review and approve/reject courses
 *
 * ⚠️  QUAN TRỌNG: static routes (pending, approved, rejected) phải đứng TRƯỚC
 *     dynamic route (/:id/...) để Express không nhầm "pending"/"approved"/"rejected"
 *     thành một :id param.
 */
import express from 'express';
import {
  getPendingCourses,
  getCourseForReview,
  approveCourse,
  rejectCourse,
  getApprovedCourses,
  getRejectedCourses,
} from '../controllers/courseReviewController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { rejectCourseSchema } from '../validators/courseReview.validator.js';

const router = express.Router();

// ── Middleware chung: tất cả routes bên dưới đều yêu cầu admin ────
const adminOnly = [protect, authorize('admin')];

// ─────────────────────────────────────────────────────────────────
// STATIC ROUTES — phải đứng TRƯỚC /:id để tránh conflict
// ─────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/courses/pending  — Danh sách khoá học chờ duyệt
 */
router.get('/pending', ...adminOnly, getPendingCourses);

/**
 * GET /api/admin/courses/approved — Danh sách khoá học đã duyệt
 */
router.get('/approved', ...adminOnly, getApprovedCourses);

/**
 * GET /api/admin/courses/rejected — Danh sách khoá học bị từ chối
 */
router.get('/rejected', ...adminOnly, getRejectedCourses);

// ─────────────────────────────────────────────────────────────────
// DYNAMIC ROUTES — theo :id
// ─────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/courses/:id/review — Chi tiết khoá học để duyệt
 */
router.get('/:id/review', ...adminOnly, getCourseForReview);

/**
 * PATCH /api/admin/courses/:id/approve — Duyệt khoá học
 */
router.patch('/:id/approve', ...adminOnly, approveCourse);

/**
 * PATCH /api/admin/courses/:id/reject — Từ chối khoá học
 */
router.patch('/:id/reject', ...adminOnly, validate(rejectCourseSchema), rejectCourse);

export default router;
