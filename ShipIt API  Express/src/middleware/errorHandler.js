/**
 * Global Error Handler Middleware
 * 
 * WORKSHOP NOTE: Always have a global error handler!
 * It prevents your app from crashing and provides consistent error responses.
 */

const config = require('../config');
const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error(err.message, {
    stack: config.env === 'development' ? err.stack : undefined,
    url: req.originalUrl,
    method: req.method
  });

  // Determine status code
  const statusCode = err.statusCode || err.status || 500;

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: {
      message: err.message || 'Internal Server Error',
      // Only include stack trace in development
      ...(config.env === 'development' && { stack: err.stack })
    }
  });
};

module.exports = errorHandler;
