const { Lesson, Module, Course, Enrollment, Progress } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Get lessons for a module
 * @param {string} moduleId - Module ID
 * @param {Object} query - Query parameters
 * @returns {Promise<Array>}
 */
const getLessons = async (moduleId, query = {}) => {
  const filter = { module: moduleId };
  
  if (query.isPublished !== undefined) {
    filter.isPublished = query.isPublished;
  }
  
  return Lesson.find(filter).sort({ order: 1 });
};

/**
 * Get lesson by ID
 * @param {string} lessonId - Lesson ID
 * @param {string} moduleId - Module ID
 * @param {Object} user - Current user (optional)
 * @returns {Promise<Lesson>}
 */
const getLessonById = async (lessonId, moduleId, user = null) => {
  const lesson = await Lesson.findOne({ _id: lessonId, module: moduleId })
    .populate('module', 'title course')
    .populate('course', 'title instructor');
  
  if (!lesson) {
    throw ApiError.notFound('Lesson not found');
  }
  
  // Check if user has access to full content
  if (user) {
    const course = await Course.findById(lesson.course._id);
    const isOwner = course.instructor.toString() === user._id.toString();
    const isAdmin = user.role === 'admin';
    const isEnrolled = await Enrollment.isEnrolled(user._id, lesson.course._id);
    
    if (!isOwner && !isAdmin && !isEnrolled && !lesson.isPreview) {
      // User doesn't have access - return limited info
      return {
        _id: lesson._id,
        title: lesson.title,
        description: lesson.description,
        type: lesson.type,
        duration: lesson.duration,
        isPreview: lesson.isPreview,
        requiresEnrollment: true,
      };
    }
  } else if (!lesson.isPreview) {
    // Not authenticated - return limited info
    return {
      _id: lesson._id,
      title: lesson.title,
      description: lesson.description,
      type: lesson.type,
      duration: lesson.duration,
      isPreview: lesson.isPreview,
      requiresEnrollment: true,
    };
  }
  
  return lesson;
};

/**
 * Create a new lesson
 * @param {string} moduleId - Module ID
 * @param {string} courseId - Course ID
 * @param {Object} lessonData - Lesson data
 * @param {Object} user - Current user
 * @returns {Promise<Lesson>}
 */
const createLesson = async (moduleId, courseId, lessonData, user) => {
  const course = await Course.findById(courseId);
  
  if (!course) {
    throw ApiError.notFound('Course not found');
  }
  
  // Check ownership
  const isOwner = course.instructor.toString() === user._id.toString();
  const isAdmin = user.role === 'admin';
  
  if (!isOwner && !isAdmin) {
    throw ApiError.forbidden('You do not have permission to add lessons');
  }
  
  const module = await Module.findOne({ _id: moduleId, course: courseId });
  
  if (!module) {
    throw ApiError.notFound('Module not found');
  }
  
  // Get next order number if not provided
  if (lessonData.order === undefined) {
    const lastLesson = await Lesson.findOne({ module: moduleId }).sort({ order: -1 });
    lessonData.order = lastLesson ? lastLesson.order + 1 : 0;
  }
  
  const lesson = await Lesson.create({
    ...lessonData,
    module: moduleId,
    course: courseId,
  });
  
  return lesson;
};

/**
 * Update lesson
 * @param {string} lessonId - Lesson ID
 * @param {string} moduleId - Module ID
 * @param {string} courseId - Course ID
 * @param {Object} updateData - Data to update
 * @param {Object} user - Current user
 * @returns {Promise<Lesson>}
 */
const updateLesson = async (lessonId, moduleId, courseId, updateData, user) => {
  const course = await Course.findById(courseId);
  
  if (!course) {
    throw ApiError.notFound('Course not found');
  }
  
  // Check ownership
  const isOwner = course.instructor.toString() === user._id.toString();
  const isAdmin = user.role === 'admin';
  
  if (!isOwner && !isAdmin) {
    throw ApiError.forbidden('You do not have permission to update this lesson');
  }
  
  const lesson = await Lesson.findOne({ _id: lessonId, module: moduleId, course: courseId });
  
  if (!lesson) {
    throw ApiError.notFound('Lesson not found');
  }
  
  // Handle nested content update
  if (updateData.content) {
    lesson.content = {
      ...lesson.content,
      ...updateData.content,
    };
    delete updateData.content;
  }
  
  Object.assign(lesson, updateData);
  await lesson.save();
  
  return lesson;
};

/**
 * Delete lesson
 * @param {string} lessonId - Lesson ID
 * @param {string} moduleId - Module ID
 * @param {string} courseId - Course ID
 * @param {Object} user - Current user
 * @returns {Promise<void>}
 */
const deleteLesson = async (lessonId, moduleId, courseId, user) => {
  const course = await Course.findById(courseId);
  
  if (!course) {
    throw ApiError.notFound('Course not found');
  }
  
  // Check ownership
  const isOwner = course.instructor.toString() === user._id.toString();
  const isAdmin = user.role === 'admin';
  
  if (!isOwner && !isAdmin) {
    throw ApiError.forbidden('You do not have permission to delete this lesson');
  }
  
  const lesson = await Lesson.findOne({ _id: lessonId, module: moduleId, course: courseId });
  
  if (!lesson) {
    throw ApiError.notFound('Lesson not found');
  }
  
  // Delete progress records for this lesson
  await Progress.deleteMany({ lesson: lessonId });
  
  await lesson.deleteOne();
};

/**
 * Reorder lessons
 * @param {string} moduleId - Module ID
 * @param {string} courseId - Course ID
 * @param {Array} lessonIds - Array of lesson IDs in new order
 * @param {Object} user - Current user
 * @returns {Promise<Array>}
 */
const reorderLessons = async (moduleId, courseId, lessonIds, user) => {
  const course = await Course.findById(courseId);
  
  if (!course) {
    throw ApiError.notFound('Course not found');
  }
  
  // Check ownership
  const isOwner = course.instructor.toString() === user._id.toString();
  const isAdmin = user.role === 'admin';
  
  if (!isOwner && !isAdmin) {
    throw ApiError.forbidden('You do not have permission to reorder lessons');
  }
  
  // Update order for each lesson
  const updates = lessonIds.map((lessonId, index) => ({
    updateOne: {
      filter: { _id: lessonId, module: moduleId },
      update: { order: index },
    },
  }));
  
  await Lesson.bulkWrite(updates);
  
  return getLessons(moduleId);
};

module.exports = {
  getLessons,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
  reorderLessons,
};
