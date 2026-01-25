const mongoose = require('mongoose');
const config = require('../config');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

/**
 * Convert non-ApiError errors to ApiError
 */
const errorConverter = (err, req, res, next) => {
  let error = err;
  
  if (!(error instanceof ApiError)) {
    // Handle Mongoose validation error
    if (error instanceof mongoose.Error.ValidationError) {
      const message = Object.values(error.errors)
        .map((e) => e.message)
        .join(', ');
      error = ApiError.badRequest(message);
    }
    // Handle Mongoose CastError (invalid ObjectId)
    else if (error instanceof mongoose.Error.CastError) {
      error = ApiError.badRequest(`Invalid ${error.path}: ${error.value}`);
    }
    // Handle Mongoose duplicate key error
    else if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      error = ApiError.conflict(`${field} already exists`);
    }
    // Handle JWT errors
    else if (error.name === 'JsonWebTokenError') {
      error = ApiError.unauthorized('Invalid token');
    }
    else if (error.name === 'TokenExpiredError') {
      error = ApiError.unauthorized('Token has expired');
    }
    // Handle other errors
    else {
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
  
  // In production, don't send error details for non-operational errors
  if (config.env === 'production' && !err.isOperational) {
    statusCode = 500;
    message = 'Internal Server Error';
  }
  
  res.locals.errorMessage = err.message;
  
  const response = {
    success: false,
    message,
    ...(config.env === 'development' && {
      error: err,
      stack: err.stack,
    }),
  };
  
  if (config.env === 'development') {
    console.error(err);
  }
  
  res.status(statusCode).json(response);
};

/**
 * Handle 404 - Route not found
 */
const notFound = (req, res, next) => {
  next(ApiError.notFound(`Route ${req.originalUrl} not found`));
};

module.exports = {
  errorConverter,
  errorHandler,
  notFound,
};
