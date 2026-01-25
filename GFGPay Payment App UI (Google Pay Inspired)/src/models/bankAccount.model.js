const mongoose = require('mongoose');
const { maskString } = require('../utils/helpers');

const bankAccountSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    bankName: {
      type: String,
      required: [true, 'Bank name is required'],
      trim: true,
    },
    accountNumber: {
      type: String,
      required: [true, 'Account number is required'],
    },
    accountHolderName: {
      type: String,
      required: [true, 'Account holder name is required'],
      trim: true,
    },
    ifscCode: {
      type: String,
      required: [true, 'IFSC code is required'],
      match: [/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code'],
    },
    accountType: {
      type: String,
      enum: ['savings', 'current'],
      default: 'savings',
    },
    isPrimary: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.maskedAccountNumber = maskString(ret.accountNumber, 0, 4);
        delete ret.accountNumber;
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// Indexes
bankAccountSchema.index({ user: 1 });
bankAccountSchema.index({ user: 1, isPrimary: 1 });

// Ensure only one primary account per user
bankAccountSchema.pre('save', async function (next) {
  if (this.isPrimary && this.isModified('isPrimary')) {
    await this.constructor.updateMany(
      { user: this.user, _id: { $ne: this._id } },
      { isPrimary: false }
    );
  }
  next();
});

/**
 * Get primary bank account for user
 */
bankAccountSchema.statics.getPrimary = async function (userId) {
  return this.findOne({ user: userId, isPrimary: true, isActive: true });
};

/**
 * Get all bank accounts for user
 */
bankAccountSchema.statics.getByUserId = async function (userId) {
  return this.find({ user: userId, isActive: true }).sort({ isPrimary: -1 });
};

const BankAccount = mongoose.model('BankAccount', bankAccountSchema);

module.exports = BankAccount;
