const Joi = require('joi');
const { amount, pin } = require('./common.validation');

const getBalance = {
  // No body required
};

const addMoney = {
  body: Joi.object().keys({
    amount: amount.required().min(1).max(100000),
    source: Joi.string().valid('bank', 'card', 'upi').required(),
    sourceId: Joi.string(), // Bank account ID if source is bank
  }),
};

const withdrawMoney = {
  body: Joi.object().keys({
    amount: amount.required().min(1).max(100000),
    bankAccountId: Joi.string().required(),
    pin: pin.required(),
  }),
};

module.exports = {
  getBalance,
  addMoney,
  withdrawMoney,
};
