/**
 * Movie Controller
 */

const movieService = require('../services/movie.service');
const { success, created, paginated } = require('../utils/response');

const getMovies = async (req, res, next) => {
  try {
    const result = await movieService.getMovies(req.query);
    return paginated(res, result.movies, result, 'Movies retrieved');
  } catch (error) {
    next(error);
  }
};

const getMovie = async (req, res, next) => {
  try {
    const movie = await movieService.getMovieByIdOrSlug(req.params.id);
    return success(res, { movie }, 'Movie retrieved');
  } catch (error) {
    next(error);
  }
};

const createMovie = async (req, res, next) => {
  try {
    const movie = await movieService.createMovie(req.body);
    return created(res, { movie }, 'Movie created');
  } catch (error) {
    next(error);
  }
};

const updateMovie = async (req, res, next) => {
  try {
    const movie = await movieService.updateMovie(req.params.id, req.body);
    return success(res, { movie }, 'Movie updated');
  } catch (error) {
    next(error);
  }
};

const deleteMovie = async (req, res, next) => {
  try {
    await movieService.deleteMovie(req.params.id);
    return success(res, null, 'Movie deleted');
  } catch (error) {
    next(error);
  }
};

const getMoviesByCity = async (req, res, next) => {
  try {
    const { city } = req.params;
    const { date } = req.query;
    const movies = await movieService.getMoviesByCity(city, date);
    return success(res, { movies }, 'Movies retrieved');
  } catch (error) {
    next(error);
  }
};

const getMovieShows = async (req, res, next) => {
  try {
    const { movieId } = req.params;
    const { date } = req.query;
    const shows = await movieService.getMovieShows(movieId, date);
    return success(res, { shows }, 'Movie shows retrieved');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMovies,
  getMovie,
  createMovie,
  updateMovie,
  deleteMovie,
  getMoviesByCity,
};
