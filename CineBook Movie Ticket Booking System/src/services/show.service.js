/**
 * Show Service - Manages show scheduling and seat availability
 */

const prisma = require('../config/database');
const AppError = require('../utils/AppError');
const { calculateSeatPrice } = require('../utils/helpers');

/**
 * Get shows for a movie in a city on a specific date
 */
const getShowsForMovie = async (movieId, options = {}) => {
  const { city, date = new Date() } = options;

  const showDate = new Date(date);
  showDate.setHours(0, 0, 0, 0);

  const endDate = new Date(showDate);
  endDate.setDate(endDate.getDate() + 1);

  const where = {
    movieId,
    showDate: { gte: showDate, lt: endDate },
    status: { in: ['SCHEDULED', 'OPEN_FOR_BOOKING', 'ALMOST_FULL'] },
  };

  if (city) {
    where.screen = {
      theater: { city: { equals: city, mode: 'insensitive' } },
    };
  }

  const shows = await prisma.show.findMany({
    where,
    include: {
      screen: {
        include: {
          theater: {
            select: { id: true, name: true, city: true, address: true, facilities: true },
          },
        },
      },
      showSeats: {
        select: { status: true },
      },
    },
    orderBy: [{ startTime: 'asc' }],
  });

  // Calculate availability for each show
  return shows.map((show) => {
    const totalSeats = show.showSeats.length;
    const availableSeats = show.showSeats.filter((s) => s.status === 'AVAILABLE').length;
    const bookedSeats = show.showSeats.filter((s) => s.status === 'BOOKED').length;

    return {
      id: show.id,
      startTime: show.startTime,
      endTime: show.endTime,
      status: show.status,
      screen: {
        id: show.screen.id,
        name: show.screen.name,
        screenType: show.screen.screenType,
      },
      theater: show.screen.theater,
      availability: {
        total: totalSeats,
        available: availableSeats,
        booked: bookedSeats,
        percentBooked: totalSeats > 0 ? Math.round((bookedSeats / totalSeats) * 100) : 0,
      },
    };
  });
};

/**
 * Get show details with seat layout and availability
 */
const getShowWithSeats = async (showId) => {
  const show = await prisma.show.findUnique({
    where: { id: showId },
    include: {
      movie: {
        select: { id: true, title: true, duration: true, posterUrl: true, certificate: true },
      },
      screen: {
        include: {
          theater: {
            select: { id: true, name: true, city: true, address: true },
          },
        },
      },
      showSeats: {
        include: {
          seat: true,
        },
        orderBy: [{ seat: { row: 'asc' } }, { seat: { number: 'asc' } }],
      },
    },
  });

  if (!show) {
    throw AppError.notFound('Show not found', 'SHOW_NOT_FOUND');
  }

  // Group seats by row with availability
  const seatsByRow = {};
  show.showSeats.forEach((showSeat) => {
    const row = showSeat.seat.row;
    if (!seatsByRow[row]) seatsByRow[row] = [];
    
    seatsByRow[row].push({
      id: showSeat.id,
      seatId: showSeat.seatId,
      row: showSeat.seat.row,
      number: showSeat.seat.number,
      seatType: showSeat.seat.seatType,
      price: showSeat.price,
      status: showSeat.status,
      isAvailable: showSeat.status === 'AVAILABLE',
    });
  });

  // Price summary by seat type
  const priceByType = {};
  show.showSeats.forEach((showSeat) => {
    const type = showSeat.seat.seatType;
    if (!priceByType[type]) {
      priceByType[type] = parseFloat(showSeat.price);
    }
  });

  return {
    id: show.id,
    showDate: show.showDate,
    startTime: show.startTime,
    endTime: show.endTime,
    status: show.status,
    movie: show.movie,
    screen: {
      id: show.screen.id,
      name: show.screen.name,
      screenType: show.screen.screenType,
      rowCount: show.screen.rowCount,
      columnCount: show.screen.columnCount,
    },
    theater: show.screen.theater,
    seatsByRow,
    priceByType,
    totalSeats: show.showSeats.length,
    availableSeats: show.showSeats.filter((s) => s.status === 'AVAILABLE').length,
  };
};

/**
 * Create a new show (Admin/Theater Owner)
 */
const createShow = async (showData) => {
  const { movieId, screenId, showDate, startTime, basePrice } = showData;

  // Validate movie exists
  const movie = await prisma.movie.findUnique({ where: { id: movieId } });
  if (!movie) {
    throw AppError.notFound('Movie not found', 'MOVIE_NOT_FOUND');
  }

  // Validate screen exists
  const screen = await prisma.screen.findUnique({
    where: { id: screenId },
    include: { seats: true },
  });
  if (!screen) {
    throw AppError.notFound('Screen not found', 'SCREEN_NOT_FOUND');
  }

  // Calculate end time based on movie duration
  const start = new Date(startTime);
  const end = new Date(start.getTime() + movie.duration * 60000 + 15 * 60000); // Add 15 min buffer

  // Check for overlapping shows
  const overlapping = await prisma.show.findFirst({
    where: {
      screenId,
      showDate: new Date(showDate),
      status: { not: 'CANCELLED' },
      OR: [
        { startTime: { lte: start }, endTime: { gt: start } },
        { startTime: { lt: end }, endTime: { gte: end } },
        { startTime: { gte: start }, endTime: { lte: end } },
      ],
    },
  });

  if (overlapping) {
    throw AppError.conflict('Time slot conflicts with another show', 'SHOW_CONFLICT');
  }

  // Check if weekend
  const dayOfWeek = new Date(showDate).getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  // Create show with seats in transaction
  return prisma.$transaction(async (tx) => {
    const show = await tx.show.create({
      data: {
        movieId,
        screenId,
        showDate: new Date(showDate),
        startTime: start,
        endTime: end,
        status: 'OPEN_FOR_BOOKING',
      },
    });

    // Create show seats with pricing
    const showSeatsData = screen.seats.map((seat) => ({
      showId: show.id,
      seatId: seat.id,
      price: calculateSeatPrice(basePrice, seat.seatType, screen.screenType, isWeekend),
      status: 'AVAILABLE',
    }));

    await tx.showSeat.createMany({ data: showSeatsData });

    return tx.show.findUnique({
      where: { id: show.id },
      include: {
        movie: { select: { title: true } },
        screen: {
          include: { theater: { select: { name: true, city: true } } },
        },
        _count: { select: { showSeats: true } },
      },
    });
  });
};

/**
 * Cancel a show
 */
const cancelShow = async (showId, reason) => {
  const show = await prisma.show.findUnique({
    where: { id: showId },
    include: { bookings: { where: { status: 'CONFIRMED' } } },
  });

  if (!show) {
    throw AppError.notFound('Show not found', 'SHOW_NOT_FOUND');
  }

  if (show.status === 'CANCELLED') {
    throw AppError.badRequest('Show is already cancelled', 'ALREADY_CANCELLED');
  }

  // Cancel show and all bookings
  return prisma.$transaction(async (tx) => {
    // Update show status
    await tx.show.update({
      where: { id: showId },
      data: { status: 'CANCELLED' },
    });

    // Cancel all bookings and mark for refund
    if (show.bookings.length > 0) {
      await tx.booking.updateMany({
        where: { showId, status: 'CONFIRMED' },
        data: {
          status: 'CANCELLED',
          cancellationReason: reason || 'Show cancelled by admin',
          cancelledAt: new Date(),
          paymentStatus: 'REFUNDED',
        },
      });
    }

    return { message: 'Show cancelled', refundedBookings: show.bookings.length };
  });
};

/**
 * Get available dates for a movie
 */
const getAvailableDates = async (movieId, city) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const shows = await prisma.show.findMany({
    where: {
      movieId,
      showDate: { gte: today },
      status: { in: ['SCHEDULED', 'OPEN_FOR_BOOKING', 'ALMOST_FULL'] },
      screen: {
        theater: { city: { equals: city, mode: 'insensitive' } },
      },
    },
    select: { showDate: true },
    distinct: ['showDate'],
    orderBy: { showDate: 'asc' },
  });

  return shows.map((s) => s.showDate);
};

module.exports = {
  getShowsForMovie,
  getShowWithSeats,
  createShow,
  cancelShow,
  getAvailableDates,
};
