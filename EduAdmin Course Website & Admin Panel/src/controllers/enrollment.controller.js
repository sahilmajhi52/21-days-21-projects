const { enrollmentService } = require('../services');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');

/**
 * Get all enrollments (admin)
 */
const getEnrollments = catchAsync(async (req, res) => {
  const { enrollments, pagination } = await enrollmentService.getEnrollments(req.query);
  
  ApiResponse.paginated(res, enrollments, pagination, 'Enrollments retrieved successfully');
});

/**
 * Get my enrollments (student)
 */
const getMyEnrollments = catchAsync(async (req, res) => {
  const { enrollments, pagination } = await enrollmentService.getStudentEnrollments(
    req.user._id,
    req.query
  );
  
  ApiResponse.paginated(res, enrollments, pagination, 'Enrollments retrieved successfully');
});

/**
 * Get enrollment by ID
 */
const getEnrollment = catchAsync(async (req, res) => {
  const enrollment = await enrollmentService.getEnrollmentById(req.params.enrollmentId);
  
  ApiResponse.success(res, 200, 'Enrollment retrieved successfully', { enrollment });
});

/**
 * Enroll in a course
 */
const enrollInCourse = catchAsync(async (req, res) => {
  const enrollment = await enrollmentService.enrollInCourse(
    req.user._id,
    req.params.courseId,
    req.body
  );
  
  ApiResponse.success(res, 201, 'Enrolled successfully', { enrollment });
});

/**
 * Update enrollment (admin)
 */
const updateEnrollment = catchAsync(async (req, res) => {
  const enrollment = await enrollmentService.updateEnrollment(
    req.params.enrollmentId,
    req.body
  );
  
  ApiResponse.success(res, 200, 'Enrollment updated successfully', { enrollment });
});

/**
 * Cancel enrollment
 */
const cancelEnrollment = catchAsync(async (req, res) => {
  await enrollmentService.cancelEnrollment(req.params.enrollmentId, req.user._id);
  
  ApiResponse.success(res, 200, 'Enrollment cancelled successfully');
});

/**
 * Get enrollment statistics (admin)
 */
const getStatistics = catchAsync(async (req, res) => {
  const stats = await enrollmentService.getStatistics();
  
  ApiResponse.success(res, 200, 'Statistics retrieved successfully', { stats });
});

module.exports = {
  getEnrollments,
  getMyEnrollments,
  getEnrollment,
  enrollInCourse,
  updateEnrollment,
  cancelEnrollment,
  getStatistics,
};
