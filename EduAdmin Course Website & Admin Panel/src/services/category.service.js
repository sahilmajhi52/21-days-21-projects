const { Category, Course } = require('../models');
const ApiError = require('../utils/ApiError');
const { getPagination, getPaginationResult, getSort } = require('../utils/pagination');

/**
 * Get categories with pagination and filtering
 * @param {Object} query - Query parameters
 * @returns {Promise<Object>} Categories and pagination info
 */
const getCategories = async (query) => {
  const { page, limit, skip } = getPagination(query);
  const sort = getSort(query.sort, ['name', 'order', 'createdAt']);
  
  // Build filter
  const filter = {};
  
  if (query.isActive !== undefined) {
    filter.isActive = query.isActive;
  }
  
  if (query.parent !== undefined) {
    filter.parent = query.parent || null;
  }
  
  if (query.search) {
    filter.name = { $regex: query.search, $options: 'i' };
  }
  
  const [categories, totalResults] = await Promise.all([
    Category.find(filter)
      .populate('parent', 'name slug')
      .populate('courseCount')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Category.countDocuments(filter),
  ]);
  
  const pagination = getPaginationResult(page, limit, totalResults);
  
  return { categories, pagination };
};

/**
 * Get all categories as tree structure
 * @returns {Promise<Array>}
 */
const getCategoryTree = async () => {
  const categories = await Category.find({ isActive: true })
    .populate('courseCount')
    .sort({ order: 1, name: 1 });
  
  // Build tree structure
  const map = {};
  const roots = [];
  
  categories.forEach((cat) => {
    map[cat._id] = { ...cat.toObject(), children: [] };
  });
  
  categories.forEach((cat) => {
    if (cat.parent) {
      if (map[cat.parent]) {
        map[cat.parent].children.push(map[cat._id]);
      }
    } else {
      roots.push(map[cat._id]);
    }
  });
  
  return roots;
};

/**
 * Get category by ID
 * @param {string} categoryId - Category ID
 * @returns {Promise<Category>}
 */
const getCategoryById = async (categoryId) => {
  const category = await Category.findById(categoryId)
    .populate('parent', 'name slug')
    .populate('subcategories')
    .populate('courseCount');
  
  if (!category) {
    throw ApiError.notFound('Category not found');
  }
  
  return category;
};

/**
 * Get category by slug
 * @param {string} slug - Category slug
 * @returns {Promise<Category>}
 */
const getCategoryBySlug = async (slug) => {
  const category = await Category.findOne({ slug })
    .populate('parent', 'name slug')
    .populate('subcategories')
    .populate('courseCount');
  
  if (!category) {
    throw ApiError.notFound('Category not found');
  }
  
  return category;
};

/**
 * Create a new category
 * @param {Object} categoryData - Category data
 * @returns {Promise<Category>}
 */
const createCategory = async (categoryData) => {
  // Check if name already exists
  const existing = await Category.findOne({ name: categoryData.name });
  if (existing) {
    throw ApiError.conflict('Category name already exists');
  }
  
  // If parent is provided, verify it exists
  if (categoryData.parent) {
    const parent = await Category.findById(categoryData.parent);
    if (!parent) {
      throw ApiError.notFound('Parent category not found');
    }
  }
  
  return Category.create(categoryData);
};

/**
 * Update category
 * @param {string} categoryId - Category ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Category>}
 */
const updateCategory = async (categoryId, updateData) => {
  const category = await Category.findById(categoryId);
  
  if (!category) {
    throw ApiError.notFound('Category not found');
  }
  
  // Check name uniqueness if name is being updated
  if (updateData.name && updateData.name !== category.name) {
    const existing = await Category.findOne({ name: updateData.name });
    if (existing) {
      throw ApiError.conflict('Category name already exists');
    }
  }
  
  // Prevent setting itself as parent
  if (updateData.parent && updateData.parent.toString() === categoryId) {
    throw ApiError.badRequest('Category cannot be its own parent');
  }
  
  Object.assign(category, updateData);
  await category.save();
  
  return category;
};

/**
 * Delete category
 * @param {string} categoryId - Category ID
 * @returns {Promise<void>}
 */
const deleteCategory = async (categoryId) => {
  const category = await Category.findById(categoryId);
  
  if (!category) {
    throw ApiError.notFound('Category not found');
  }
  
  // Check if category has courses
  const courseCount = await Course.countDocuments({ category: categoryId });
  if (courseCount > 0) {
    throw ApiError.badRequest('Cannot delete category with courses');
  }
  
  // Check if category has subcategories
  const subCount = await Category.countDocuments({ parent: categoryId });
  if (subCount > 0) {
    throw ApiError.badRequest('Cannot delete category with subcategories');
  }
  
  await category.deleteOne();
};

module.exports = {
  getCategories,
  getCategoryTree,
  getCategoryById,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
};
