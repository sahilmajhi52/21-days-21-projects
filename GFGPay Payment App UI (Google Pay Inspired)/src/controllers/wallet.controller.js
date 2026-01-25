const { walletService } = require('../services');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');

const getBalance = catchAsync(async (req, res) => {
  const balance = await walletService.getBalance(req.user._id);
  ApiResponse.success(res, 200, 'Balance retrieved', balance);
});

const addMoney = catchAsync(async (req, res) => {
  const { amount, source, sourceId } = req.body;
  const result = await walletService.addMoney(
    req.user._id,
    amount,
    source,
    sourceId,
    req.idempotencyKey
  );
  ApiResponse.transactionSuccess(res, result.transaction, 'Money added successfully');
});

const withdrawMoney = catchAsync(async (req, res) => {
  const { amount, bankAccountId } = req.body;
  const result = await walletService.withdrawMoney(
    req.user._id,
    amount,
    bankAccountId,
    req.idempotencyKey
  );
  ApiResponse.transactionSuccess(res, result.transaction, 'Withdrawal initiated');
});

const checkTransferEligibility = catchAsync(async (req, res) => {
  const result = await walletService.canTransfer(req.user._id, req.body.amount);
  ApiResponse.success(res, 200, 'Eligibility checked', result);
});

const getWalletTransactions = catchAsync(async (req, res) => {
  const transactions = await walletService.getWalletTransactions(req.user._id);
  ApiResponse.success(res, 200, 'Wallet transactions retrieved', { transactions });
});

module.exports = {
  getBalance,
  addMoney,
  withdrawMoney,
  checkTransferEligibility,
};
