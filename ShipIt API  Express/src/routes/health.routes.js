/**
 * Health Check Routes
 * 
 * WORKSHOP NOTE: Health checks are CRITICAL for production deployments!
 * 
 * They enable:
 * - Load balancers to know if your server is alive
 * - Kubernetes/Render to restart unhealthy containers
 * - Monitoring tools to track uptime
 * - Zero-downtime deployments
 */

const express = require('express');
const config = require('../config');

const router = express.Router();

// Track server start time for uptime calculation
const startTime = Date.now();

/**
 * @route   GET /health
 * @desc    Basic health check - is the server responding?
 * @access  Public
 * 
 * USAGE: Load balancers hit this endpoint every few seconds
 */
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

/**
 * @route   GET /health/live
 * @desc    Liveness probe - is the process running?
 * @access  Public
 * 
 * USAGE: Kubernetes liveness probe
 * If this fails, the container will be restarted
 */
router.get('/live', (req, res) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString()
  });
});

/**
 * @route   GET /health/ready
 * @desc    Readiness probe - is the server ready to accept traffic?
 * @access  Public
 * 
 * USAGE: Kubernetes readiness probe / Render health check
 * Traffic is only routed when this returns 200
 */
router.get('/ready', (req, res) => {
  // In a real app, you'd check:
  // - Database connection
  // - Redis connection
  // - External service availability
  
  const isReady = true; // Simplified for workshop
  
  if (isReady) {
    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString()
    });
  } else {
    res.status(503).json({
      status: 'not_ready',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route   GET /health/detailed
 * @desc    Detailed health information
 * @access  Public (consider protecting in production)
 * 
 * USAGE: Debugging and monitoring dashboards
 */
router.get('/detailed', (req, res) => {
  const uptime = Math.floor((Date.now() - startTime) / 1000);
  const memoryUsage = process.memoryUsage();
  
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: config.env,
    version: config.api.version,
    uptime: {
      seconds: uptime,
      formatted: formatUptime(uptime)
    },
    memory: {
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`
    },
    node: {
      version: process.version,
      platform: process.platform,
      arch: process.arch
    }
  });
});

// Helper function to format uptime
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${secs}s`);
  
  return parts.join(' ');
}

/**
 * @route   GET /health/live
 * @desc    Liveness probe - is the process running?
 * @access  Public
 * 
 * USAGE: Kubernetes liveness probe
 * If this fails, the container will be restarted
 */
router.get('/live', (req, res) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString()
  });
});


/**
 * @route   GET /health/ready
 * @desc    Readiness probe - is the server ready to accept traffic?
 * @access  Public
 * 
 * USAGE: Kubernetes readiness probe / Render health check
 * Traffic is only routed when this returns 200
 */
router.get('/ready', (req, res) => {
  // In a real app, you'd check:
  // - Database connection
  // - Redis connection
  // - External service availability
  
  const isReady = true; // Simplified for workshop
  
  if (isReady) {
    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString()
    });
  } else {
    res.status(503).json({
      status: 'not_ready',
      timestamp: new Date().toISOString()
    });
  }
});
module.exports = router;
