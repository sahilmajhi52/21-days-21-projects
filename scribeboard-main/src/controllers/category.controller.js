/**
 * Category Controller
 */

const categoryService = require('../services/category.service');
const { sendSuccess, sendCreated, sendPaginated } = require('../utils/response');

const createCategory = async (req, res, next) => {
  try {
    const category = await categoryService.createCategory(req.body);
    sendCreated(res, category, 'Category created successfully');
  } catch (error) {
    next(error);
  }
};

const getCategories = async (req, res, next) => {
  try {
    const { categories, pagination } = await categoryService.getCategories(req.query);
    sendPaginated(res, categories, pagination);
  } catch (error) {
    next(error);
  }
};

const getCategory = async (req, res, next) => {
  try {
    const category = await categoryService.getCategory(req.params.id);
    sendSuccess(res, category);
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const category = await categoryService.updateCategory(req.params.id, req.body);
    sendSuccess(res, category, 'Category updated successfully');
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const result = await categoryService.deleteCategory(req.params.id);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};

const getCategoryPosts = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const { posts, pagination } = await categoryService.getCategoryPosts(categoryId, req.query);
    sendPaginated(res, posts, pagination);
  } catch (error) {
    next(error);
  }
};
module.exports = {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory
};
