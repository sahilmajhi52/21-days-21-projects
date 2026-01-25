/**
 * Show Routes
 */

const express = require('express');
const router = express.Router();
const showController = require('../controllers/show.controller');
const { authenticate, adminOrOwner } = require('../middleware/auth.middleware');

// Public routes
router.get('/:showId', showController.getShowWithSeats);

// Admin/Owner routes
router.post('/', authenticate, adminOrOwner, showController.createShow);
router.post('/:showId/cancel', authenticate, adminOrOwner, showController.cancelShow);

module.exports = router;
