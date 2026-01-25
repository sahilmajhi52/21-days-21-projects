const express = require('express');
const { bankAccountController } = require('../controllers');
const { validate, authenticate } = require('../middleware');
const { bankAccountValidation } = require('../validations');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all bank accounts
router.get('/', bankAccountController.getBankAccounts);

// Add bank account
router.post('/', validate(bankAccountValidation.addBankAccount), bankAccountController.addBankAccount);

// Get bank account by ID
router.get('/:accountId', bankAccountController.getBankAccount);

// Update bank account
router.patch('/:accountId', validate(bankAccountValidation.updateBankAccount), bankAccountController.updateBankAccount);

// Delete bank account
router.delete('/:accountId', validate(bankAccountValidation.deleteBankAccount), bankAccountController.deleteBankAccount);

// Set as primary
router.post('/:accountId/primary', bankAccountController.setPrimaryAccount);

module.exports = router;
