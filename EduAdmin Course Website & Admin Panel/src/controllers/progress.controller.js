const { progressService } = require('../services');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');

/**
 * Get course progress
 */
const getCourseProgress = catchAsync(async (req, res) => {
  const progress = await progressService.getCourseProgress(req.user._id, req.params.courseId);
  
  ApiResponse.success(res, 200, 'Progress retrieved successfully', progress);
});

/**
 * Get lesson progress
 */
const getLessonProgress = catchAsync(async (req, res) => {
  const progress = await progressService.getLessonProgress(req.user._id, req.params.lessonId);
  
  ApiResponse.success(res, 200, 'Progress retrieved successfully', { progress });
});

/**
 * Update lesson progress
 */
const updateLessonProgress = catchAsync(async (req, res) => {
  const progress = await progressService.updateLessonProgress(
    req.user._id,
    req.params.lessonId,
    req.body
  );
  
  ApiResponse.success(res, 200, 'Progress updated successfully', { progress });
});

/**
 * Mark lesson as complete
 */
const markLessonComplete = catchAsync(async (req, res) => {
  const progress = await progressService.markLessonComplete(req.user._id, req.params.lessonId);
  
  ApiResponse.success(res, 200, 'Lesson marked as complete', { progress });
});

/**
 * Get next lesson
 */
const getNextLesson = catchAsync(async (req, res) => {
  const lesson = await progressService.getNextLesson(req.user._id, req.params.courseId);
  
  ApiResponse.success(res, 200, 'Next lesson retrieved', { lesson });
});

module.exports = {
  getCourseProgress,
  getLessonProgress,
  updateLessonProgress,
  markLessonComplete,
  getNextLesson,
};
