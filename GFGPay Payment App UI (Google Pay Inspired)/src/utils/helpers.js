const { v4: uuidv4 } = require('uuid');
const config = require('../config');

/**
 * Generate unique reference ID for transactions
 * Format: GFG + timestamp + random string
 */
const generateReferenceId = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = uuidv4().split('-')[0].toUpperCase();
  return `GFG${timestamp}${random}`;
};

/**
 * Generate UPI ID from phone number
 */
const generateUpiId = (phoneNumber) => {
  return `${phoneNumber}${config.upi.suffix}`;
};

/**
 * Mask sensitive data (card numbers, phone numbers)
 */
const maskString = (str, visibleStart = 4, visibleEnd = 4, maskChar = '*') => {
  if (!str || str.length <= visibleStart + visibleEnd) {
    return str;
  }
  const start = str.slice(0, visibleStart);
  const end = str.slice(-visibleEnd);
  const masked = maskChar.repeat(str.length - visibleStart - visibleEnd);
  return `${start}${masked}${end}`;
};

/**
 * Format currency amount
 */
const formatAmount = (amount, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
  }).format(amount);
};

/**
 * Calculate pagination
 */
const getPagination = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

/**
 * Build pagination result
 */
const getPaginationResult = (page, limit, totalResults) => {
  const totalPages = Math.ceil(totalResults / limit);
  return { page, limit, totalPages, totalResults };
};

/**
 * Get start of day for date queries
 */
const getStartOfDay = (date = new Date()) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
};

/**
 * Get end of day for date queries
 */
const getEndOfDay = (date = new Date()) => {
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return end;
};

/**
 * Validate Indian phone number
 */
const isValidIndianPhone = (phone) => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone);
};

/**
 * Validate UPI ID format
 */
const isValidUpiId = (upiId) => {
  const upiRegex = /^[\w.-]+@[\w]+$/;
  return upiRegex.test(upiId);
};

module.exports = {
  generateReferenceId,
  generateUpiId,
  maskString,
  formatAmount,
  getPagination,
  getPaginationResult,
  getStartOfDay,
  getEndOfDay,
  isValidIndianPhone,
  isValidUpiId,
};
