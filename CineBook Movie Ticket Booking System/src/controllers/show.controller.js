/**
 * Show Controller
 */

const showService = require('../services/show.service');
const { success, created } = require('../utils/response');

const getShowsForMovie = async (req, res, next) => {
  try {
    const { movieId } = req.params;
    const { city, date } = req.query;
    const shows = await showService.getShowsForMovie(movieId, { city, date });
    return success(res, { shows }, 'Shows retrieved');
  } catch (error) {
    next(error);
  }
};

const getShowWithSeats = async (req, res, next) => {
  try {
    const show = await showService.getShowWithSeats(req.params.showId);
    return success(res, { show }, 'Show details retrieved');
  } catch (error) {
    next(error);
  }
};

const createShow = async (req, res, next) => {
  try {
    const show = await showService.createShow(req.body);
    return created(res, { show }, 'Show created');
  } catch (error) {
    next(error);
  }
};

const cancelShow = async (req, res, next) => {
  try {
    const result = await showService.cancelShow(req.params.showId, req.body.reason);
    return success(res, result, 'Show cancelled');
  } catch (error) {
    next(error);
  }
};

const getAvailableDates = async (req, res, next) => {
  try {
    const { movieId } = req.params;
    const { city } = req.query;
    const dates = await showService.getAvailableDates(movieId, city);
    return success(res, { dates }, 'Available dates retrieved');
  } catch (error) {
    next(error);
  }
};


module.exports = {
  getShowsForMovie,
  getShowWithSeats,
  createShow,
  cancelShow,
  getAvailableDates,
};
