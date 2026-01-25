/**
 * Post Controller
 */

const postService = require('../services/post.service');
const { sendSuccess, sendCreated, sendPaginated } = require('../utils/response');

const createPost = async (req, res, next) => {
  try {
    const post = await postService.createPost(req.user.id, req.body);
    sendCreated(res, post, 'Post created successfully');
  } catch (error) {
    next(error);
  }
};

const getPosts = async (req, res, next) => {
  try {
    const userId = req.user?.id || null;
    const { posts, pagination } = await postService.getPosts(req.query, userId);
    sendPaginated(res, posts, pagination);
  } catch (error) {
    next(error);
  }
};

const getPost = async (req, res, next) => {
  try {
    const post = await postService.getPost(req.params.id, true);
    sendSuccess(res, post);
  } catch (error) {
    next(error);
  }
};

const updatePost = async (req, res, next) => {
  try {
    const post = await postService.updatePost(
      req.params.id,
      req.user.id,
      req.body,
      req.user.role
    );
    sendSuccess(res, post, 'Post updated successfully');
  } catch (error) {
    next(error);
  }
};

const publishPost = async (req, res, next) => {
  try {
    const post = await postService.publishPost(req.params.id, req.user.id, req.user.role);
    sendSuccess(res, post, 'Post published successfully');
  } catch (error) {
    next(error);
  }
};

const unpublishPost = async (req, res, next) => {
  try {
    const post = await postService.unpublishPost(req.params.id, req.user.id, req.user.role);
    sendSuccess(res, post, 'Post unpublished successfully');
  } catch (error) {
    next(error);
  }
};

const submitForReview = async (req, res, next) => {
  try {
    const post = await postService.submitForReview(req.params.id, req.user.id);
    sendSuccess(res, post, 'Post submitted for review');
  } catch (error) {
    next(error);
  }
};

const deletePost = async (req, res, next) => {
  try {
    const result = await postService.deletePost(req.params.id, req.user.id, req.user.role);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};

const getPostRevisions = async (req, res, next) => {
  try {
    const revisions = await postService.getPostRevisions(
      req.params.id,
      req.user.id,
      req.user.role
    );
    sendSuccess(res, revisions);
  } catch (error) {
    next(error);
  }
};

// Get posts by current user
const getMyPosts = async (req, res, next) => {
  try {
    const query = { ...req.query, authorId: req.user.id };
    const { posts, pagination } = await postService.getPosts(query, req.user.id);
    sendPaginated(res, posts, pagination);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPost,
  getPosts,
  getPost,
  updatePost,
  publishPost,
  unpublishPost,
  submitForReview,
  deletePost,
  getPostRevisions,
  getMyPosts
};
