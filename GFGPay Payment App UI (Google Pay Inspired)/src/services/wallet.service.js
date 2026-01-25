const mongoose = require('mongoose');
const { Wallet, Transaction } = require('../models');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');
const config = require('../config');
const { getStartOfDay } = require('../utils/helpers');

/**
 * Get wallet by user ID
 */
const getWallet = async (userId) => {
  const wallet = await Wallet.getByUserId(userId);
  
  if (!wallet) {
    throw ApiError.notFound('Wallet not found');
  }
  
  // Reset daily spent if new day
  await wallet.resetDailySpent();
  
  return wallet;
};

/**
 * Get wallet balance
 */
const getBalance = async (userId) => {
  const wallet = await getWallet(userId);
  
  return {
    balance: wallet.balance,
    currency: wallet.currency,
    dailySpent: wallet.dailySpent,
    dailyLimit: config.transaction.dailyLimit,
    remainingDailyLimit: config.transaction.dailyLimit - wallet.dailySpent,
  };
};

/**
 * Add money to wallet (deposit)
 */
const addMoney = async (userId, amount, source, sourceId = null, idempotencyKey = null) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const wallet = await Wallet.findOne({ user: userId, isActive: true }).session(session);
    
    if (!wallet) {
      throw ApiError.notFound('Wallet not found');
    }
    
    if (wallet.isLocked) {
      throw ApiError.forbidden('Wallet is locked');
    }
    
    // Create transaction record
    const transaction = await Transaction.create(
      [{
        type: 'deposit',
        receiver: userId,
        receiverWallet: wallet._id,
        amount,
        status: 'processing',
        description: `Deposit via ${source}`,
        idempotencyKey,
        metadata: {
          source,
          sourceId,
        },
      }],
      { session }
    );
    
    // Credit wallet
    const updatedWallet = await wallet.credit(amount, session);
    
    // Mark transaction complete
    transaction[0].status = 'completed';
    transaction[0].completedAt = new Date();
    transaction[0].balanceAfterReceiver = updatedWallet.balance;
    await transaction[0].save({ session });
    
    await session.commitTransaction();
    
    logger.info(`Deposit completed: ${transaction[0].referenceId} - Amount: ${amount}`);
    
    return {
      transaction: transaction[0],
      newBalance: updatedWallet.balance,
    };
  } catch (error) {
    await session.abortTransaction();
    logger.error(`Deposit failed for user ${userId}: ${error.message}`);
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Withdraw money from wallet
 */
const withdrawMoney = async (userId, amount, bankAccountId, idempotencyKey = null) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const wallet = await Wallet.findOne({ user: userId, isActive: true }).session(session);
    
    if (!wallet) {
      throw ApiError.notFound('Wallet not found');
    }
    
    if (wallet.isLocked) {
      throw ApiError.forbidden('Wallet is locked');
    }
    
    if (!wallet.hasSufficientBalance(amount)) {
      throw ApiError.insufficientBalance();
    }
    
    // Create transaction record
    const transaction = await Transaction.create(
      [{
        type: 'withdrawal',
        sender: userId,
        senderWallet: wallet._id,
        amount,
        status: 'processing',
        description: 'Withdrawal to bank account',
        idempotencyKey,
        metadata: {
          bankAccountId,
        },
      }],
      { session }
    );
    
    // Debit wallet
    const updatedWallet = await wallet.debit(amount, session);
    
    // Mark transaction complete
    transaction[0].status = 'completed';
    transaction[0].completedAt = new Date();
    transaction[0].balanceAfterSender = updatedWallet.balance;
    await transaction[0].save({ session });
    
    await session.commitTransaction();
    
    logger.info(`Withdrawal completed: ${transaction[0].referenceId} - Amount: ${amount}`);
    
    return {
      transaction: transaction[0],
      newBalance: updatedWallet.balance,
    };
  } catch (error) {
    await session.abortTransaction();
    logger.error(`Withdrawal failed for user ${userId}: ${error.message}`);
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Check if user can transfer amount (balance + daily limit check)
 */
const canTransfer = async (userId, amount) => {
  const wallet = await getWallet(userId);
  
  // Check balance
  if (!wallet.hasSufficientBalance(amount)) {
    return {
      canTransfer: false,
      reason: 'Insufficient balance',
      balance: wallet.balance,
      required: amount,
    };
  }
  
  // Check daily limit
  const remainingLimit = config.transaction.dailyLimit - wallet.dailySpent;
  if (amount > remainingLimit) {
    return {
      canTransfer: false,
      reason: 'Daily transfer limit exceeded',
      dailySpent: wallet.dailySpent,
      dailyLimit: config.transaction.dailyLimit,
      remainingLimit,
      required: amount,
    };
  }
  
  // Check transaction limits
  if (amount < config.transaction.minAmount) {
    return {
      canTransfer: false,
      reason: `Minimum transfer amount is ₹${config.transaction.minAmount}`,
    };
  }
  
  if (amount > config.transaction.maxAmount) {
    return {
      canTransfer: false,
      reason: `Maximum transfer amount is ₹${config.transaction.maxAmount}`,
    };
  }
  
  return {
    canTransfer: true,
    balance: wallet.balance,
    balanceAfterTransfer: wallet.balance - amount,
  };
};

module.exports = {
  getWallet,
  getBalance,
  addMoney,
  withdrawMoney,
  canTransfer,
};
