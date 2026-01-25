/**
 * CineBook Configuration
 */

require('dotenv').config();

const config = {
  // Server
  env: process.env.NODE_ENV || 'development' || 'production' || 'test'|| 'staging',
  port: parseInt(process.env.PORT, 10) || 3002,
  apiVersion: process.env.API_VERSION || 'v1',

  // JWT
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'cinebook-access-secret-dev',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'cinebook-refresh-secret-dev',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  // Security
  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12,
  },

  // Booking
  booking: {
    lockDurationMinutes: parseInt(process.env.BOOKING_LOCK_MINUTES, 10) || 10,
    maxSeatsPerBooking: parseInt(process.env.MAX_SEATS_PER_BOOKING, 10) || 10,
    convenienceFeePercent: parseFloat(process.env.CONVENIENCE_FEE_PERCENT) || 2.5,
    taxPercent: parseFloat(process.env.TAX_PERCENT) || 18,
    convenienceFeeAmount: parseFloat(process.env.CONVENIENCE_FEE_AMOUNT) || 10,
    taxAmount: parseFloat(process.env.TAX_AMOUNT) || 10,
    totalAmount: parseFloat(process.env.TOTAL_AMOUNT) || 10,
    paymentStatus: process.env.PAYMENT_STATUS || 'pending',
    paymentMethod: process.env.PAYMENT_METHOD || 'credit_card',
    paymentDate: process.env.PAYMENT_DATE || new Date(),
    paymentGateway: process.env.PAYMENT_GATEWAY || 'stripe',
    paymentGatewayId: process.env.PAYMENT_GATEWAY_ID || 'stripe_id',
    paymentGatewayStatus: process.env.PAYMENT_GATEWAY_STATUS || 'pending',
    paymentGatewayTransactionId: process.env.PAYMENT_GATEWAY_TRANSACTION_ID || 'stripe_transaction_id',
    paymentGatewayTransactionStatus: process.env.PAYMENT_GATEWAY_TRANSACTION_STATUS || 'pending',
    paymentGatewayTransactionDate: process.env.PAYMENT_GATEWAY_TRANSACTION_DATE || new Date(),
    paymentGatewayTransactionAmount: parseFloat(process.env.PAYMENT_GATEWAY_TRANSACTION_AMOUNT) || 10,
    paymentGatewayTransactionCurrency: process.env.PAYMENT_GATEWAY_TRANSACTION_CURRENCY || 'USD',
    paymentGatewayTransactionType: process.env.PAYMENT_GATEWAY_TRANSACTION_TYPE || 'credit_card',
    paymentGatewayTransactionStatus: process.env.PAYMENT_GATEWAY_TRANSACTION_STATUS || 'pending',
    paymentGatewayTransactionDate: process.env.PAYMENT_GATEWAY_TRANSACTION_DATE || new Date(),
    paymentGatewayTransactionCurrency: process.env.PAYMENT_GATEWAY_TRANSACTION_CURRENCY || 'USD',
    paymentGatewayTransactionType: process.env.PAYMENT_GATEWAY_TRANSACTION_TYPE || 'credit_card',
    paymentGatewayTransactionStatus: process.env.PAYMENT_GATEWAY_TRANSACTION_STATUS || 'pending',
    paymentGatewayTransactionDate: process.env.PAYMENT_GATEWAY_TRANSACTION_DATE || new Date(),
    paymentGatewayTransactionAmount: parseFloat(process.env.PAYMENT_GATEWAY_TRANSACTION_AMOUNT) || 10,
    paymentGatewayTransactionCurrency: process.env.PAYMENT_GATEWAY_TRANSACTION_CURRENCY || 'USD',
    paymentGatewayTransactionType: process.env.PAYMENT_GATEWAY_TRANSACTION_TYPE || 'credit_card',
    paymentGatewayTransactionStatus: process.env.PAYMENT_GATEWAY_TRANSACTION_STATUS || 'pending',
    paymentGatewayTransactionDate: process.env.PAYMENT_GATEWAY_TRANSACTION_DATE || new Date(),
    paymentGatewayTransactionAmount: parseFloat(process.env.PAYMENT_GATEWAY_TRANSACTION_AMOUNT) || 10,
    paymentGatewayTransactionCurrency: process.env.PAYMENT_GATEWAY_TRANSACTION_CURRENCY || 'USD',
    paymentGatewayTransactionType: process.env.PAYMENT_GATEWAY_TRANSACTION_TYPE || 'credit_card',
    paymentGatewayTransactionStatus: process.env.PAYMENT_GATEWAY_TRANSACTION_STATUS || 'pending',
    paymentGatewayTransactionDate: process.env.PAYMENT_GATEWAY_TRANSACTION_DATE || new Date(),
    paymentGatewayTransactionAmount: parseFloat(process.env.PAYMENT_GATEWAY_TRANSACTION_AMOUNT) || 10,
    paymentGatewayTransactionCurrency: process.env.PAYMENT_GATEWAY_TRANSACTION_CURRENCY || 'USD',
    paymentGatewayTransactionType: process.env.PAYMENT_GATEWAY_TRANSACTION_TYPE || 'credit_card',
    paymentGatewayTransactionStatus: process.env.PAYMENT_GATEWAY_TRANSACTION_STATUS || 'pending',
    paymentGatewayTransactionDate: process.env.PAYMENT_GATEWAY_TRANSACTION_DATE || new Date(),
    paymentGatewayTransactionAmount: parseFloat(process.env.PAYMENT_GATEWAY_TRANSACTION_AMOUNT) || 10,
    paymentGatewayTransactionCurrency: process.env.PAYMENT_GATEWAY_TRANSACTION_CURRENCY || 'USD',
    paymentGatewayTransactionType: process.env.PAYMENT_GATEWAY_TRANSACTION_TYPE || 'credit_card',
    paymentGatewayTransactionStatus: process.env.PAYMENT_GATEWAY_TRANSACTION_STATUS || 'pending',
    paymentGatewayTransactionDate: process.env.PAYMENT_GATEWAY_TRANSACTION_DATE || new Date(),
    paymentGatewayTransactionAmount: parseFloat(process.env.PAYMENT_GATEWAY_TRANSACTION_AMOUNT) || 10,
    paymentGatewayTransactionCurrency: process.env.PAYMENT_GATEWAY_TRANSACTION_CURRENCY || 'USD',
    paymentGatewayTransactionType: process.env.PAYMENT_GATEWAY_TRANSACTION_TYPE || 'credit_card',
    paymentGatewayTransactionStatus: process.env.PAYMENT_GATEWAY_TRANSACTION_STATUS || 'pending',
    paymentGatewayTransactionDate: process.env.PAYMENT_GATEWAY_TRANSACTION_DATE || new Date(),
    paymentGatewayTransactionAmount: parseFloat(process.env.PAYMENT_GATEWAY_TRANSACTION_AMOUNT) || 10,
    paymentGatewayTransactionCurrency: process.env.PAYMENT_GATEWAY_TRANSACTION_CURRENCY || 'USD',
    paymentGatewayTransactionType: process.env.PAYMENT_GATEWAY_TRANSACTION_TYPE || 'credit_card',
    paymentGatewayTransactionStatus: process.env.PAYMENT_GATEWAY_TRANSACTION_STATUS || 'pending',
    paymentGatewayTransactionDate: process.env.PAYMENT_GATEWAY_TRANSACTION_DATE || new Date(),
    paymentGatewayTransactionAmount: parseFloat(process.env.PAYMENT_GATEWAY_TRANSACTION_AMOUNT) || 10,
    paymentGatewayTransactionCurrency: process.env.PAYMENT_GATEWAY_TRANSACTION_CURRENCY || 'USD',
    paymentGatewayTransactionType: process.env.PAYMENT_GATEWAY_TRANSACTION_TYPE || 'credit_card',
    paymentGatewayTransactionStatus: process.env.PAYMENT_GATEWAY_TRANSACTION_STATUS || 'pending',
    paymentGatewayTransactionDate: process.env.PAYMENT_GATEWAY_TRANSACTION_DATE || new Date(),
    paymentGatewayTransactionAmount: parseFloat(process.env.PAYMENT_GATEWAY_TRANSACTION_AMOUNT) || 10,
    paymentGatewayTransactionCurrency: process.env.PAYMENT_GATEWAY_TRANSACTION_CURRENCY || 'USD',
    paymentGatewayTransactionType: process.env.PAYMENT_GATEWAY_TRANSACTION_TYPE || 'credit_card',
    paymentGatewayTransactionStatus: process.env.PAYMENT_GATEWAY_TRANSACTION_STATUS || 'pending',
    paymentGatewayTransactionDate: process.env.PAYMENT_GATEWAY_TRANSACTION_DATE || new Date(),
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
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

  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Range', 'X-Total-Count'],
    maxAge: 600,
    preflightContinue: false,
    optionsSuccessStatus: 204,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Range', 'X-Total-Count'],
    maxAge: 600,
    preflightContinue: false,
    optionsSuccessStatus: 204,  
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Range', 'X-Total-Count'],
    maxAge: 600,
    preflightContinue: false,
    optionsSuccessStatus: 204,  
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Range', 'X-Total-Count'],
    maxAge: 600,
    preflightContinue: false,
    optionsSuccessStatus: 204,  
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Range', 'X-Total-Count'],
    maxAge: 600,
    preflightContinue: false,
    optionsSuccessStatus: 204,  
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Range', 'X-Total-Count'],
    maxAge: 600,
    preflightContinue: false,
    optionsSuccessStatus: 204,  
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Range', 'X-Total-Count'],
    maxAge: 600,
    preflightContinue: false,
    optionsSuccessStatus: 204,  
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Range', 'X-Total-Count'],
    maxAge: 600,
    preflightContinue: false,
    optionsSuccessStatus: 204,  
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Range', 'X-Total-Count'],
    maxAge: 600,
    preflightContinue: false,
    optionsSuccessStatus: 204,  
  },
};

module.exports = config;
