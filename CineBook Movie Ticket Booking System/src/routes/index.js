/**
 * API Routes Index
 */

const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const movieRoutes = require('./movie.routes');
const theaterRoutes = require('./theater.routes');
const showRoutes = require('./show.routes');
const bookingRoutes = require('./booking.routes');

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'CineBook API is running',
    timestamp: new Date().toISOString(),
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/movies', movieRoutes);
router.use('/theaters', theaterRoutes);
router.use('/shows', showRoutes);
router.use('/bookings', bookingRoutes);

module.exports = router;
