/**
 * Booking Routes
 */

const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');
const { authenticate, adminOnly } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const {
  initiateBookingValidator,
  confirmBookingValidator,
  cancelBookingValidator,
} = require('../validators/booking.validator');

// All booking routes require authentication
router.use(authenticate);

// Customer routes
router.post('/', initiateBookingValidator, validate, bookingController.initiateBooking);
router.post('/:bookingId/confirm', confirmBookingValidator, validate, bookingController.confirmBooking);
router.post('/:bookingId/cancel', cancelBookingValidator, validate, bookingController.cancelBooking);
router.get('/my-bookings', bookingController.getMyBookings);
router.get('/:bookingId', bookingController.getBooking);
router.get('/:movieId/shows', bookingController.getMovieShows);
router.get('/:theaterId/shows', bookingController.getTheaterShows);
router.get('/:showId/seats', bookingController.getShowSeats);

// Admin routes
router.post('/release-expired', adminOnly, bookingController.releaseExpired);

module.exports = router;
