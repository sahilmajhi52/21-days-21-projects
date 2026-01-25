const { transactionService } = require('../services');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');

const getTransactions = catchAsync(async (req, res) => {
  const { transactions, pagination } = await transactionService.getTransactions(
    req.user._id,
    req.query
  );
  ApiResponse.paginated(res, transactions, pagination, 'Transactions retrieved');
});

const getTransaction = catchAsync(async (req, res) => {
  const transaction = await transactionService.getTransactionById(
    req.params.transactionId,
    req.user._id
  );
  ApiResponse.success(res, 200, 'Transaction retrieved', { transaction });
});

const getTransactionByReference = catchAsync(async (req, res) => {
  const transaction = await transactionService.getTransactionByReference(
    req.params.referenceId,
    req.user._id
  );
  ApiResponse.success(res, 200, 'Transaction retrieved', { transaction });
});

const getTransactionSummary = catchAsync(async (req, res) => {
  const summary = await transactionService.getTransactionSummary(
    req.user._id,
    req.query.period
  );
  ApiResponse.success(res, 200, 'Summary retrieved', { summary });
});

const getRecentContacts = catchAsync(async (req, res) => {
  const contacts = await transactionService.getRecentContacts(req.user._id);
  ApiResponse.success(res, 200, 'Contacts retrieved', { contacts });
});

const getTransactionByAccountId = catchAsync(async (req, res) => {
  const transactions = await transactionService.getTransactionByAccountId(req.params.accountId, req.user._id);
  ApiResponse.success(res, 200, 'Transactions retrieved', { transactions });
});

module.exports = {
  getTransactions,
  getTransaction,
  getTransactionByReference,
  getTransactionSummary,
  getRecentContacts,
};
