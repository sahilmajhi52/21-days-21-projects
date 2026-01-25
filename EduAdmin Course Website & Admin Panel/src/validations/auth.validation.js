const Joi = require('joi');
const { objectId, password, email, name } = require('./common.validation');

const register = {
  body: Joi.object().keys({
    firstName: name.required(),
    lastName: name.required(),
    email: email.required(),
    password: password.required(),
    role: Joi.string().valid('student', 'instructor').default('student'),
  }),
};

const login = {
  body: Joi.object().keys({
    email: email.required(),
    password: Joi.string().required(),
  }),
};

const refreshToken = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

const logout = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

const forgotPassword = {
  body: Joi.object().keys({
    email: email.required(),
  }),
};

const resetPassword = {
  body: Joi.object().keys({
    token: Joi.string().required(),
    password: password.required(),
  }),
};

const changePassword = {
  body: Joi.object().keys({
    currentPassword: Joi.string().required(),
    newPassword: password.required(),
  }),
};

const updateProfile = {
  body: Joi.object().keys({
    firstName: name,
    lastName: name,
    bio: Joi.string().max(500),
    avatar: Joi.string().uri(),
  }),
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
  updateProfile,
};
