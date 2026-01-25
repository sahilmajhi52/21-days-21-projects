const tokenService = require('./token.service');
const authService = require('./auth.service');
const walletService = require('./wallet.service');
const transferService = require('./transfer.service');
const transactionService = require('./transaction.service');
const bankAccountService = require('./bankAccount.service');

module.exports = {
  tokenService,
  authService,
  walletService,
  transferService,
  transactionService,
  bankAccountService,
};
