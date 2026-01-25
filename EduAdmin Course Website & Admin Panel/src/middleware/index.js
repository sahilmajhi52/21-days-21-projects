const authMiddleware = require('./auth.middleware');
const validate = require('./validate.middleware');
const { errorConverter, errorHandler, notFound } = require('./error.middleware');
const { generalLimiter, authLimiter, createLimiter } = require('./rateLimiter.middleware');

module.exports = {
  ...authMiddleware,
  validate,
  errorConverter,
  errorHandler,
  notFound,
  generalLimiter,
  authLimiter,
  createLimiter,
};
