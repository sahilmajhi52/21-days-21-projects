/**
 * Booking Service - Handles seat booking with transactional safety
 * Implements pessimistic locking to prevent double bookings
 */

const prisma = require('../config/database');
const config = require('../config');
const AppError = require('../utils/AppError');
const { generateBookingNumber, getBookingExpiryTime } = require('../utils/helpers');

/**
 * Lock seats for booking (initiates booking process)
 * Uses database transaction with row-level locking
 */
const lockSeatsForBooking = async (userId, showId, seatIds) => {
  // Validate seat count
  if (seatIds.length > config.booking.maxSeatsPerBooking) {
    throw AppError.badRequest(
      `Cannot book more than ${config.booking.maxSeatsPerBooking} seats at once`,
      'MAX_SEATS_EXCEEDED'
    );
  }

  // Use transaction with serializable isolation for race condition safety
  return prisma.$transaction(async (tx) => {
    // Get show details
    const show = await tx.show.findUnique({
      where: { id: showId },
      include: {
        movie: { select: { title: true, duration: true } },
        screen: {
          include: { theater: { select: { name: true, city: true } } },
        },
      },
    });

    if (!show) {
      throw AppError.notFound('Show not found', 'SHOW_NOT_FOUND');
    }

    if (!['SCHEDULED', 'OPEN_FOR_BOOKING', 'ALMOST_FULL'].includes(show.status)) {
      throw AppError.badRequest('Show is not available for booking', 'SHOW_NOT_AVAILABLE');
    }

    // Check if show time has passed
    if (new Date(show.startTime) < new Date()) {
      throw AppError.badRequest('Show has already started', 'SHOW_STARTED');
    }

    // Lock and validate seats using FOR UPDATE
    const showSeats = await tx.$queryRaw`
      SELECT ss.*, s.row, s.number, s.seat_type
      FROM show_seats ss
      JOIN seats s ON ss.seat_id = s.id
      WHERE ss.show_id = ${showId}
      AND ss.seat_id = ANY(${seatIds}::uuid[])
      FOR UPDATE NOWAIT
    `;

    // Validate all seats exist
    if (showSeats.length !== seatIds.length) {
      throw AppError.badRequest('Some seats are invalid', 'INVALID_SEATS');
    }

    // Check seat availability
    const unavailableSeats = showSeats.filter(
      (seat) => seat.status !== 'AVAILABLE'
    );

    if (unavailableSeats.length > 0) {
      const seatNames = unavailableSeats.map((s) => `${s.row}${s.number}`).join(', ');
      throw AppError.conflict(
        `Seats ${seatNames} are no longer available`,
        'SEATS_UNAVAILABLE'
      );
    }

    // Calculate pricing
    const totalAmount = showSeats.reduce((sum, seat) => sum + parseFloat(seat.price), 0);
    const convenienceFee = (totalAmount * config.booking.convenienceFeePercent) / 100;
    const taxes = ((totalAmount + convenienceFee) * config.booking.taxPercent) / 100;
    const finalAmount = totalAmount + convenienceFee + taxes;

    // Create booking
    const booking = await tx.booking.create({
      data: {
        bookingNumber: generateBookingNumber(),
        userId,
        showId,
        totalAmount,
        convenienceFee,
        taxes,
        finalAmount,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        expiresAt: getBookingExpiryTime(config.booking.lockDurationMinutes),
      },
    });

    // Lock seats and create booking seats
    await tx.showSeat.updateMany({
      where: { id: { in: showSeats.map((s) => s.id) } },
      data: {
        status: 'LOCKED',
        lockedAt: new Date(),
        lockedBy: userId,
      },
    });

    // Create booking seat records
    await tx.bookingSeat.createMany({
      data: showSeats.map((seat) => ({
        bookingId: booking.id,
        seatId: seat.seat_id,
        price: seat.price,
      })),
    });

    return {
      booking: {
        id: booking.id,
        bookingNumber: booking.bookingNumber,
        status: booking.status,
        expiresAt: booking.expiresAt,
      },
      show: {
        movie: show.movie.title,
        theater: show.screen.theater.name,
        screen: show.screen.name,
        showDate: show.showDate,
        startTime: show.startTime,
      },
      seats: showSeats.map((s) => ({
        row: s.row,
        number: s.number,
        seatType: s.seat_type,
        price: parseFloat(s.price),
      })),
      pricing: {
        totalAmount: Math.round(totalAmount * 100) / 100,
        convenienceFee: Math.round(convenienceFee * 100) / 100,
        taxes: Math.round(taxes * 100) / 100,
        finalAmount: Math.round(finalAmount * 100) / 100,
      },
      expiresIn: config.booking.lockDurationMinutes * 60, // seconds
    };
  }, {
    isolationLevel: 'Serializable', // Prevents race conditions
    timeout: 10000, // 10 second timeout
  });
};

/**
 * Confirm booking after payment
 */
const confirmBooking = async (bookingId, paymentData) => {
  return prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({
      where: { id: bookingId },
      include: {
        seats: true,
        show: { select: { id: true } },
      },
    });

    if (!booking) {
      throw AppError.notFound('Booking not found', 'BOOKING_NOT_FOUND');
    }

    if (booking.status !== 'PENDING') {
      throw AppError.badRequest(
        `Cannot confirm booking with status: ${booking.status}`,
        'INVALID_BOOKING_STATUS'
      );
    }

    if (new Date() > booking.expiresAt) {
      // Booking expired - release seats
      await releaseExpiredBooking(tx, booking);
      throw AppError.badRequest('Booking has expired', 'BOOKING_EXPIRED');
    }

    // Update booking status
    const confirmedBooking = await tx.booking.update({
      where: { id: bookingId },
      data: {
        status: 'CONFIRMED',
        paymentStatus: 'COMPLETED',
        paymentMethod: paymentData.method,
        paymentId: paymentData.transactionId,
        bookedAt: new Date(),
      },
      include: {
        user: { select: { email: true, firstName: true, phone: true } },
        show: {
          include: {
            movie: { select: { title: true, posterUrl: true } },
            screen: {
              include: { theater: { select: { name: true, address: true, city: true } } },
            },
          },
        },
        seats: {
          include: { seat: true },
        },
      },
    });

    // Mark seats as booked
    await tx.showSeat.updateMany({
      where: {
        showId: booking.show.id,
        seatId: { in: booking.seats.map((s) => s.seatId) },
      },
      data: {
        status: 'BOOKED',
        lockedAt: null,
        lockedBy: null,
      },
    });

    // Update show status if almost full or sold out
    await updateShowStatus(tx, booking.show.id);

    return formatBookingResponse(confirmedBooking);
  });
};

/**
 * Cancel booking
 */
const cancelBooking = async (bookingId, userId, reason) => {
  return prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({
      where: { id: bookingId },
      include: { seats: true, show: true },
    });

    if (!booking) {
      throw AppError.notFound('Booking not found', 'BOOKING_NOT_FOUND');
    }

    if (booking.userId !== userId) {
      throw AppError.forbidden('Not authorized to cancel this booking', 'NOT_AUTHORIZED');
    }

    if (!['PENDING', 'CONFIRMED'].includes(booking.status)) {
      throw AppError.badRequest(
        `Cannot cancel booking with status: ${booking.status}`,
        'INVALID_BOOKING_STATUS'
      );
    }

    // Check cancellation window (e.g., 2 hours before show)
    const showTime = new Date(booking.show.startTime);
    const cancellationDeadline = new Date(showTime.getTime() - 2 * 60 * 60 * 1000);
    
    if (new Date() > cancellationDeadline) {
      throw AppError.badRequest(
        'Cannot cancel booking less than 2 hours before show',
        'CANCELLATION_DEADLINE_PASSED'
      );
    }

    // Update booking
    await tx.booking.update({
      where: { id: bookingId },
      data: {
        status: 'CANCELLED',
        cancellationReason: reason,
        cancelledAt: new Date(),
        paymentStatus: booking.paymentStatus === 'COMPLETED' ? 'REFUNDED' : 'PENDING',
      },
    });

    // Release seats
    await tx.showSeat.updateMany({
      where: {
        showId: booking.showId,
        seatId: { in: booking.seats.map((s) => s.seatId) },
      },
      data: {
        status: 'AVAILABLE',
        lockedAt: null,
        lockedBy: null,
      },
    });

    // Update show status
    await updateShowStatus(tx, booking.showId);

    return {
      message: 'Booking cancelled successfully',
      refundAmount: booking.paymentStatus === 'COMPLETED' ? booking.finalAmount : 0,
    };
  });
};

/**
 * Get user's bookings
 */
const getUserBookings = async (userId, options = {}) => {
  const { page = 1, limit = 10, status } = options;

  const where = { userId };
  if (status) where.status = status;

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      include: {
        show: {
          include: {
            movie: { select: { title: true, posterUrl: true } },
            screen: {
              include: { theater: { select: { name: true, city: true } } },
            },
          },
        },
        seats: {
          include: { seat: { select: { row: true, number: true, seatType: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.booking.count({ where }),
  ]);

  return { bookings: bookings.map(formatBookingResponse), total, page, limit };
};

/**
 * Get booking by ID or booking number
 */
const getBookingDetails = async (identifier, userId) => {
  const where = identifier.startsWith('CB-')
    ? { bookingNumber: identifier }
    : { id: identifier };

  const booking = await prisma.booking.findFirst({
    where,
    include: {
      user: { select: { email: true, firstName: true, lastName: true, phone: true } },
      show: {
        include: {
          movie: { select: { title: true, posterUrl: true, duration: true, certificate: true } },
          screen: {
            include: { theater: { select: { name: true, address: true, city: true } } },
          },
        },
      },
      seats: {
        include: { seat: { select: { row: true, number: true, seatType: true } } },
      },
    },
  });

  if (!booking) {
    throw AppError.notFound('Booking not found', 'BOOKING_NOT_FOUND');
  }

  // Only allow owner or admin to view
  if (userId && booking.userId !== userId) {
    throw AppError.forbidden('Not authorized to view this booking', 'NOT_AUTHORIZED');
  }

  return formatBookingResponse(booking);
};

/**
 * Release expired bookings (cron job)
 */
const releaseExpiredBookings = async () => {
  const expiredBookings = await prisma.booking.findMany({
    where: {
      status: 'PENDING',
      expiresAt: { lt: new Date() },
    },
    include: { seats: true },
  });

  let releasedCount = 0;

  for (const booking of expiredBookings) {
    await prisma.$transaction(async (tx) => {
      await releaseExpiredBooking(tx, booking);
      releasedCount++;
    });
  }

  return { releasedCount };
};

// Helper functions
async function releaseExpiredBooking(tx, booking) {
  await tx.booking.update({
    where: { id: booking.id },
    data: { status: 'EXPIRED' },
  });

  await tx.showSeat.updateMany({
    where: {
      showId: booking.showId,
      seatId: { in: booking.seats.map((s) => s.seatId) },
      status: 'LOCKED',
    },
    data: {
      status: 'AVAILABLE',
      lockedAt: null,
      lockedBy: null,
    },
  });
}

async function updateShowStatus(tx, showId) {
  const seatCounts = await tx.showSeat.groupBy({
    by: ['status'],
    where: { showId },
    _count: { status: true },
  });

  const total = seatCounts.reduce((sum, s) => sum + s._count.status, 0);
  const booked = seatCounts.find((s) => s.status === 'BOOKED')?._count.status || 0;
  const percentBooked = (booked / total) * 100;

  let status = 'OPEN_FOR_BOOKING';
  if (percentBooked >= 100) status = 'SOLD_OUT';
  else if (percentBooked >= 80) status = 'ALMOST_FULL';

  await tx.show.update({
    where: { id: showId },
    data: { status },
  });
}

function formatBookingResponse(booking) {
  return {
    id: booking.id,
    bookingNumber: booking.bookingNumber,
    status: booking.status,
    paymentStatus: booking.paymentStatus,
    show: {
      date: booking.show.showDate,
      time: booking.show.startTime,
      movie: booking.show.movie,
      theater: booking.show.screen.theater,
      screen: booking.show.screen.name,
    },
    seats: booking.seats.map((s) => ({
      row: s.seat.row,
      number: s.seat.number,
      seatType: s.seat.seatType,
      price: parseFloat(s.price),
    })),
    pricing: {
      totalAmount: parseFloat(booking.totalAmount),
      convenienceFee: parseFloat(booking.convenienceFee),
      taxes: parseFloat(booking.taxes),
      finalAmount: parseFloat(booking.finalAmount),
    },
    bookedAt: booking.bookedAt,
    user: booking.user,
  };
}

module.exports = {
  lockSeatsForBooking,
  confirmBooking,
  cancelBooking,
  getUserBookings,
  getBookingDetails,
  releaseExpiredBookings,
};
