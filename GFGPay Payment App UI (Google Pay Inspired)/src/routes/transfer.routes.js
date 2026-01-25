const express = require('express');
const { transferController } = require('../controllers');
const { validate, authenticate, checkWalletStatus, verifyPin, checkIdempotency, transferLimiter } = require('../middleware');
const { transferValidation } = require('../validations');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Verify receiver before transfer
router.get('/verify', validate(transferValidation.verifyReceiver), transferController.verifyReceiver);

// Transfer by UPI ID
router.post(
  '/upi',
  transferLimiter,
  checkIdempotency,
  checkWalletStatus,
  verifyPin,
  validate(transferValidation.transferByUpi),
  transferController.transferByUpi
);

// Transfer by phone number
router.post(
  '/phone',
  transferLimiter,
  checkIdempotency,
  checkWalletStatus,
  verifyPin,
  validate(transferValidation.transferByPhone),
  transferController.transferByPhone
);

// Transfer by user ID
router.post(
  '/user',
  transferLimiter,
  checkIdempotency,
  checkWalletStatus,
  verifyPin,
  validate(transferValidation.transferById),
  transferController.transferById
);

module.exports = router;
