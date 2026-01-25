const Joi = require('joi');
const { upiId, phoneNumber, amount, pin, objectId } = require('./common.validation');

const transferByUpi = {
  body: Joi.object().keys({
    receiverUpiId: upiId.required(),
    amount: amount.required().min(1).max(100000),
    pin: pin.required(),
    note: Joi.string().max(100),
  }),
};

const transferByPhone = {
  body: Joi.object().keys({
    receiverPhone: phoneNumber.required(),
    amount: amount.required().min(1).max(100000),
    pin: pin.required(),
    note: Joi.string().max(100),
  }),
};

const transferById = {
  body: Joi.object().keys({
    receiverId: Joi.string().custom(objectId).required(),
    amount: amount.required().min(1).max(100000),
    pin: pin.required(),
    note: Joi.string().max(100),
  }),
};

const checkBalance = {
  body: Joi.object().keys({
    amount: amount.required(),
  }),
};

const verifyReceiver = {
  query: Joi.object().keys({
    upiId: upiId,
    phoneNumber: phoneNumber,
  }).or('upiId', 'phoneNumber'),
};

module.exports = {
  transferByUpi,
  transferByPhone,
  transferById,
  checkBalance,
  verifyReceiver,
};
