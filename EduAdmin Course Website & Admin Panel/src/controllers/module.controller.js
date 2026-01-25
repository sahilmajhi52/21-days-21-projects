const { moduleService } = require('../services');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');

/**
 * Get all modules for a course
 */
const getModules = catchAsync(async (req, res) => {
  const modules = await moduleService.getModules(req.params.courseId, req.query);
  
  ApiResponse.success(res, 200, 'Modules retrieved successfully', { modules });
});

/**
 * Get module by ID
 */
const getModule = catchAsync(async (req, res) => {
  const module = await moduleService.getModuleById(req.params.moduleId, req.params.courseId);
  
  ApiResponse.success(res, 200, 'Module retrieved successfully', { module });
});

/**
 * Create module
 */
const createModule = catchAsync(async (req, res) => {
  const module = await moduleService.createModule(req.params.courseId, req.body, req.user);
  
  ApiResponse.success(res, 201, 'Module created successfully', { module });
});

/**
 * Update module
 */
const updateModule = catchAsync(async (req, res) => {
  const module = await moduleService.updateModule(
    req.params.moduleId,
    req.params.courseId,
    req.body,
    req.user
  );
  
  ApiResponse.success(res, 200, 'Module updated successfully', { module });
});

/**
 * Delete module
 */
const deleteModule = catchAsync(async (req, res) => {
  await moduleService.deleteModule(req.params.moduleId, req.params.courseId, req.user);
  
  ApiResponse.success(res, 200, 'Module deleted successfully');
});

/**
 * Reorder modules
 */
const reorderModules = catchAsync(async (req, res) => {
  const modules = await moduleService.reorderModules(
    req.params.courseId,
    req.body.moduleIds,
    req.user
  );
  
  ApiResponse.success(res, 200, 'Modules reordered successfully', { modules });
});

module.exports = {
  getModules,
  getModule,
  createModule,
  updateModule,
  deleteModule,
  reorderModules,
};
