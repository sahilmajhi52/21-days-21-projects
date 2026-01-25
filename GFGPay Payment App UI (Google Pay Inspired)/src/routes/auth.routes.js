const express = require('express');
const { authController } = require('../controllers');
const { validate, authenticate, authLimiter } = require('../middleware');
const { authValidation } = require('../validations');

const router = express.Router();

// Public routes
router.post('/register', authLimiter, validate(authValidation.register), authController.register);
router.post('/login', authLimiter, validate(authValidation.login), authController.login);
router.post('/login/email', authLimiter, validate(authValidation.loginWithEmail), authController.loginWithEmail);
router.post('/refresh-tokens', validate(authValidation.refreshToken), authController.refreshTokens);
router.post('/logout', authController.logout);

// Protected routes
router.get('/profile', authenticate, authController.getProfile);
router.post('/pin/set', authenticate, validate(authValidation.setPin), authController.setPin);
router.post('/pin/change', authenticate, validate(authValidation.changePin), authController.changePin);
router.post('/password/change', authenticate, validate(authValidation.changePassword), authController.changePassword);

module.exports = router;
