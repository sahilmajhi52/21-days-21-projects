const Joi = require('joi');
const { objectId } = require('./common.validation');

const addBankAccount = {
  body: Joi.object().keys({
    bankName: Joi.string().required().trim(),
    accountNumber: Joi.string().required().pattern(/^\d{9,18}$/).messages({
      'string.pattern.base': 'Account number must be 9-18 digits',
    }),
    confirmAccountNumber: Joi.string().required().valid(Joi.ref('accountNumber')).messages({
      'any.only': 'Account numbers do not match',
    }),
    accountHolderName: Joi.string().required().trim(),
    ifscCode: Joi.string().required().pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/).messages({
      'string.pattern.base': 'Invalid IFSC code',
    }),
    accountType: Joi.string().valid('savings', 'current').default('savings'),
    isPrimary: Joi.boolean().default(false),
  }),
};

const updateBankAccount = {
  params: Joi.object().keys({
    accountId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object().keys({
    isPrimary: Joi.boolean(),
  }).min(1),
};

const deleteBankAccount = {
  params: Joi.object().keys({
    accountId: Joi.string().custom(objectId).required(),
  }),
};

module.exports = {
  addBankAccount,
  updateBankAccount,
  deleteBankAccount,
};
