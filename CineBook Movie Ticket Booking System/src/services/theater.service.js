/**
 * Theater Service
 */

const prisma = require('../config/database');
const AppError = require('../utils/AppError');
const { generateSlug, generateSeatLayout } = require('../utils/helpers');

/**
 * Get all theaters with filters
 */
const getTheaters = async (options = {}) => {
  const { page = 1, limit = 10, city, search } = options;

  const where = { isActive: true };

  if (city) {
    where.city = { equals: city, mode: 'insensitive' };
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { address: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [theaters, total] = await Promise.all([
    prisma.theater.findMany({
      where,
      include: {
        screens: {
          where: { isActive: true },
          select: { id: true, name: true, screenType: true, totalSeats: true },
        },
        _count: { select: { screens: true } },
      },
      orderBy: { name: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.theater.count({ where }),
  ]);

  return { theaters, total, page, limit };
};

/**
 * Get theater by ID or slug
 */
const getTheaterByIdOrSlug = async (identifier) => {
  const where = identifier.includes('-') 
    ? { slug: identifier } 
    : { id: identifier };

  const theater = await prisma.theater.findFirst({
    where: { ...where, isActive: true },
    include: {
      screens: {
        where: { isActive: true },
        include: {
          _count: { select: { seats: true } },
        },
      },
    },
  });

  if (!theater) {
    throw AppError.notFound('Theater not found', 'THEATER_NOT_FOUND');
  }

  return theater;
};

/**
 * Create theater (Admin only)
 */
const createTheater = async (theaterData) => {
  const slug = generateSlug(theaterData.name + '-' + theaterData.city);

  const existing = await prisma.theater.findUnique({ where: { slug } });
  if (existing) {
    throw AppError.conflict('Theater already exists', 'THEATER_EXISTS');
  }

  return prisma.theater.create({
    data: { ...theaterData, slug },
  });
};

/**
 * Update theater
 */
const updateTheater = async (id, updateData) => {
  const theater = await prisma.theater.findUnique({ where: { id } });
  if (!theater) {
    throw AppError.notFound('Theater not found', 'THEATER_NOT_FOUND');
  }

  return prisma.theater.update({
    where: { id },
    data: updateData,
  });
};

/**
 * Create screen with seats
 */
const createScreen = async (theaterId, screenData) => {
  const theater = await prisma.theater.findUnique({ where: { id: theaterId } });
  if (!theater) {
    throw AppError.notFound('Theater not found', 'THEATER_NOT_FOUND');
  }

  const { name, screenType, rowCount, columnCount } = screenData;
  const totalSeats = rowCount * columnCount;

  // Create screen with seats in transaction
  return prisma.$transaction(async (tx) => {
    // Create screen
    const screen = await tx.screen.create({
      data: {
        theaterId,
        name,
        screenType,
        totalSeats,
        rowCount,
        columnCount,
      },
    });

    // Generate and create seats
    const seatLayout = generateSeatLayout(rowCount, columnCount);
    const seatsData = seatLayout.map((seat) => ({
      screenId: screen.id,
      ...seat,
    }));

    await tx.seat.createMany({ data: seatsData });

    return tx.screen.findUnique({
      where: { id: screen.id },
      include: { seats: true },
    });
  });
};

/**
 * Get screen with seat layout
 */
const getScreenWithSeats = async (screenId) => {
  const screen = await prisma.screen.findUnique({
    where: { id: screenId },
    include: {
      theater: { select: { id: true, name: true, city: true } },
      seats: {
        where: { isActive: true },
        orderBy: [{ row: 'asc' }, { number: 'asc' }],
      },
    },
  });

  if (!screen) {
    throw AppError.notFound('Screen not found', 'SCREEN_NOT_FOUND');
  }

  // Group seats by row
  const seatsByRow = screen.seats.reduce((acc, seat) => {
    if (!acc[seat.row]) acc[seat.row] = [];
    acc[seat.row].push(seat);
    return acc;
  }, {});

  return { ...screen, seatsByRow };
};

/**
 * Get cities with theaters
 */
const getCitiesWithTheaters = async () => {
  const cities = await prisma.theater.groupBy({
    by: ['city'],
    where: { isActive: true },
    _count: { city: true },
    orderBy: { city: 'asc' },
  });

  return cities.map((c) => ({ city: c.city, theaterCount: c._count.city }));
};

module.exports = {
  getTheaters,
  getTheaterByIdOrSlug,
  createTheater,
  updateTheater,
  createScreen,
  getScreenWithSeats,
  getCitiesWithTheaters,
};
