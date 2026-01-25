const authValidation = require('./auth.validation');
const walletValidation = require('./wallet.validation');
const transferValidation = require('./transfer.validation');
const transactionValidation = require('./transaction.validation');
const bankAccountValidation = require('./bankAccount.validation');

module.exports = {
  authValidation,
  walletValidation,
  transferValidation,
  transactionValidation,
  bankAccountValidation,
};
