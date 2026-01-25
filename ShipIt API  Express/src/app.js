/**
 * Express Application Setup
 * 
 * WORKSHOP NOTE: This is where we configure the Express app.
 * Notice how we apply middleware in a specific order - it matters!
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const config = require('./config');
const routes = require('./routes');
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');

// Create Express app
const app = express();

// ===========================================
// SECURITY MIDDLEWARE (apply first!)
// ===========================================

// Helmet adds various HTTP headers for security
app.use(helmet());

// CORS - Configure cross-origin requests
app.use(cors(config.cors));

// ===========================================
// PARSING MIDDLEWARE
// ===========================================

// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// ===========================================
// LOGGING MIDDLEWARE
// ===========================================

// Morgan for HTTP request logging
app.use(morgan(config.logging.format));

// Custom request logger (structured logging)
app.use(requestLogger);

// ===========================================
// ROUTES
// ===========================================

app.use('/', routes);

// ===========================================
// ERROR HANDLING (apply last!)
// ===========================================

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.method} ${req.originalUrl} not found`,
      suggestion: 'Check /api/v1 for available endpoints'
    }
  });
});

// Global error handler
app.use(errorHandler);

module.exports = app;
