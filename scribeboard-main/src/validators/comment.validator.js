/**
 * Comment Validators
 */

const Joi = require('joi');

const createComment = Joi.object({
  content: Joi.string().min(2).max(2000).required(),
  parentId: Joi.string().uuid(),
  guestName: Joi.string().min(2).max(50),
  guestEmail: Joi.string().email()
});

const queryComments = Joi.object({
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(100),
  status: Joi.string().valid('PENDING', 'APPROVED', 'REJECTED', 'SPAM'),
  postId: Joi.string().uuid()
});

module.exports = {
  createComment,
  queryComments
};
