/**
 * Theater Routes
 */

const express = require('express');
const router = express.Router();
const theaterController = require('../controllers/theater.controller');
const { authenticate, adminOrOwner } = require('../middleware/auth.middleware');

// Public routes
router.get('/', theaterController.getTheaters);
router.get('/cities', theaterController.getCities);
router.get('/:id', theaterController.getTheater);
router.get('/screens/:screenId', theaterController.getScreen);

// Admin/Owner routes
router.post('/', authenticate, adminOrOwner, theaterController.createTheater);
router.put('/:id', authenticate, adminOrOwner, theaterController.updateTheater);
router.post('/:theaterId/screens', authenticate, adminOrOwner, theaterController.createScreen);

module.exports = router;
