const express = require('express');
const { transactionController } = require('../controllers');
const { validate, authenticate } = require('../middleware');
const { transactionValidation } = require('../validations');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get transaction history
router.get('/', validate(transactionValidation.getTransactions), transactionController.getTransactions);

// Get transaction summary
router.get('/summary', transactionController.getTransactionSummary);

// Get recent contacts
router.get('/contacts', transactionController.getRecentContacts);

// Get transaction by ID
router.get('/:transactionId', validate(transactionValidation.getTransaction), transactionController.getTransaction);

// Get transaction by reference ID
router.get('/reference/:referenceId', validate(transactionValidation.getByReference), transactionController.getTransactionByReference);

module.exports = router;
