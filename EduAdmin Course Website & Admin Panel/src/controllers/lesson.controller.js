const { lessonService } = require('../services');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');

/**
 * Get all lessons for a module
 */
const getLessons = catchAsync(async (req, res) => {
  const lessons = await lessonService.getLessons(req.params.moduleId, req.query);
  
  ApiResponse.success(res, 200, 'Lessons retrieved successfully', { lessons });
});

/**
 * Get lesson by ID
 */
const getLesson = catchAsync(async (req, res) => {
  const lesson = await lessonService.getLessonById(
    req.params.lessonId,
    req.params.moduleId,
    req.user
  );
  
  ApiResponse.success(res, 200, 'Lesson retrieved successfully', { lesson });
});

/**
 * Create lesson
 */
const createLesson = catchAsync(async (req, res) => {
  const lesson = await lessonService.createLesson(
    req.params.moduleId,
    req.params.courseId,
    req.body,
    req.user
  );
  
  ApiResponse.success(res, 201, 'Lesson created successfully', { lesson });
});

/**
 * Update lesson
 */
const updateLesson = catchAsync(async (req, res) => {
  const lesson = await lessonService.updateLesson(
    req.params.lessonId,
    req.params.moduleId,
    req.params.courseId,
    req.body,
    req.user
  );
  
  ApiResponse.success(res, 200, 'Lesson updated successfully', { lesson });
});

/**
 * Delete lesson
 */
const deleteLesson = catchAsync(async (req, res) => {
  await lessonService.deleteLesson(
    req.params.lessonId,
    req.params.moduleId,
    req.params.courseId,
    req.user
  );
  
  ApiResponse.success(res, 200, 'Lesson deleted successfully');
});

/**
 * Reorder lessons
 */
const reorderLessons = catchAsync(async (req, res) => {
  const lessons = await lessonService.reorderLessons(
    req.params.moduleId,
    req.params.courseId,
    req.body.lessonIds,
    req.user
  );
  
  ApiResponse.success(res, 200, 'Lessons reordered successfully', { lessons });
});

module.exports = {
  getLessons,
  getLesson,
  createLesson,
  updateLesson,
  deleteLesson,
  reorderLessons,
};
