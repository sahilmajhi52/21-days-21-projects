const Joi = require('joi');
const { objectId, pagination } = require('./common.validation');

const getTransactions = {
  query: Joi.object().keys({
    ...pagination,
    type: Joi.string().valid('transfer', 'deposit', 'withdrawal', 'refund', 'cashback'),
    status: Joi.string().valid('pending', 'processing', 'completed', 'failed', 'reversed'),
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')),
  }),
};

const getTransaction = {
  params: Joi.object().keys({
    transactionId: Joi.string().custom(objectId).required(),
  }),
};

const getByReference = {
  params: Joi.object().keys({
    referenceId: Joi.string().required(),
  }),
};

module.exports = {
  getTransactions,
  getTransaction,
  getByReference,
};
