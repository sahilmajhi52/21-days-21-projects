/**
 * Theater Controller
 */

const theaterService = require('../services/theater.service');
const { success, created, paginated } = require('../utils/response');

const getTheaters = async (req, res, next) => {
  try {
    const result = await theaterService.getTheaters(req.query);
    return paginated(res, result.theaters, result, 'Theaters retrieved');
  } catch (error) {
    next(error);
  }
};

const getTheater = async (req, res, next) => {
  try {
    const theater = await theaterService.getTheaterByIdOrSlug(req.params.id);
    return success(res, { theater }, 'Theater retrieved');
  } catch (error) {
    next(error);
  }
};

const createTheater = async (req, res, next) => {
  try {
    const theater = await theaterService.createTheater(req.body);
    return created(res, { theater }, 'Theater created');
  } catch (error) {
    next(error);
  }
};

const updateTheater = async (req, res, next) => {
  try {
    const theater = await theaterService.updateTheater(req.params.id, req.body);
    return success(res, { theater }, 'Theater updated');
  } catch (error) {
    next(error);
  }
};

const createScreen = async (req, res, next) => {
  try {
    const screen = await theaterService.createScreen(req.params.theaterId, req.body);
    return created(res, { screen }, 'Screen created with seats');
  } catch (error) {
    next(error);
  }
};

const getScreen = async (req, res, next) => {
  try {
    const screen = await theaterService.getScreenWithSeats(req.params.screenId);
    return success(res, { screen }, 'Screen retrieved');
  } catch (error) {
    next(error);
  }
};

const getCities = async (req, res, next) => {
  try {
    const cities = await theaterService.getCitiesWithTheaters();
    return success(res, { cities }, 'Cities retrieved');
  } catch (error) {
    next(error);
  }
};

const getAvailableDates = async (req, res, next) => {
  try {
    const { theaterId } = req.params;
    const { movieId } = req.query;
    const dates = await theaterService.getAvailableDates(theaterId, movieId);
    return success(res, { dates }, 'Available dates retrieved');
  } catch (error) {
    next(error);
  }
};

const getTheaterShows = async (req, res, next) => {
  try {
    const { theaterId } = req.params;
    const { movieId } = req.query;
    const shows = await theaterService.getTheaterShows(theaterId, movieId);
    return success(res, { shows }, 'Theater shows retrieved');
  } catch (error) {
    next(error);
  }
};



module.exports = {
  getTheaters,
  getTheater,
  createTheater,
  updateTheater,
  createScreen,
  getScreen,
  getCities,
};
