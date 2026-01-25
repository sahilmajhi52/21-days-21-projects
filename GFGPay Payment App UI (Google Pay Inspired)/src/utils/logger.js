const winston = require('winston');
const path = require('path');
const config = require('../config');

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${stack || message}`;
  })
);

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Determine log level based on environment
const level = () => {
  return config.env === 'development' ? 'debug' : 'info';
};

// Create transports
const transports = [
  // Console transport
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize({ all: true }),
      logFormat
    ),
  }),
];

// Add file transports in production
if (config.env === 'production') {
  transports.push(
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/error.log'),
      level: 'error',
      format: logFormat,
    }),
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/combined.log'),
      format: logFormat,
    })
  );
}

// Create logger instance
const logger = winston.createLogger({
  level: level(),
  levels,
  transports,
});

// Stream for Morgan
logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  },
};

module.exports = logger;
