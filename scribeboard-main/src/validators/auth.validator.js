/**
 * Authentication Validators
 */

const Joi = require('joi');

const register = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .message('Password must contain at least one uppercase, one lowercase, and one number'),
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required()
});

const login = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const updateProfile = Joi.object({
  firstName: Joi.string().min(2).max(50),
  lastName: Joi.string().min(2).max(50),
  bio: Joi.string().max(500).allow(''),
  avatar: Joi.string().uri().allow(''),
  website: Joi.string().uri().allow(''),
  twitter: Joi.string().max(50).allow(''),
  linkedin: Joi.string().uri().allow('')
});

const changePassword = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).required()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .message('Password must contain at least one uppercase, one lowercase, and one number')
});

const refreshTokens = Joi.object({
  refreshToken: Joi.string().required()
});

module.exports = {
  register,
  login,
  updateProfile,
  changePassword,
  refreshTokens
};
