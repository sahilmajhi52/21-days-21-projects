const express = require('express');
const authRoutes = require('./auth.routes');
const walletRoutes = require('./wallet.routes');
const transferRoutes = require('./transfer.routes');
const transactionRoutes = require('./transaction.routes');
const bankAccountRoutes = require('./bankAccount.routes');

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'GFGPay API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/wallet', walletRoutes);
router.use('/transfer', transferRoutes);
router.use('/transactions', transactionRoutes);
router.use('/bank-accounts', bankAccountRoutes);

module.exports = router;
