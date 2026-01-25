/**
 * Movie Service
 */

const prisma = require('../config/database');
const AppError = require('../utils/AppError');
const { generateSlug } = require('../utils/helpers');

/**
 * Get all movies with pagination and filters
 */
const getMovies = async (options = {}) => {
  const {
    page = 1,
    limit = 10,
    search,
    genre,
    language,
    city,
    isNowShowing = true,
  } = options;

  const where = { isActive: true };

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { director: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (genre) {
    where.genre = { has: genre };
  }

  if (language) {
    where.language = language;
  }

  // Now showing: movies with shows today or future
  if (isNowShowing) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    where.shows = {
      some: {
        showDate: { gte: today },
        status: { not: 'CANCELLED' },
      },
    };
  }

  const [movies, total] = await Promise.all([
    prisma.movie.findMany({
      where,
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        duration: true,
        genre: true,
        language: true,
        releaseDate: true,
        rating: true,
        posterUrl: true,
        certificate: true,
        director: true,
        _count: { select: { shows: true } },
      },
      orderBy: { releaseDate: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.movie.count({ where }),
  ]);

  return { movies, total, page, limit };
};

/**
 * Get movie by ID or slug
 */
const getMovieByIdOrSlug = async (identifier) => {
  const where = identifier.includes('-') 
    ? { slug: identifier } 
    : { id: identifier };

  const movie = await prisma.movie.findFirst({
    where: { ...where, isActive: true },
    include: {
      shows: {
        where: {
          showDate: { gte: new Date() },
          status: { in: ['SCHEDULED', 'OPEN_FOR_BOOKING', 'ALMOST_FULL'] },
        },
        include: {
          screen: {
            include: {
              theater: {
                select: { id: true, name: true, city: true, address: true },
              },
            },
          },
        },
        orderBy: [{ showDate: 'asc' }, { startTime: 'asc' }],
      },
    },
  });

  if (!movie) {
    throw AppError.notFound('Movie not found', 'MOVIE_NOT_FOUND');
  }

  return movie;
};

/**
 * Create movie (Admin only)
 */
const createMovie = async (movieData) => {
  const slug = generateSlug(movieData.title);

  // Check if slug exists
  const existing = await prisma.movie.findUnique({ where: { slug } });
  if (existing) {
    throw AppError.conflict('Movie with similar title already exists', 'MOVIE_EXISTS');
  }

  const movie = await prisma.movie.create({
    data: {
      ...movieData,
      slug,
      releaseDate: new Date(movieData.releaseDate),
      endDate: movieData.endDate ? new Date(movieData.endDate) : null,
    },
  });

  return movie;
};

/**
 * Update movie (Admin only)
 */
const updateMovie = async (id, updateData) => {
  const movie = await prisma.movie.findUnique({ where: { id } });
  if (!movie) {
    throw AppError.notFound('Movie not found', 'MOVIE_NOT_FOUND');
  }

  // Update slug if title changed
  if (updateData.title && updateData.title !== movie.title) {
    updateData.slug = generateSlug(updateData.title);
  }

  return prisma.movie.update({
    where: { id },
    data: updateData,
  });
};

/**
 * Delete movie (soft delete)
 */
const deleteMovie = async (id) => {
  const movie = await prisma.movie.findUnique({ where: { id } });
  if (!movie) {
    throw AppError.notFound('Movie not found', 'MOVIE_NOT_FOUND');
  }

  return prisma.movie.update({
    where: { id },
    data: { isActive: false },
  });
};

/**
 * Get movies showing in a city
 */
const getMoviesByCity = async (city, date = new Date()) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const movies = await prisma.movie.findMany({
    where: {
      isActive: true,
      shows: {
        some: {
          showDate: { gte: startOfDay },
          status: { in: ['SCHEDULED', 'OPEN_FOR_BOOKING', 'ALMOST_FULL'] },
          screen: {
            theater: {
              city: { equals: city, mode: 'insensitive' },
            },
          },
        },
      },
    },
    select: {
      id: true,
      title: true,
      slug: true,
      posterUrl: true,
      genre: true,
      language: true,
      duration: true,
      rating: true,
      certificate: true,
    },
  });

  return movies;
};

module.exports = {
  getMovies,
  getMovieByIdOrSlug,
  createMovie,
  updateMovie,
  deleteMovie,
  getMoviesByCity,
};
