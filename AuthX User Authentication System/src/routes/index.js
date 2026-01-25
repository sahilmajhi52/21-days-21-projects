/**
 * API Routes Index
 * Combines all route modules
 */

const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const roleRoutes = require('./role.routes');
const permissionRoutes = require('./permission.routes');

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'AuthX API is running',
    timestamp: new Date().toISOString(),
    version: process.env.API_VERSION || 'v1',
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/roles', roleRoutes);
router.use('/permissions', permissionRoutes);

module.exports = router;
