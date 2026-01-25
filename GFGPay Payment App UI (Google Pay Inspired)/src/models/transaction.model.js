const mongoose = require('mongoose');
const { generateReferenceId } = require('../utils/helpers');

const transactionSchema = new mongoose.Schema(
  {
    referenceId: {
      type: String,
      unique: true,
      required: true,
    },
    type: {
      type: String,
      enum: ['transfer', 'deposit', 'withdrawal', 'refund', 'cashback'],
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null for deposits
    },
    senderWallet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Wallet',
      default: null,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null for withdrawals
    },
    receiverWallet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Wallet',
      default: null,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    currency: {
      type: String,
      default: 'INR',
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'reversed', 'cancelled'],
      default: 'pending',
    },
    description: {
      type: String,
      maxlength: [200, 'Description cannot exceed 200 characters'],
    },
    note: {
      type: String,
      maxlength: [100, 'Note cannot exceed 100 characters'],
    },
    metadata: {
      senderUpiId: String,
      receiverUpiId: String,
      senderPhone: String,
      receiverPhone: String,
      senderName: String,
      receiverName: String,
      bankReference: String,
      failureReason: String,
      reversalReason: String,
      originalTransactionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction',
      },
    },
    idempotencyKey: {
      type: String,
      sparse: true,
      unique: true,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    failedAt: {
      type: Date,
      default: null,
    },
    balanceAfterSender: {
      type: Number,
      default: null,
    },
    balanceAfterReceiver: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for efficient queries
transactionSchema.index({ referenceId: 1 });
transactionSchema.index({ sender: 1, createdAt: -1 });
transactionSchema.index({ receiver: 1, createdAt: -1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ type: 1 });
transactionSchema.index({ idempotencyKey: 1 });
transactionSchema.index({ createdAt: -1 });

// Compound index for user transaction history
transactionSchema.index({ sender: 1, receiver: 1, createdAt: -1 });

// Pre-save: Generate reference ID
transactionSchema.pre('save', function (next) {
  if (this.isNew && !this.referenceId) {
    this.referenceId = generateReferenceId();
  }
  next();
});

/**
 * Mark transaction as completed
 */
transactionSchema.methods.markCompleted = async function (senderBalance, receiverBalance) {
  this.status = 'completed';
  this.completedAt = new Date();
  this.balanceAfterSender = senderBalance;
  this.balanceAfterReceiver = receiverBalance;
  await this.save();
};

/**
 * Mark transaction as failed
 */
transactionSchema.methods.markFailed = async function (reason) {
  this.status = 'failed';
  this.failedAt = new Date();
  this.metadata.failureReason = reason;
  await this.save();
};

/**
 * Mark transaction as reversed
 */
transactionSchema.methods.markReversed = async function (reason) {
  this.status = 'reversed';
  this.metadata.reversalReason = reason;
  await this.save();
};

/**
 * Get user transactions
 */
transactionSchema.statics.getUserTransactions = async function (userId, options = {}) {
  const { page = 1, limit = 10, type, status, startDate, endDate } = options;
  const skip = (page - 1) * limit;
  
  const filter = {
    $or: [{ sender: userId }, { receiver: userId }],
  };
  
  if (type) filter.type = type;
  if (status) filter.status = status;
  
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }
  
  const [transactions, total] = await Promise.all([
    this.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'firstName lastName upiId phoneNumber')
      .populate('receiver', 'firstName lastName upiId phoneNumber'),
    this.countDocuments(filter),
  ]);
  
  return { transactions, total, page, limit };
};

/**
 * Find by idempotency key
 */
transactionSchema.statics.findByIdempotencyKey = async function (key) {
  return this.findOne({ idempotencyKey: key });
};

/**
 * Get daily transaction summary for user
 */
transactionSchema.statics.getDailySummary = async function (userId, date = new Date()) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  const summary = await this.aggregate([
    {
      $match: {
        $or: [{ sender: userId }, { receiver: userId }],
        createdAt: { $gte: startOfDay, $lte: endOfDay },
        status: 'completed',
      },
    },
    {
      $group: {
        _id: null,
        totalSent: {
          $sum: {
            $cond: [{ $eq: ['$sender', userId] }, '$amount', 0],
          },
        },
        totalReceived: {
          $sum: {
            $cond: [{ $eq: ['$receiver', userId] }, '$amount', 0],
          },
        },
        transactionCount: { $sum: 1 },
      },
    },
  ]);
  
  return summary[0] || { totalSent: 0, totalReceived: 0, transactionCount: 0 };
};

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
