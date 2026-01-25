/**
 * Post Validators
 */

const Joi = require('joi');

const createPost = Joi.object({
  title: Joi.string().min(5).max(200).required(),
  content: Joi.string().min(50).required(),
  excerpt: Joi.string().max(500),
  coverImage: Joi.string().uri().allow(''),
  categoryId: Joi.string().uuid(),
  tags: Joi.array().items(Joi.string().max(50)).max(10),
  allowComments: Joi.boolean(),
  metaTitle: Joi.string().max(60),
  metaDescription: Joi.string().max(160)
});

const updatePost = Joi.object({
  title: Joi.string().min(5).max(200),
  content: Joi.string().min(50),
  excerpt: Joi.string().max(500).allow(''),
  coverImage: Joi.string().uri().allow(''),
  categoryId: Joi.string().uuid().allow(null),
  tags: Joi.array().items(Joi.string().max(50)).max(10),
  allowComments: Joi.boolean(),
  isFeatured: Joi.boolean(),
  isPinned: Joi.boolean(),
  metaTitle: Joi.string().max(60).allow(''),
  metaDescription: Joi.string().max(160).allow('')
});

const queryPosts = Joi.object({
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(100),
  status: Joi.string().valid('DRAFT', 'PENDING_REVIEW', 'SCHEDULED', 'PUBLISHED', 'UNPUBLISHED', 'ARCHIVED'),
  authorId: Joi.string().uuid(),
  categoryId: Joi.string().uuid(),
  category: Joi.string(),
  tag: Joi.string(),
  search: Joi.string().max(100),
  featured: Joi.string().valid('true', 'false'),
  sort: Joi.string()
});

module.exports = {
  createPost,
  updatePost,
  queryPosts
};
