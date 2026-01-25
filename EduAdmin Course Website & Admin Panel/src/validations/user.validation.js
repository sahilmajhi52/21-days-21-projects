const Joi = require('joi');
const { objectId, pagination, password, email, name } = require('./common.validation');

const getUsers = {
  query: Joi.object().keys({
    ...pagination,
    sort: Joi.string(),
    search: Joi.string().max(100),
    role: Joi.string().valid('student', 'instructor', 'admin'),
    isActive: Joi.boolean(),
  }),
};

const getUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId).required(),
  }),
};

const createUser = {
  body: Joi.object().keys({
    firstName: name.required(),
    lastName: name.required(),
    email: email.required(),
    password: password.required(),
    role: Joi.string().valid('student', 'instructor', 'admin').default('student'),
    isActive: Joi.boolean().default(true),
    bio: Joi.string().max(500),
  }),
};

const updateUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object()
    .keys({
      firstName: name,
      lastName: name,
      email: email,
      role: Joi.string().valid('student', 'instructor', 'admin'),
      isActive: Joi.boolean(),
      bio: Joi.string().max(500),
    })
    .min(1),
};

const deleteUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId).required(),
  }),
};

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
};
