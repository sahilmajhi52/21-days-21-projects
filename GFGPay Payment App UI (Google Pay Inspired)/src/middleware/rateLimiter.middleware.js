const rateLimit = require('express-rate-limit');
const config = require('../config');

/**
 * General rate limiter
 */
const generalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    success: false,
    message: 'Too many requests, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Auth rate limiter - stricter for auth routes
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts
  message: {
    success: false,
    message: 'Too many login attempts, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

/**
 * Payment rate limiter - very strict for payment routes
 */
const paymentLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: config.rateLimit.paymentMax,
  message: {
    success: false,
    message: 'Too many payment requests, please try again after a minute',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Transfer rate limiter
 */
const transferLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 transfers per minute
  message: {
    success: false,
    message: 'Transfer limit reached. Please wait before making another transfer.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  generalLimiter,
  authLimiter,
  paymentLimiter,
  transferLimiter,
};
