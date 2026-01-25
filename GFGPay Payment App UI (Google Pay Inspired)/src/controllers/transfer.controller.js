const { transferService, walletService } = require('../services');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');

const transferByUpi = catchAsync(async (req, res) => {
  const { receiverUpiId, amount, note } = req.body;
  const result = await transferService.transferByUpi(
    req.user._id,
    receiverUpiId,
    amount,
    note,
    req.idempotencyKey
  );
  
  res.status(200).json({
    success: true,
    message: 'Transfer successful',
    data: {
      transactionId: result.transaction._id,
      referenceId: result.transaction.referenceId,
      amount: result.transaction.amount,
      receiverUpiId,
      status: result.transaction.status,
      timestamp: result.transaction.completedAt,
      newBalance: result.senderBalance,
    },
  });
});

const transferByPhone = catchAsync(async (req, res) => {
  const { receiverPhone, amount, note } = req.body;
  const result = await transferService.transferByPhone(
    req.user._id,
    receiverPhone,
    amount,
    note,
    req.idempotencyKey
  );
  
  res.status(200).json({
    success: true,
    message: 'Transfer successful',
    data: {
      transactionId: result.transaction._id,
      referenceId: result.transaction.referenceId,
      amount: result.transaction.amount,
      receiverPhone,
      status: result.transaction.status,
      timestamp: result.transaction.completedAt,
      newBalance: result.senderBalance,
    },
  });
});

const transferById = catchAsync(async (req, res) => {
  const { receiverId, amount, note } = req.body;
  const result = await transferService.transferById(
    req.user._id,
    receiverId,
    amount,
    note,
    req.idempotencyKey
  );
  
  ApiResponse.transactionSuccess(res, result.transaction, 'Transfer successful');
});

const reverseTransaction = catchAsync(async (req, res) => {
  const result = await transferService.reverseTransaction(req.params.transactionId, req.user._id);
  ApiResponse.success(res, 200, 'Transaction reversed', result);
});
const verifyReceiver = catchAsync(async (req, res) => {
  const result = await transferService.verifyReceiver(req.user._id, req.query);
  ApiResponse.success(res, 200, 'Receiver verified', result);
});


module.exports = {
  transferByUpi,
  transferByPhone,
  transferById,
  verifyReceiver,
};
