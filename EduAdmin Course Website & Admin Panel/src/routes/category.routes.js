const express = require('express');
const { categoryController } = require('../controllers');
const { validate, authenticate, isAdmin, optionalAuth } = require('../middleware');
const { categoryValidation } = require('../validations');

const router = express.Router();

// Public routes
router.get('/', validate(categoryValidation.getCategories), categoryController.getCategories);
router.get('/tree', categoryController.getCategoryTree);
router.get('/slug/:slug', categoryController.getCategoryBySlug);
router.get('/:categoryId', validate(categoryValidation.getCategory), categoryController.getCategory);

// Admin routes
router.post(
  '/',
  authenticate,
  isAdmin,
  validate(categoryValidation.createCategory),
  categoryController.createCategory
);

router.patch(
  '/:categoryId',
  authenticate,
  isAdmin,
  validate(categoryValidation.updateCategory),
  categoryController.updateCategory
);

router.delete(
  '/:categoryId',
  authenticate,
  isAdmin,
  validate(categoryValidation.deleteCategory),
  categoryController.deleteCategory
);

module.exports = router;
