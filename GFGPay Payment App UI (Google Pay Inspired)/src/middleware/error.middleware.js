const mongoose = require('mongoose');
const config = require('../config');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

/**
 * Convert non-ApiError errors to ApiError
 */
const errorConverter = (err, req, res, next) => {
  let error = err;
  
  if (!(error instanceof ApiError)) {
    if (error instanceof mongoose.Error.ValidationError) {
      const message = Object.values(error.errors)
        .map((e) => e.message)
        .join(', ');
      error = ApiError.badRequest(message);
    } else if (error instanceof mongoose.Error.CastError) {
      error = ApiError.badRequest(`Invalid ${error.path}: ${error.value}`);
    } else if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      error = ApiError.conflict(`${field} already exists`);
    } else if (error.name === 'JsonWebTokenError') {
      error = ApiError.unauthorized('Invalid token');
    } else if (error.name === 'TokenExpiredError') {
      error = ApiError.unauthorized('Token has expired');
    } else {
      const statusCode = error.statusCode || 500;
      const message = error.message || 'Internal Server Error';
      error = new ApiError(statusCode, message, false, err.stack);
    }
  }
  
  next(error);
};

/**
 * Global error handler
 */
const errorHandler = (err, req, res, next) => {
  let { statusCode, message } = err;
  
  if (config.env === 'production' && !err.isOperational) {
    statusCode = 500;
    message = 'Internal Server Error';
  }
  
  res.locals.errorMessage = err.message;
  
  // Log error
  logger.error({
    message: err.message,
    statusCode,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userId: req.user?._id,
  });
  
  const response = {
    success: false,
    message,
    ...(config.env === 'development' && {
      error: err,
      stack: err.stack,
    }),
  };
  
  res.status(statusCode).json(response);
};

/**
 * Handle 404
 */
const notFound = (req, res, next) => {
  next(ApiError.notFound(`Route ${req.originalUrl} not found`));
};

module.exports = {
  errorConverter,
  errorHandler,
  notFound,
};
