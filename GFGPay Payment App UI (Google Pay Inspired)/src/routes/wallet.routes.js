const express = require('express');
const { walletController } = require('../controllers');
const { validate, authenticate, checkWalletStatus, verifyPin, checkIdempotency, paymentLimiter } = require('../middleware');
const { walletValidation, transferValidation } = require('../validations');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get wallet balance
router.get('/balance', walletController.getBalance);

// Check transfer eligibility
router.post('/check-balance', validate(transferValidation.checkBalance), walletController.checkTransferEligibility);

// Add money (deposit)
router.post(
  '/add-money',
  paymentLimiter,
  checkIdempotency,
  checkWalletStatus,
  validate(walletValidation.addMoney),
  walletController.addMoney
);

// Withdraw money
router.post(
  '/withdraw',
  paymentLimiter,
  checkIdempotency,
  checkWalletStatus,
  verifyPin,
  validate(walletValidation.withdrawMoney),
  walletController.withdrawMoney
);

module.exports = router;
