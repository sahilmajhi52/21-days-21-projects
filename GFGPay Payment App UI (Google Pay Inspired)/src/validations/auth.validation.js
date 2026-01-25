const Joi = require('joi');
const { phoneNumber, password, pin } = require('./common.validation');

const register = {
  body: Joi.object().keys({
    firstName: Joi.string().required().trim().max(50),
    lastName: Joi.string().required().trim().max(50),
    email: Joi.string().required().email().lowercase().trim(),
    phoneNumber: phoneNumber.required(),
    password: password.required(),
  }),
};

const login = {
  body: Joi.object().keys({
    phoneNumber: phoneNumber.required(),
    password: Joi.string().required(),
  }),
};

const loginWithEmail = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
};

const refreshToken = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

const setPin = {
  body: Joi.object().keys({
    pin: pin.required(),
    confirmPin: Joi.string().required().valid(Joi.ref('pin')).messages({
      'any.only': 'PINs do not match',
    }),
  }),
};

const changePin = {
  body: Joi.object().keys({
    currentPin: pin.required(),
    newPin: pin.required(),
    confirmPin: Joi.string().required().valid(Joi.ref('newPin')).messages({
      'any.only': 'PINs do not match',
    }),
  }),
};

const changePassword = {
  body: Joi.object().keys({
    currentPassword: Joi.string().required(),
    newPassword: password.required(),
  }),
};

const verifyPhone = {
  body: Joi.object().keys({
    phoneNumber: phoneNumber.required(),
    otp: Joi.string().required().length(6),
  }),
};

module.exports = {
  register,
  login,
  loginWithEmail,
  refreshToken,
  setPin,
  changePin,
  changePassword,
  verifyPhone,
};
