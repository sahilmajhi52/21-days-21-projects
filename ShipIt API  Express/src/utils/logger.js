/**
 * Simple Logger Utility
 * 
 * WORKSHOP NOTE: In production, you'd use Winston or Pino.
 * This simple logger demonstrates the concept of structured logging.
 */

const config = require('../config');

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

const colors = {
  error: '\x1b[31m', // Red
  warn: '\x1b[33m',  // Yellow
  info: '\x1b[36m',  // Cyan
  debug: '\x1b[90m', // Gray
  reset: '\x1b[0m'
};

const currentLevel = levels[config.logging.level] || levels.info;

const formatMessage = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
  
  if (config.env === 'production') {
    // JSON format for production (easier to parse in log aggregators)
    return JSON.stringify({
      timestamp,
      level,
      message,
      ...meta
    });
  }
  
  // Colored format for development
  const color = colors[level] || colors.reset;
  return `${color}[${timestamp}] [${level.toUpperCase()}]${colors.reset} ${message}${metaStr}`;
};

const log = (level, message, meta) => {
  if (levels[level] <= currentLevel) {
    console.log(formatMessage(level, message, meta));
  }
};

const logger = {
  error: (message, meta) => log('error', message, meta),
  warn: (message, meta) => log('warn', message, meta),
  info: (message, meta) => log('info', message, meta),
  debug: (message, meta) => log('debug', message, meta),
  
  // HTTP request logging helper
  request: (req, res, duration) => {
    const meta = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip
    };
    
    if (res.statusCode >= 400) {
      log('error', 'HTTP Request', meta);
    } else {
      log('info', 'HTTP Request', meta);
    }
  }
};

module.exports = logger;
