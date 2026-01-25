/**
 * Authentication Routes
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const {
  registerValidator,
  loginValidator,
  refreshTokenValidator,
  changePasswordValidator,
} = require('../validators/auth.validator');

// Public routes
router.post('/register', registerValidator, validate, authController.register);
router.post('/login', loginValidator, validate, authController.login);
router.post('/refresh', refreshTokenValidator, validate, authController.refreshToken);

// Protected routes
router.use(authenticate);

router.post('/logout', authController.logout);
router.post('/logout-all', authController.logoutAll);
router.post('/change-password', changePasswordValidator, validate, authController.changePassword);
router.get('/me', authController.getMe);
router.get('/sessions', authController.getActiveSessions);

module.exports = router;
