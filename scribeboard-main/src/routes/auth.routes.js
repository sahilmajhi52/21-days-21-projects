/**
 * Authentication Routes
 */

const express = require('express');
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const authValidator = require('../validators/auth.validator');

const router = express.Router();

// Public routes
router.post('/register', validate(authValidator.register), authController.register);
router.post('/login', validate(authValidator.login), authController.login);
router.post('/refresh-tokens', validate(authValidator.refreshTokens), authController.refreshTokens);
router.post('/logout', authController.logout);

// Protected routes
router.get('/profile', authenticate, authController.getProfile);
router.patch('/profile', authenticate, validate(authValidator.updateProfile), authController.updateProfile);
router.post('/change-password', authenticate, validate(authValidator.changePassword), authController.changePassword);

module.exports = router;
