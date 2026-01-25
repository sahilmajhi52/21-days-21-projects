const express = require('express');
const { adminController, reviewController } = require('../controllers');
const { authenticate, isAdmin, validate } = require('../middleware');
const { reviewValidation } = require('../validations');

const router = express.Router();

// All routes require admin access
router.use(authenticate, isAdmin);

// Dashboard
router.get('/dashboard', adminController.getDashboardStats);

// Review moderation
router.post('/reviews/:reviewId/approve', validate(reviewValidation.approveReview), reviewController.approveReview);
router.post('/reviews/:reviewId/reject', validate(reviewValidation.approveReview), reviewController.rejectReview);

module.exports = router;
