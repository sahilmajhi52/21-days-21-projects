/**
 * Booking Controller
 */

const bookingService = require('../services/booking.service');
const { success, created, paginated } = require('../utils/response');

/**
 * Initiate booking - locks seats
 */
const initiateBooking = async (req, res, next) => {
  try {
    const { showId, seatIds } = req.body;
    const result = await bookingService.lockSeatsForBooking(
      req.user.userId,
      showId,
      seatIds
    );
    return created(res, result, 'Seats locked. Complete payment to confirm.');
  } catch (error) {
    next(error);
  }
};

/**
 * Confirm booking after payment
 */
const confirmBooking = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const paymentData = req.body;
    const booking = await bookingService.confirmBooking(bookingId, paymentData);
    return success(res, { booking }, 'Booking confirmed!');
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel booking
 */
const cancelBooking = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;
    const result = await bookingService.cancelBooking(bookingId, req.user.userId, reason);
    return success(res, result, 'Booking cancelled');
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's bookings
 */
const getMyBookings = async (req, res, next) => {
  try {
    const result = await bookingService.getUserBookings(req.user.userId, req.query);
    return paginated(res, result.bookings, result, 'Bookings retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * Get booking details
 */
const getBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.getBookingDetails(
      req.params.bookingId,
      req.user?.userId
    );
    return success(res, { booking }, 'Booking retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * Release expired bookings (Admin/Cron)
 */
const releaseExpired = async (req, res, next) => {
  try {
    const result = await bookingService.releaseExpiredBookings();
    return success(res, result, 'Expired bookings released');
  } catch (error) {
    next(error);
  }
};

const getBookings = async (req, res, next) => {
  try {
    const result = await bookingService.getBookings(req.query);
    return paginated(res, result.bookings, result, 'Bookings retrieved');
  } catch (error) {
    next(error);
  }
};   

module.exports = {
  initiateBooking,
  confirmBooking,
  cancelBooking,
  getMyBookings,
  getBooking,
  releaseExpired,
};
