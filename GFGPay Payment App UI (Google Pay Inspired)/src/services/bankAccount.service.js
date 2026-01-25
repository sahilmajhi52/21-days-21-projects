const { BankAccount } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Add bank account
 */
const addBankAccount = async (userId, accountData) => {
  // Check for duplicate account number
  const existing = await BankAccount.findOne({
    user: userId,
    accountNumber: accountData.accountNumber,
    isActive: true,
  });
  
  if (existing) {
    throw ApiError.conflict('Bank account already added');
  }
  
  const bankAccount = await BankAccount.create({
    ...accountData,
    user: userId,
  });
  
  return bankAccount;
};

/**
 * Get all bank accounts for user
 */
const getBankAccounts = async (userId) => {
  return BankAccount.getByUserId(userId);
};

/**
 * Get bank account by ID
 */
const getBankAccountById = async (accountId, userId) => {
  const bankAccount = await BankAccount.findOne({
    _id: accountId,
    user: userId,
    isActive: true,
  });
  
  if (!bankAccount) {
    throw ApiError.notFound('Bank account not found');
  }
  
  return bankAccount;
};

/**
 * Update bank account
 */
const updateBankAccount = async (accountId, userId, updateData) => {
  const bankAccount = await getBankAccountById(accountId, userId);
  
  Object.assign(bankAccount, updateData);
  await bankAccount.save();
  
  return bankAccount;
};

/**
 * Delete bank account
 */
const deleteBankAccount = async (accountId, userId) => {
  const bankAccount = await getBankAccountById(accountId, userId);
  
  // Don't actually delete, just mark as inactive
  bankAccount.isActive = false;
  await bankAccount.save();
};

/**
 * Set primary bank account
 */
const setPrimaryAccount = async (accountId, userId) => {
  const bankAccount = await getBankAccountById(accountId, userId);
  
  bankAccount.isPrimary = true;
  await bankAccount.save();
  
  return bankAccount;
};

module.exports = {
  addBankAccount,
  getBankAccounts,
  getBankAccountById,
  updateBankAccount,
  deleteBankAccount,
  setPrimaryAccount,
};
