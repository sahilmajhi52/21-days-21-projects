const jwt = require('jsonwebtoken');
const config = require('../config');
const { User, Wallet } = require('../models');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

/**
 * Authenticate user using JWT token
 */
const authenticate = catchAsync(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  
  if (!token) {
    throw ApiError.unauthorized('Access token is required');
  }
  
  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    
    const user = await User.findById(decoded.sub);
    if (!user) {
      throw ApiError.unauthorized('User no longer exists');
    }
    
    if (!user.isActive) {
      throw ApiError.unauthorized('User account is deactivated');
    }
    
    // Get wallet
    const wallet = await Wallet.getByUserId(user._id);
    
    req.user = user;
    req.wallet = wallet;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw ApiError.unauthorized('Invalid token');
    }
    if (error.name === 'TokenExpiredError') {
      throw ApiError.unauthorized('Token has expired');
    }
    throw error;
  }
});

/**
 * Verify transaction PIN
 */
const verifyPin = catchAsync(async (req, res, next) => {
  const { pin } = req.body;
  
  if (!pin) {
    throw ApiError.badRequest('Transaction PIN is required');
  }
  
  const user = await User.findById(req.user._id).select('+pin');
  
  if (!user.pin) {
    throw ApiError.badRequest('Please set your transaction PIN first');
  }
  
  const isPinValid = await user.comparePin(pin);
  if (!isPinValid) {
    throw ApiError.unauthorized('Invalid transaction PIN');
  }
  
  next();
});

/**
 * Check if wallet is active and not locked
 */
const checkWalletStatus = catchAsync(async (req, res, next) => {
  const { wallet } = req;
  
  if (!wallet) {
    throw ApiError.badRequest('Wallet not found. Please contact support.');
  }
  
  if (!wallet.isActive) {
    throw ApiError.forbidden('Your wallet has been deactivated');
  }
  
  if (wallet.isLocked) {
    throw ApiError.forbidden(`Your wallet is locked: ${wallet.lockReason || 'Contact support'}`);
  }
  
  next();
});

/**
 * Check KYC status for high-value transactions
 */
const requireKyc = catchAsync(async (req, res, next) => {
  const { user } = req;
  
  if (user.kycStatus !== 'verified') {
    throw ApiError.forbidden('KYC verification required for this transaction');
  }
  
  next();
});

module.exports = {
  authenticate,
  verifyPin,
  checkWalletStatus,
  requireKyc,
};
