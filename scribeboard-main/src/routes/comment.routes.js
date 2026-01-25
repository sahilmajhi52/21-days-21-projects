/**
 * Comment Routes (Admin/Moderation)
 */

const express = require('express');
const commentController = require('../controllers/comment.controller');
const { authenticate, editorOrAdmin } = require('../middleware/auth.middleware');
const { validateQuery } = require('../middleware/validate.middleware');
const commentValidator = require('../validators/comment.validator');

const router = express.Router();

// All routes require Editor/Admin role
router.use(authenticate, editorOrAdmin);

// Comment management
router.get('/', validateQuery(commentValidator.queryComments), commentController.getAllComments);
router.get('/stats', commentController.getCommentStats);

// Moderation actions
router.post('/:id/approve', commentController.approveComment);
router.post('/:id/reject', commentController.rejectComment);
router.post('/:id/spam', commentController.markAsSpam);
router.delete('/:id', commentController.deleteComment);

module.exports = router;
