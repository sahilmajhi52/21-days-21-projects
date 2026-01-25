/**
 * Comment Controller
 */

const commentService = require('../services/comment.service');
const { sendSuccess, sendCreated, sendPaginated } = require('../utils/response');

const createComment = async (req, res, next) => {
  try {
    const ipInfo = {
      ip: req.ip,
      userAgent: req.get('user-agent')
    };
    
    const comment = await commentService.createComment(
      req.params.postId,
      req.body,
      req.user?.id || null,
      ipInfo
    );
    
    sendCreated(res, comment, 'Comment added successfully');
  } catch (error) {
    next(error);
  }
};

const getPostComments = async (req, res, next) => {
  try {
    const { comments, pagination } = await commentService.getPostComments(
      req.params.postId,
      req.query
    );
    sendPaginated(res, comments, pagination);
  } catch (error) {
    next(error);
  }
};

const getAllComments = async (req, res, next) => {
  try {
    const { comments, pagination } = await commentService.getAllComments(req.query);
    sendPaginated(res, comments, pagination);
  } catch (error) {
    next(error);
  }
};

const approveComment = async (req, res, next) => {
  try {
    const comment = await commentService.approveComment(req.params.id, req.user.id);
    sendSuccess(res, comment, 'Comment approved');
  } catch (error) {
    next(error);
  }
};

const rejectComment = async (req, res, next) => {
  try {
    const comment = await commentService.rejectComment(req.params.id, req.user.id);
    sendSuccess(res, comment, 'Comment rejected');
  } catch (error) {
    next(error);
  }
};

const markAsSpam = async (req, res, next) => {
  try {
    const comment = await commentService.markAsSpam(req.params.id, req.user.id);
    sendSuccess(res, comment, 'Comment marked as spam');
  } catch (error) {
    next(error);
  }
};

const deleteComment = async (req, res, next) => {
  try {
    const result = await commentService.deleteComment(
      req.params.id,
      req.user.id,
      req.user.role
    );
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};

const getCommentStats = async (req, res, next) => {
  try {
    const stats = await commentService.getCommentStats();
    sendSuccess(res, stats);
  } catch (error) {
    next(error);
  }
};

const getCommentReplies = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const { replies } = await commentService.getCommentReplies(commentId);
    sendSuccess(res, replies);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createComment,
  getPostComments,
  getAllComments,
  approveComment,
  rejectComment,
  markAsSpam,
  deleteComment,
  getCommentStats
};
