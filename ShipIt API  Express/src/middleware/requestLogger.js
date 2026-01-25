/**
 * Custom Request Logger Middleware
 * 
 * WORKSHOP NOTE: This shows how to create custom middleware
 * that tracks request timing and logs in a structured format.
 */

const logger = require('../utils/logger');

const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Log when response finishes
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.request(req, res, duration);
  });
  
  next();
};

module.exports = requestLogger;
