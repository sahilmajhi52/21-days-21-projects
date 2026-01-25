const { categoryService } = require('../services');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');

/**
 * Get all categories
 */
const getCategories = catchAsync(async (req, res) => {
  const { categories, pagination } = await categoryService.getCategories(req.query);
  
  ApiResponse.paginated(res, categories, pagination, 'Categories retrieved successfully');
});

/**
 * Get category tree
 */
const getCategoryTree = catchAsync(async (req, res) => {
  const tree = await categoryService.getCategoryTree();
  
  ApiResponse.success(res, 200, 'Category tree retrieved successfully', { categories: tree });
});

/**
 * Get category by ID
 */
const getCategory = catchAsync(async (req, res) => {
  const category = await categoryService.getCategoryById(req.params.categoryId);
  
  ApiResponse.success(res, 200, 'Category retrieved successfully', { category });
});

/**
 * Get category by slug
 */
const getCategoryBySlug = catchAsync(async (req, res) => {
  const category = await categoryService.getCategoryBySlug(req.params.slug);
  
  ApiResponse.success(res, 200, 'Category retrieved successfully', { category });
});

/**
 * Create category (admin)
 */
const createCategory = catchAsync(async (req, res) => {
  const category = await categoryService.createCategory(req.body);
  
  ApiResponse.success(res, 201, 'Category created successfully', { category });
});

/**
 * Update category (admin)
 */
const updateCategory = catchAsync(async (req, res) => {
  const category = await categoryService.updateCategory(req.params.categoryId, req.body);
  
  ApiResponse.success(res, 200, 'Category updated successfully', { category });
});

/**
 * Delete category (admin)
 */
const deleteCategory = catchAsync(async (req, res) => {
  await categoryService.deleteCategory(req.params.categoryId);
  
  ApiResponse.success(res, 200, 'Category deleted successfully');
});

module.exports = {
  getCategories,
  getCategoryTree,
  getCategory,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
};
