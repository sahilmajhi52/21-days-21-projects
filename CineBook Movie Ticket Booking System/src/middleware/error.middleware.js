/**
 * Error Handling Middleware
 */

const config = require('../config');

const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  
  const response = {
    success: false,
    error: {
      message: err.message || 'Internal Server Error',
      code: err.errorCode || 'INTERNAL_ERROR',
      status: statusCode,
    },
  };

  if (config.env === 'development') {
    response.error.stack = err.stack;
  }

  // Log error
  console.error(`[ERROR] ${err.message}`, {
    statusCode,
    path: req.path,
    method: req.method,
  });

  res.status(statusCode).json(response);
};

module.exports = { notFound, errorHandler };
