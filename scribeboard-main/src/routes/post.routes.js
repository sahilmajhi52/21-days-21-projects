/**
 * Post Routes
 */

const express = require('express');
const postController = require('../controllers/post.controller');
const commentController = require('../controllers/comment.controller');
const { authenticate, optionalAuth, authorOrAbove } = require('../middleware/auth.middleware');
const { validate, validateQuery } = require('../middleware/validate.middleware');
const postValidator = require('../validators/post.validator');
const commentValidator = require('../validators/comment.validator');

const router = express.Router();

// Public routes (with optional auth for personalized results)
router.get('/', optionalAuth, validateQuery(postValidator.queryPosts), postController.getPosts);
router.get('/:id', postController.getPost);

// Post comments (public read, auth for create)
router.get('/:postId/comments', commentController.getPostComments);
router.post('/:postId/comments', optionalAuth, validate(commentValidator.createComment), commentController.createComment);

// Protected routes (Author+)
router.post('/', authenticate, authorOrAbove, validate(postValidator.createPost), postController.createPost);
router.patch('/:id', authenticate, authorOrAbove, validate(postValidator.updatePost), postController.updatePost);
router.delete('/:id', authenticate, authorOrAbove, postController.deletePost);

// Publishing workflow
router.post('/:id/publish', authenticate, authorOrAbove, postController.publishPost);
router.post('/:id/unpublish', authenticate, authorOrAbove, postController.unpublishPost);
router.post('/:id/submit-review', authenticate, authorOrAbove, postController.submitForReview);

// Revisions
router.get('/:id/revisions', authenticate, authorOrAbove, postController.getPostRevisions);

module.exports = router;
