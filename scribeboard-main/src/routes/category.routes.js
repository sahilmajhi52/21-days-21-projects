/**
 * Category Routes
 */

const express = require('express');
const categoryController = require('../controllers/category.controller');
const { authenticate, editorOrAdmin } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const categoryValidator = require('../validators/category.validator');

const router = express.Router();

// Public routes
router.get('/', categoryController.getCategories);
router.get('/:id', categoryController.getCategory);

// Protected routes (Editor/Admin only)
router.post('/', authenticate, editorOrAdmin, validate(categoryValidator.createCategory), categoryController.createCategory);
router.patch('/:id', authenticate, editorOrAdmin, validate(categoryValidator.updateCategory), categoryController.updateCategory);
router.delete('/:id', authenticate, editorOrAdmin, categoryController.deleteCategory);

module.exports = router;
