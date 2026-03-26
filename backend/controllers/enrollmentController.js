/**
 * Enrollment Controller — thin layer, no manual validation
 * All input validation is handled by Joi middleware in routes/enrollmentRoutes.js
 */
import asyncHandler from 'express-async-handler';
import * as enrollmentService from '../services/enrollmentService.js';

/**
 * @desc    Enroll in a course
 * @route   POST /api/enrollments
 * @access  Private (student)
 */
export const enrollCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.body;
  const enrollment = await enrollmentService.enrollCourse(req.user._id, courseId);
  res.status(201).json({
    success: true,
    data: enrollment,
    message: 'Đăng ký khoá học thành công! Chúc bạn học tốt 🎉',
  });
});

/**
 * @desc    Get my enrolled courses
 * @route   GET /api/enrollments/my
 * @access  Private (student)
 */
export const getMyEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await enrollmentService.getMyEnrollments(req.user._id);
  res.json({ success: true, data: enrollments });
});

/**
 * @desc    Check enrollment status for a specific course
 * @route   GET /api/enrollments/check/:courseId
 * @access  Private
 */
export const checkEnrollment = asyncHandler(async (req, res) => {
  const result = await enrollmentService.checkEnrollment(req.user._id, req.params.courseId);
  res.json({ success: true, data: result });
});

/**
 * @desc    Get students enrolled in a course (instructor view)
 * @route   GET /api/enrollments/course/:courseId
 * @access  Private (instructor)
 */
export const getCourseStudents = asyncHandler(async (req, res) => {
  const students = await enrollmentService.getCourseStudents(req.params.courseId);
  res.json({ success: true, data: students });
});
