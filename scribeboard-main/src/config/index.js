/**
 * Application Configuration
 * ScribeBoard API - Blog CMS Backend
 */

require('dotenv').config();

const config = {
  // Server
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3003,
  
  // API
  api: {
    prefix: '/api/v1',
    version: '1.0.0'
  },
  
  // JWT
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'scribeboard-access-secret-dev',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'scribeboard-refresh-secret-dev',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  },
  
  // Security
  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12
  },
  
  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
  },
  
  // Pagination defaults
  pagination: {
    defaultPage: 1,
    defaultLimit: 10,
    maxLimit: 100,
    message: {
      success: false,
      error: { message: 'Too many requests', code: 'RATE_LIMITED', status: 429 },
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    skipFailedRequests: true,
    skip: (req, res) => {
      return res.statusCode < 400;
    },
    keyGenerator: (req) => {
      return req.ip;
    },
    handler: (req, res, next) => {
      return res.status(429).json({
        success: false,
        error: { message: 'Too many requests', code: 'RATE_LIMITED', status: 429 },
      });
    },
    onLimitReached: (req, res, next) => {
      return res.status(429).json({
        success: false,
        error: { message: 'Too many requests', code: 'RATE_LIMITED', status: 429 },
      });
    },
    onRateLimited: (req, res, next) => {
      return res.status(429).json({
        success: false,
        error: { message: 'Too many requests', code: 'RATE_LIMITED', status: 429 },
      });
    },
  },
  
  // Content settings
  content: {
    excerptLength: 200,
    wordsPerMinute: 200 // For reading time calculation
  },
  
  // Comment moderation
  comments: {
    autoApprove: process.env.AUTO_APPROVE_COMMENTS === 'true',
    maxNestingLevel: 3
  }
};

module.exports = config;
