const mongoose = require('mongoose');
const { User, Wallet, Transaction } = require('../models');
const walletService = require('./wallet.service');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');
const config = require('../config');

/**
 * Transfer money by UPI ID
 */
const transferByUpi = async (senderId, receiverUpiId, amount, note, idempotencyKey) => {
  // Find receiver
  const receiver = await User.findByUpiId(receiverUpiId);
  
  if (!receiver) {
    throw ApiError.notFound('Receiver UPI ID not found');
  }
  
  if (receiver._id.toString() === senderId.toString()) {
    throw ApiError.badRequest('Cannot transfer to yourself');
  }
  
  return executeTransfer(senderId, receiver._id, amount, note, idempotencyKey);
};

/**
 * Transfer money by phone number
 */
const transferByPhone = async (senderId, receiverPhone, amount, note, idempotencyKey) => {
  // Find receiver
  const receiver = await User.findByPhone(receiverPhone);
  
  if (!receiver) {
    throw ApiError.notFound('Receiver phone number not registered');
  }
  
  if (receiver._id.toString() === senderId.toString()) {
    throw ApiError.badRequest('Cannot transfer to yourself');
  }
  
  return executeTransfer(senderId, receiver._id, amount, note, idempotencyKey);
};

/**
 * Transfer money by user ID
 */
const transferById = async (senderId, receiverId, amount, note, idempotencyKey) => {
  if (senderId.toString() === receiverId.toString()) {
    throw ApiError.badRequest('Cannot transfer to yourself');
  }
  
  const receiver = await User.findById(receiverId);
  
  if (!receiver || !receiver.isActive) {
    throw ApiError.notFound('Receiver not found');
  }
  
  return executeTransfer(senderId, receiverId, amount, note, idempotencyKey);
};

/**
 * Execute the actual transfer with database transaction
 */
const executeTransfer = async (senderId, receiverId, amount, note, idempotencyKey) => {
  // Validate amount
  if (amount < config.transaction.minAmount) {
    throw ApiError.badRequest(`Minimum transfer amount is ₹${config.transaction.minAmount}`);
  }
  
  if (amount > config.transaction.maxAmount) {
    throw ApiError.badRequest(`Maximum transfer amount is ₹${config.transaction.maxAmount}`);
  }
  
  // Check if sender can transfer
  const canTransferResult = await walletService.canTransfer(senderId, amount);
  if (!canTransferResult.canTransfer) {
    throw ApiError.badRequest(canTransferResult.reason);
  }
  
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Get sender and receiver wallets with lock
    const senderWallet = await Wallet.findOne({ user: senderId, isActive: true }).session(session);
    const receiverWallet = await Wallet.findOne({ user: receiverId, isActive: true }).session(session);
    
    if (!senderWallet) {
      throw ApiError.notFound('Sender wallet not found');
    }
    
    if (!receiverWallet) {
      throw ApiError.notFound('Receiver wallet not found');
    }
    
    if (senderWallet.isLocked) {
      throw ApiError.forbidden('Your wallet is locked');
    }
    
    if (receiverWallet.isLocked) {
      throw ApiError.forbidden('Receiver wallet is locked');
    }
    
    // Double check balance within transaction
    if (!senderWallet.hasSufficientBalance(amount)) {
      throw ApiError.insufficientBalance();
    }
    
    // Get user details for metadata
    const [sender, receiver] = await Promise.all([
      User.findById(senderId).select('firstName lastName upiId phoneNumber'),
      User.findById(receiverId).select('firstName lastName upiId phoneNumber'),
    ]);
    
    // Create transaction record
    const transaction = await Transaction.create(
      [{
        type: 'transfer',
        sender: senderId,
        senderWallet: senderWallet._id,
        receiver: receiverId,
        receiverWallet: receiverWallet._id,
        amount,
        status: 'processing',
        note,
        idempotexncyKey,
        description: `Transfer to ${receiver.fullName}`,
        metadata: {
          senderUpiId: sender.upiId,
          receiverUpiId: receiver.upiId,
          senderPhone: sender.phoneNumber,
          receiverPhone: receiver.phoneNumber,
          senderName: sender.fullName,
          receiverName: receiver.fullName,
        },
      }],
      { session }
    );
    
    // Debit sender
    const updatedSenderWallet = await senderWallet.debit(amount, session);
    
    // Credit receiver
    const updatedReceiverWallet = await receiverWallet.credit(amount, session);
    
    // Mark transaction complete
    transaction[0].status = 'completed';
    transaction[0].completedAt = new Date();
    transaction[0].balanceAfterSender = updatedSenderWallet.balance;
    transaction[0].balanceAfterReceiver = updatedReceiverWallet.balance;
    await transaction[0].save({ session });
    
    await session.commitTransaction();
    
    logger.info(`Transfer completed: ${transaction[0].referenceId} - ₹${amount} from ${sender.upiId} to ${receiver.upiId}`);
    
    return {
      transaction: transaction[0],
      senderBalance: updatedSenderWallet.balance,
    };
  } catch (error) {
    await session.abortTransaction();
    
    logger.error(`Transfer failed: ${error.message}`, {
      senderId,
      receiverId,
      amount,
      error: error.stack,
    });
    
    // If it's already an ApiError, rethrow
    if (error instanceof ApiError) {
      throw error;
    }
    
    throw ApiError.transactionFailed(error.message);
  } finally {
    session.endSession();
  }
};

/**
 * Verify receiver by UPI ID or phone
 */
const verifyReceiver = async (senderId, { upiId, phoneNumber }) => {
  let receiver;
  
  if (upiId) {
    receiver = await User.findByUpiId(upiId);
  } else if (phoneNumber) {
    receiver = await User.findByPhone(phoneNumber);
  }
  
  if (!receiver) {
    throw ApiError.notFound('User not found');
  }
  
  if (receiver._id.toString() === senderId.toString()) {
    throw ApiError.badRequest('Cannot transfer to yourself');
  }
  
  return {
    name: receiver.fullName,
    upiId: receiver.upiId,
    verified: true,
  };
};

/**
 * Reverse a transaction (refund)
 */
const reverseTransaction = async (transactionId, reason, adminId) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const originalTx = await Transaction.findById(transactionId).session(session);
    
    if (!originalTx) {
      throw ApiError.notFound('Transaction not found');
    }
    
    if (originalTx.status !== 'completed') {
      throw ApiError.badRequest('Only completed transactions can be reversed');
    }
    
    if (originalTx.type !== 'transfer') {
      throw ApiError.badRequest('Only transfer transactions can be reversed');
    }
    
    // Get wallets
    const senderWallet = await Wallet.findById(originalTx.senderWallet).session(session);
    const receiverWallet = await Wallet.findById(originalTx.receiverWallet).session(session);
    
    // Debit from receiver (who received the money)
    await receiverWallet.debit(originalTx.amount, session);
    
    // Credit to sender (who sent the money)
    await senderWallet.credit(originalTx.amount, session);
    
    // Create refund transaction
    const refundTx = await Transaction.create(
      [{
        type: 'refund',
        sender: originalTx.receiver,
        senderWallet: originalTx.receiverWallet,
        receiver: originalTx.sender,
        receiverWallet: originalTx.senderWallet,
        amount: originalTx.amount,
        status: 'completed',
        completedAt: new Date(),
        description: `Refund for ${originalTx.referenceId}`,
        metadata: {
          originalTransactionId: originalTx._id,
          reversalReason: reason,
          reversedBy: adminId,
        },
      }],
      { session }
    );
    
    // Mark original transaction as reversed
    originalTx.status = 'reversed';
    originalTx.metadata.reversalReason = reason;
    await originalTx.save({ session });
    
    await session.commitTransaction();
    
    logger.info(`Transaction reversed: ${originalTx.referenceId} - Refund: ${refundTx[0].referenceId}`);
    
    return refundTx[0];
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

module.exports = {
  transferByUpi,
  transferByPhone,
  transferById,
  verifyReceiver,
  reverseTransaction,
};
