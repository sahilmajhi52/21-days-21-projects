const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config');
const { generateUpiId } = require('../utils/helpers');

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      match: [/^[6-9]\d{9}$/, 'Please provide a valid Indian phone number'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    pin: {
      type: String,
      minlength: [4, 'PIN must be 4 digits'],
      maxlength: [6, 'PIN cannot exceed 6 digits'],
      select: false,
    },
    upiId: {
      type: String,
      unique: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    kycStatus: {
      type: String,
      enum: ['pending', 'submitted', 'verified', 'rejected'],
      default: 'pending',
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    refreshToken: {
      type: String,
      select: false,
    },
    deviceId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.pin;
        delete ret.refreshToken;
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// Virtual for full name
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ phoneNumber: 1 });
userSchema.index({ upiId: 1 });

// Pre-save middleware to hash password and generate UPI ID
userSchema.pre('save', async function (next) {
  // Hash password if modified
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, config.bcrypt.saltRounds);
  }
  
  // Hash PIN if modified
  if (this.isModified('pin') && this.pin) {
    this.pin = await bcrypt.hash(this.pin, config.bcrypt.saltRounds);
  }
  
  // Generate UPI ID for new users
  if (this.isNew && !this.upiId) {
    this.upiId = generateUpiId(this.phoneNumber);
  }
  
  next();
});

/**
 * Check if password matches
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Check if PIN matches
 */
userSchema.methods.comparePin = async function (candidatePin) {
  if (!this.pin) return false;
  return bcrypt.compare(candidatePin, this.pin);
};

/**
 * Check if email is taken
 */
userSchema.statics.isEmailTaken = async function (email, excludeUserId) {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};

/**
 * Check if phone is taken
 */
userSchema.statics.isPhoneTaken = async function (phoneNumber, excludeUserId) {
  const user = await this.findOne({ phoneNumber, _id: { $ne: excludeUserId } });
  return !!user;
};

/**
 * Find by UPI ID
 */
userSchema.statics.findByUpiId = async function (upiId) {
  return this.findOne({ upiId, isActive: true });
};

/**
 * Find by phone number
 */
userSchema.statics.findByPhone = async function (phoneNumber) {
  return this.findOne({ phoneNumber, isActive: true });
};

const User = mongoose.model('User', userSchema);

module.exports = User;
