const { courseService } = require('../services');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');

/**
 * Get all courses
 */
const getCourses = catchAsync(async (req, res) => {
  const { courses, pagination } = await courseService.getCourses(req.query, req.user);
  
  ApiResponse.paginated(res, courses, pagination, 'Courses retrieved successfully');
});

/**
 * Get course by ID
 */
const getCourse = catchAsync(async (req, res) => {
  const course = await courseService.getCourseById(req.params.courseId, req.user);
  
  ApiResponse.success(res, 200, 'Course retrieved successfully', { course });
});

/**
 * Get course by slug
 */
const getCourseBySlug = catchAsync(async (req, res) => {
  const course = await courseService.getCourseBySlug(req.params.slug, req.user);
  
  ApiResponse.success(res, 200, 'Course retrieved successfully', { course });
});

/**
 * Create course (instructor/admin)
 */
const createCourse = catchAsync(async (req, res) => {
  const course = await courseService.createCourse(req.body, req.user._id);
  
  ApiResponse.success(res, 201, 'Course created successfully', { course });
});

/**
 * Update course
 */
const updateCourse = catchAsync(async (req, res) => {
  const course = await courseService.updateCourse(req.params.courseId, req.body, req.user);
  
  ApiResponse.success(res, 200, 'Course updated successfully', { course });
});

/**
 * Delete course
 */
const deleteCourse = catchAsync(async (req, res) => {
  await courseService.deleteCourse(req.params.courseId, req.user);
  
  ApiResponse.success(res, 200, 'Course deleted successfully');
});

/**
 * Publish course
 */
const publishCourse = catchAsync(async (req, res) => {
  const course = await courseService.publishCourse(req.params.courseId, true, req.user);
  
  ApiResponse.success(res, 200, 'Course published successfully', { course });
});

/**
 * Unpublish course
 */
const unpublishCourse = catchAsync(async (req, res) => {
  const course = await courseService.publishCourse(req.params.courseId, false, req.user);
  
  ApiResponse.success(res, 200, 'Course unpublished successfully', { course });
});

/**
 * Get instructor's courses
 */
const getMyCourses = catchAsync(async (req, res) => {
  const { courses, pagination } = await courseService.getInstructorCourses(req.user._id, req.query);
  
  ApiResponse.paginated(res, courses, pagination, 'Courses retrieved successfully');
});

/**
 * Get course statistics (admin)
 */
const getStatistics = catchAsync(async (req, res) => {
  const stats = await courseService.getStatistics();
  
  ApiResponse.success(res, 200, 'Statistics retrieved successfully', { stats });
});

module.exports = {
  getCourses,
  getCourse,
  getCourseBySlug,
  createCourse,
  updateCourse,
  deleteCourse,
  publishCourse,
  unpublishCourse,
  getMyCourses,
  getStatistics,
};
