const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  
  mongoose: {
    url: process.env.MONGODB_URI || 'mongodb://localhost:27017/gfgpay',
    options: {},
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-change-me',
    accessExpirationMinutes: parseInt(process.env.JWT_ACCESS_EXPIRATION_MINUTES, 10) || 30,
    refreshExpirationDays: parseInt(process.env.JWT_REFRESH_EXPIRATION_DAYS, 10) || 30,
  },
  
  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10,
  },
  
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
    paymentMax: parseInt(process.env.PAYMENT_RATE_LIMIT_MAX, 10) || 10,
  },
  
  transaction: {
    minAmount: parseInt(process.env.MIN_TRANSFER_AMOUNT, 10) || 1,
    maxAmount: parseInt(process.env.MAX_TRANSFER_AMOUNT, 10) || 100000,
    dailyLimit: parseInt(process.env.DAILY_TRANSFER_LIMIT, 10) || 200000,
  },
  
  upi: {
    suffix: process.env.UPI_ID_SUFFIX || '@gfgpay',
  },
};

module.exports = config;
