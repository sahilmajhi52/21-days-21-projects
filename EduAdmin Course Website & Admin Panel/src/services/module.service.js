const { Module, Course, Lesson } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Get modules for a course
 * @param {string} courseId - Course ID
 * @param {Object} query - Query parameters
 * @returns {Promise<Array>}
 */
const getModules = async (courseId, query = {}) => {
  const filter = { course: courseId };
  
  if (query.isPublished !== undefined) {
    filter.isPublished = query.isPublished;
  }
  
  return Module.find(filter)
    .populate('lessons')
    .populate('lessonCount')
    .sort({ order: 1 });
};

/**
 * Get module by ID
 * @param {string} moduleId - Module ID
 * @param {string} courseId - Course ID
 * @returns {Promise<Module>}
 */
const getModuleById = async (moduleId, courseId) => {
  const module = await Module.findOne({ _id: moduleId, course: courseId })
    .populate('lessons')
    .populate('lessonCount');
  
  if (!module) {
    throw ApiError.notFound('Module not found');
  }
  
  return module;
};

/**
 * Create a new module
 * @param {string} courseId - Course ID
 * @param {Object} moduleData - Module data
 * @param {Object} user - Current user
 * @returns {Promise<Module>}
 */
const createModule = async (courseId, moduleData, user) => {
  const course = await Course.findById(courseId);
  
  if (!course) {
    throw ApiError.notFound('Course not found');
  }
  
  // Check ownership
  const isOwner = course.instructor.toString() === user._id.toString();
  const isAdmin = user.role === 'admin';
  
  if (!isOwner && !isAdmin) {
    throw ApiError.forbidden('You do not have permission to add modules to this course');
  }
  
  // Get next order number if not provided
  if (moduleData.order === undefined) {
    const lastModule = await Module.findOne({ course: courseId }).sort({ order: -1 });
    moduleData.order = lastModule ? lastModule.order + 1 : 0;
  }
  
  const module = await Module.create({
    ...moduleData,
    course: courseId,
  });
  
  return module;
};

/**
 * Update module
 * @param {string} moduleId - Module ID
 * @param {string} courseId - Course ID
 * @param {Object} updateData - Data to update
 * @param {Object} user - Current user
 * @returns {Promise<Module>}
 */
const updateModule = async (moduleId, courseId, updateData, user) => {
  const course = await Course.findById(courseId);
  
  if (!course) {
    throw ApiError.notFound('Course not found');
  }
  
  // Check ownership
  const isOwner = course.instructor.toString() === user._id.toString();
  const isAdmin = user.role === 'admin';
  
  if (!isOwner && !isAdmin) {
    throw ApiError.forbidden('You do not have permission to update this module');
  }
  
  const module = await Module.findOne({ _id: moduleId, course: courseId });
  
  if (!module) {
    throw ApiError.notFound('Module not found');
  }
  
  Object.assign(module, updateData);
  await module.save();
  
  return module;
};

/**
 * Delete module
 * @param {string} moduleId - Module ID
 * @param {string} courseId - Course ID
 * @param {Object} user - Current user
 * @returns {Promise<void>}
 */
const deleteModule = async (moduleId, courseId, user) => {
  const course = await Course.findById(courseId);
  
  if (!course) {
    throw ApiError.notFound('Course not found');
  }
  
  // Check ownership
  const isOwner = course.instructor.toString() === user._id.toString();
  const isAdmin = user.role === 'admin';
  
  if (!isOwner && !isAdmin) {
    throw ApiError.forbidden('You do not have permission to delete this module');
  }
  
  const module = await Module.findOne({ _id: moduleId, course: courseId });
  
  if (!module) {
    throw ApiError.notFound('Module not found');
  }
  
  // Delete module (lessons are deleted by middleware)
  await module.deleteOne();
  
  // Update course duration
  await course.updateDuration();
};

/**
 * Reorder modules
 * @param {string} courseId - Course ID
 * @param {Array} moduleIds - Array of module IDs in new order
 * @param {Object} user - Current user
 * @returns {Promise<Array>}
 */
const reorderModules = async (courseId, moduleIds, user) => {
  const course = await Course.findById(courseId);
  
  if (!course) {
    throw ApiError.notFound('Course not found');
  }
  
  // Check ownership
  const isOwner = course.instructor.toString() === user._id.toString();
  const isAdmin = user.role === 'admin';
  
  if (!isOwner && !isAdmin) {
    throw ApiError.forbidden('You do not have permission to reorder modules');
  }
  
  // Update order for each module
  const updates = moduleIds.map((moduleId, index) => ({
    updateOne: {
      filter: { _id: moduleId, course: courseId },
      update: { order: index },
    },
  }));
  
  await Module.bulkWrite(updates);
  
  return getModules(courseId);
};

module.exports = {
  getModules,
  getModuleById,
  createModule,
  updateModule,
  deleteModule,
  reorderModules,
};
