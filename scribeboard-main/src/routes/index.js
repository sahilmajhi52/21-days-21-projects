/**
 * Route Aggregator
 */

const express = require('express');
const config = require('../config');

const authRoutes = require('./auth.routes');
const categoryRoutes = require('./category.routes');
const postRoutes = require('./post.routes');
const commentRoutes = require('./comment.routes');
const userRoutes = require('./user.routes');

const router = express.Router();

// API info
router.get('/', (req, res) => {
  res.json({
    name: 'ScribeBoard API',
    version: config.api.version,
    description: 'Blog CMS Backend Service',
    endpoints: {
      auth: `${config.api.prefix}/auth`,
      posts: `${config.api.prefix}/posts`,
      categories: `${config.api.prefix}/categories`,
      comments: `${config.api.prefix}/comments`,
      authors: `${config.api.prefix}/authors`
    }
  });
});

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'ScribeBoard API is running',
    timestamp: new Date().toISOString()
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/posts', postRoutes);
router.use('/comments', commentRoutes);
router.use('/authors', userRoutes);

module.exports = router;
