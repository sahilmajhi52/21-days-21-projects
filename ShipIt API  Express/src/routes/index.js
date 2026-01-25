/**
 * Route Aggregator
 * 
 * WORKSHOP NOTE: Centralizing routes makes the codebase more organized
 * and easier to maintain as it grows.
 */

const express = require('express');
const healthRoutes = require('./health.routes');
const apiRoutes = require('./api.routes');
const config = require('../config');

const router = express.Router();

// Mount routes
router.use('/health', healthRoutes);
router.use(config.api.prefix, apiRoutes);

// Root endpoint
router.get('/', (req, res) => {
  res.json({
    name: 'ShipIt API',
    version: config.api.version,
    status: 'running',
    message: '🚀 Welcome to ShipIt API! Ready for deployment.',
    links: {
      health: '/health',
      api: config.api.prefix,
      docs: config.features.enableDocs ? '/api/v1' : 'disabled in production'
    }
  });
});

module.exports = router;
