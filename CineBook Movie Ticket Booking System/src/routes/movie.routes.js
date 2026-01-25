/**
 * Movie Routes
 */

const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movie.controller');
const showController = require('../controllers/show.controller');
const { authenticate, adminOnly } = require('../middleware/auth.middleware');

// Public routes
router.get('/', movieController.getMovies);
router.get('/city/:city', movieController.getMoviesByCity);
router.get('/:id', movieController.getMovie);
router.get('/:movieId/shows', showController.getShowsForMovie);
router.get('/:movieId/dates', showController.getAvailableDates);

// Admin routes
router.post('/', authenticate, adminOnly, movieController.createMovie);
router.put('/:id', authenticate, adminOnly, movieController.updateMovie);
router.delete('/:id', authenticate, adminOnly, movieController.deleteMovie);

module.exports = router;
