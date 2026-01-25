const express = require('express');
const { authController } = require('../controllers');
const { validate, authenticate, authLimiter } = require('../middleware');
const { authValidation } = require('../validations');

const router = express.Router();

// Public routes
router.post('/register', authLimiter, validate(authValidation.register), authController.register);
router.post('/login', authLimiter, validate(authValidation.login), authController.login);
router.post('/refresh-tokens', validate(authValidation.refreshToken), authController.refreshTokens);
router.post('/logout', validate(authValidation.logout), authController.logout);

// Protected routes
router.get('/profile', authenticate, authController.getProfile);
router.patch('/profile', authenticate, validate(authValidation.updateProfile), authController.updateProfile);
router.post('/change-password', authenticate, validate(authValidation.changePassword), authController.changePassword);

module.exports = router;
