const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    balance: {
      type: Number,
      default: 0,
      min: [0, 'Balance cannot be negative'],
    },
    currency: {
      type: String,
      default: 'INR',
      enum: ['INR'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
    lockReason: {
      type: String,
      default: null,
    },
    dailySpent: {
      type: Number,
      default: 0,
    },
    dailySpentDate: {
      type: Date,
      default: Date.now,
    },
    totalReceived: {
      type: Number,
      default: 0,
    },
    totalSent: {
      type: Number,
      default: 0,
    },
    version: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
walletSchema.index({ user: 1 });
walletSchema.index({ isActive: 1 });

/**
 * Check if wallet has sufficient balance
 */
walletSchema.methods.hasSufficientBalance = function (amount) {
  return this.balance >= amount;
};

/**
 * Credit amount to wallet (atomic operation with optimistic locking)
 */
walletSchema.methods.credit = async function (amount, session = null) {
  const currentVersion = this.version;
  
  const result = await this.constructor.findOneAndUpdate(
    { _id: this._id, version: currentVersion },
    {
      $inc: {
        balance: amount,
        totalReceived: amount,
        version: 1,
      },
    },
    { new: true, session }
  );
  
  if (!result) {
    throw new Error('Wallet update conflict. Please retry.');
  }
  
  return result;
};

/**
 * Debit amount from wallet (atomic operation with optimistic locking)
 */
walletSchema.methods.debit = async function (amount, session = null) {
  const currentVersion = this.version;
  
  // Check balance first
  if (this.balance < amount) {
    throw new Error('Insufficient balance');
  }
  
  const result = await this.constructor.findOneAndUpdate(
    {
      _id: this._id,
      version: currentVersion,
      balance: { $gte: amount },
    },
    {
      $inc: {
        balance: -amount,
        totalSent: amount,
        dailySpent: amount,
        version: 1,
      },
    },
    { new: true, session }
  );
  
  if (!result) {
    throw new Error('Insufficient balance or wallet update conflict');
  }
  
  return result;
};

/**
 * Reset daily spent (called at start of new day)
 */
walletSchema.methods.resetDailySpent = async function () {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (this.dailySpentDate < today) {
    this.dailySpent = 0;
    this.dailySpentDate = today;
    await this.save();
  }
};

/**
 * Lock wallet
 */
walletSchema.methods.lock = async function (reason) {
  this.isLocked = true;
  this.lockReason = reason;
  await this.save();
};

/**
 * Unlock wallet
 */
walletSchema.methods.unlock = async function () {
  this.isLocked = false;
  this.lockReason = null;
  await this.save();
};

/**
 * Get wallet by user ID
 */
walletSchema.statics.getByUserId = async function (userId) {
  return this.findOne({ user: userId, isActive: true });
};

const Wallet = mongoose.model('Wallet', walletSchema);

module.exports = Wallet;
