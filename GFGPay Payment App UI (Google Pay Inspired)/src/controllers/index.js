const authController = require('./auth.controller');
const walletController = require('./wallet.controller');
const transferController = require('./transfer.controller');
const transactionController = require('./transaction.controller');
const bankAccountController = require('./bankAccount.controller');

module.exports = {
  authController,
  walletController,
  transferController,
  transactionController,
  bankAccountController,
};
