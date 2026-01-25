const { Transaction } = require('../models');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

/**
 * Idempotency middleware for payment APIs
 * Prevents duplicate transactions using idempotency key
 */
const checkIdempotency = catchAsync(async (req, res, next) => {
  const idempotencyKey = req.headers['x-idempotency-key'] || req.headers['idempotency-key'];
  
  if (!idempotencyKey) {
    throw ApiError.badRequest('Idempotency-Key header is required for payment operations');
  }
  
  // Validate key format (UUID v4 format recommended)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(idempotencyKey)) {
    throw ApiError.badRequest('Invalid Idempotency-Key format. Use UUID v4.');
  }
  
  // Check if transaction with this key already exists
  const existingTransaction = await Transaction.findByIdempotencyKey(idempotencyKey);
  
  if (existingTransaction) {
    // Return the existing transaction result
    if (existingTransaction.status === 'completed') {
      return res.status(200).json({
        success: true,
        message: 'Transaction already processed',
        data: {
          transactionId: existingTransaction._id,
          referenceId: existingTransaction.referenceId,
          amount: existingTransaction.amount,
          status: existingTransaction.status,
          timestamp: existingTransaction.completedAt,
          idempotent: true,
        },
      });
    }
    
    if (existingTransaction.status === 'failed') {
      throw ApiError.transactionFailed(
        existingTransaction.metadata.failureReason || 'Previous transaction failed'
      );
    }
    
    if (existingTransaction.status === 'pending' || existingTransaction.status === 'processing') {
      return res.status(202).json({
        success: true,
        message: 'Transaction is being processed',
        data: {
          transactionId: existingTransaction._id,
          referenceId: existingTransaction.referenceId,
          status: existingTransaction.status,
        },
      });
    }
  }
  
  // Store idempotency key for new transactions
  req.idempotencyKey = idempotencyKey;
  next();
});

/**
 * Optional idempotency check (doesn't fail if key missing)
 */
const optionalIdempotency = catchAsync(async (req, res, next) => {
  const idempotencyKey = req.headers['x-idempotency-key'] || req.headers['idempotency-key'];
  
  if (idempotencyKey) {
    const existingTransaction = await Transaction.findByIdempotencyKey(idempotencyKey);
    
    if (existingTransaction && existingTransaction.status === 'completed') {
      return res.status(200).json({
        success: true,
        message: 'Transaction already processed',
        data: {
          transactionId: existingTransaction._id,
          referenceId: existingTransaction.referenceId,
          amount: existingTransaction.amount,
          status: existingTransaction.status,
          idempotent: true,
        },
      });
    }
    
    req.idempotencyKey = idempotencyKey;
  }
  
  next();
});

module.exports = {
  checkIdempotency,
  optionalIdempotency,
};
