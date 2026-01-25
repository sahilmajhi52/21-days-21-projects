const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const path = require('path');

const config = require('./config');
const routes = require('./routes');
const { errorConverter, errorHandler, notFound, generalLimiter } = require('./middleware');

const app = express();

// Security middleware
app.use(helmet());

// CORS
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
}));

// Request logging
if (config.env !== 'test') {
  app.use(morgan(config.env === 'development' ? 'dev' : 'combined'));
}

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Data sanitization against NoSQL injection
app.use(mongoSanitize());

// Rate limiting
app.use('/api', generalLimiter);

// Static files (for uploads)
app.use('/uploads', express.static(path.join(__dirname, '..', config.upload.path)));

// API routes
app.use('/api/v1', routes);

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to EduAdmin API',
    version: '1.0.0',
    documentation: '/api/v1/health',
  });
});

// Handle 404
app.use(notFound);

// Error handling
app.use(errorConverter);
app.use(errorHandler);

module.exports = app;
