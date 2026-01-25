/**
 * API Routes
 * 
 * WORKSHOP NOTE: This demonstrates a simple API structure.
 * In a real app, you'd have more complex routes with database operations.
 */

const express = require('express');
const config = require('../config');

const router = express.Router();

/**
 * @route   GET /api/v1
 * @desc    API information endpoint
 * @access  Public
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 ShipIt API is running!',
    version: config.api.version,
    environment: config.env,
    endpoints: {
      health: '/health',
      healthDetailed: '/health/detailed',
      items: '/api/v1/items',
      echo: '/api/v1/echo'
    }
  });
});

/**
 * @route   GET /api/v1/items
 * @desc    Get sample items (demonstrates typical API response)
 * @access  Public
 */
router.get('/items', (req, res) => {
  // Sample data - in real app, this comes from database
  const items = [
    { id: 1, name: 'Deploy to Render', status: 'pending', priority: 'high' },
    { id: 2, name: 'Configure ENV vars', status: 'completed', priority: 'high' },
    { id: 3, name: 'Test health endpoint', status: 'completed', priority: 'medium' },
    { id: 4, name: 'Monitor logs', status: 'pending', priority: 'low' }
  ];
  
  res.json({
    success: true,
    count: items.length,
    data: items
  });
});

/**
 * @route   GET /api/v1/items/:id
 * @desc    Get single item by ID
 * @access  Public
 */
router.get('/items/:id', (req, res) => {
  const { id } = req.params;
  
  // Sample data lookup
  const items = [
    { id: 1, name: 'Deploy to Render', status: 'pending', priority: 'high' },
    { id: 2, name: 'Configure ENV vars', status: 'completed', priority: 'high' },
    { id: 3, name: 'Test health endpoint', status: 'completed', priority: 'medium' }
  ];
  
  const item = items.find(i => i.id === parseInt(id));
  
  if (!item) {
    return res.status(404).json({
      success: false,
      error: { message: `Item with ID ${id} not found` }
    });
  }
  
  res.json({
    success: true,
    data: item
  });
});

/**
 * @route   POST /api/v1/echo
 * @desc    Echo back the request body (useful for testing)
 * @access  Public
 */
router.post('/echo', (req, res) => {
  res.json({
    success: true,
    message: 'Echo response',
    received: {
      body: req.body,
      headers: {
        'content-type': req.get('content-type'),
        'user-agent': req.get('user-agent')
      },
      timestamp: new Date().toISOString()
    }
  });
});

/**
 * @route   GET /api/v1/config
 * @desc    Show current configuration (development only)
 * @access  Public (only in development)
 */
router.get('/config', (req, res) => {
  if (config.env === 'production') {
    return res.status(403).json({
      success: false,
      error: { message: 'This endpoint is disabled in production' }
    });
  }
  
  res.json({
    success: true,
    config: {
      environment: config.env,
      port: config.port,
      apiVersion: config.api.version,
      features: config.features,
      logging: config.logging
    }
  });
});

/**
 * @route   GET /api/v1/error
 * @desc    Deliberately throw an error (test error handling)
 * @access  Public
 */
router.get('/error', (req, res, next) => {
  const error = new Error('This is a test error!');
  error.statusCode = 500;
  next(error);
});

/**
 * @route   GET /api/v1/health
 * @desc    Health check endpoint
 * @access  Public
 */
router.get('/health', (req, res) => {
  res.json({ success: true, message: 'API is running' });
});

/**
 * @route   GET /api/v1/health/detailed
 * @desc    Detailed health check endpoint
 * @access  Public
 */
router.get('/health/detailed', (req, res) => {
  res.json({ success: true, message: 'API is running', version: config.api.version, environment: config.env });
}); 


module.exports = router;
