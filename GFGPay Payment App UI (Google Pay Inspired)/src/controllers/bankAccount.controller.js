const { bankAccountService } = require('../services');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');

const addBankAccount = catchAsync(async (req, res) => {
  const bankAccount = await bankAccountService.addBankAccount(req.user._id, req.body);
  ApiResponse.success(res, 201, 'Bank account added', { bankAccount });
});

const getBankAccounts = catchAsync(async (req, res) => {
  const bankAccounts = await bankAccountService.getBankAccounts(req.user._id);
  ApiResponse.success(res, 200, 'Bank accounts retrieved', { bankAccounts });
});

const getBankAccount = catchAsync(async (req, res) => {
  const bankAccount = await bankAccountService.getBankAccountById(
    req.params.accountId,
    req.user._id
  );
  ApiResponse.success(res, 200, 'Bank account retrieved', { bankAccount });
});

const updateBankAccount = catchAsync(async (req, res) => {
  const bankAccount = await bankAccountService.updateBankAccount(
    req.params.accountId,
    req.user._id,
    req.body
  );
  ApiResponse.success(res, 200, 'Bank account updated', { bankAccount });
});

const deleteBankAccount = catchAsync(async (req, res) => {
  await bankAccountService.deleteBankAccount(req.params.accountId, req.user._id);
  ApiResponse.success(res, 200, 'Bank account removed');
});

const setPrimaryAccount = catchAsync(async (req, res) => {
  const bankAccount = await bankAccountService.setPrimaryAccount(
    req.params.accountId,
    req.user._id
  );
  ApiResponse.success(res, 200, 'Primary account set', { bankAccount });
});

const getBankAccountTransactions = catchAsync(async (req, res) => {
  const transactions = await bankAccountService.getBankAccountTransactions(req.params.accountId, req.user._id);
  ApiResponse.success(res, 200, 'Bank account transactions retrieved', { transactions });
});

module.exports = {
  addBankAccount,
  getBankAccounts,
  getBankAccount,
  updateBankAccount,
  deleteBankAccount,
  setPrimaryAccount,
};
