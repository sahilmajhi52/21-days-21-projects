const { Transaction } = require('../models');
const ApiError = require('../utils/ApiError');
const { getPagination, getPaginationResult } = require('../utils/helpers');

/**
 * Get user transactions with filters
 */
const getTransactions = async (userId, query) => {
  const { page, limit, skip } = getPagination(query);
  
  const filter = {
    $or: [{ sender: userId }, { receiver: userId }],
  };
  
  if (query.type) {
    filter.type = query.type;
  }
  
  if (query.status) {
    filter.status = query.status;
  }
  
  if (query.startDate || query.endDate) {
    filter.createdAt = {};
    if (query.startDate) filter.createdAt.$gte = new Date(query.startDate);
    if (query.endDate) filter.createdAt.$lte = new Date(query.endDate);
  }
  
  const [transactions, totalResults] = await Promise.all([
    Transaction.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'firstName lastName upiId phoneNumber')
      .populate('receiver', 'firstName lastName upiId phoneNumber'),
    Transaction.countDocuments(filter),
  ]);
  
  // Add transaction direction for each transaction
  const formattedTransactions = transactions.map((tx) => {
    const txObj = tx.toObject();
    txObj.direction = tx.sender?._id?.toString() === userId.toString() ? 'debit' : 'credit';
    return txObj;
  });
  
  const pagination = getPaginationResult(page, limit, totalResults);
  
  return { transactions: formattedTransactions, pagination };
};

/**
 * Get transaction by ID
 */
const getTransactionById = async (transactionId, userId) => {
  const transaction = await Transaction.findById(transactionId)
    .populate('sender', 'firstName lastName upiId phoneNumber')
    .populate('receiver', 'firstName lastName upiId phoneNumber');
  
  if (!transaction) {
    throw ApiError.notFound('Transaction not found');
  }
  
  // Check if user is part of this transaction
  const isSender = transaction.sender?._id?.toString() === userId.toString();
  const isReceiver = transaction.receiver?._id?.toString() === userId.toString();
  
  if (!isSender && !isReceiver) {
    throw ApiError.forbidden('You do not have access to this transaction');
  }
  
  const txObj = transaction.toObject();
  txObj.direction = isSender ? 'debit' : 'credit';
  
  return txObj;
};

/**
 * Get transaction by reference ID
 */
const getTransactionByReference = async (referenceId, userId) => {
  const transaction = await Transaction.findOne({ referenceId })
    .populate('sender', 'firstName lastName upiId phoneNumber')
    .populate('receiver', 'firstName lastName upiId phoneNumber');
  
  if (!transaction) {
    throw ApiError.notFound('Transaction not found');
  }
  
  // Check access
  const isSender = transaction.sender?._id?.toString() === userId.toString();
  const isReceiver = transaction.receiver?._id?.toString() === userId.toString();
  
  if (!isSender && !isReceiver) {
    throw ApiError.forbidden('You do not have access to this transaction');
  }
  
  const txObj = transaction.toObject();
  txObj.direction = isSender ? 'debit' : 'credit';
  
  return txObj;
};

/**
 * Get transaction summary
 */
const getTransactionSummary = async (userId, period = 'month') => {
  const startDate = new Date();
  
  switch (period) {
    case 'day':
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'week':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(startDate.getMonth() - 1);
      break;
    case 'year':
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
    default:
      startDate.setMonth(startDate.getMonth() - 1);
  }
  
  const summary = await Transaction.aggregate([
    {
      $match: {
        $or: [{ sender: userId }, { receiver: userId }],
        status: 'completed',
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: null,
        totalSent: {
          $sum: {
            $cond: [
              { $eq: ['$sender', userId] },
              '$amount',
              0,
            ],
          },
        },
        totalReceived: {
          $sum: {
            $cond: [
              { $eq: ['$receiver', userId] },
              '$amount',
              0,
            ],
          },
        },
        transactionCount: { $sum: 1 },
        sentCount: {
          $sum: {
            $cond: [{ $eq: ['$sender', userId] }, 1, 0],
          },
        },
        receivedCount: {
          $sum: {
            $cond: [{ $eq: ['$receiver', userId] }, 1, 0],
          },
        },
      },
    },
  ]);
  
  return summary[0] || {
    totalSent: 0,
    totalReceived: 0,
    transactionCount: 0,
    sentCount: 0,
    receivedCount: 0,
  };
};

/**
 * Get recent contacts (users transacted with)
 */
const getRecentContacts = async (userId, limit = 10) => {
  const recentTransactions = await Transaction.aggregate([
    {
      $match: {
        $or: [{ sender: userId }, { receiver: userId }],
        status: 'completed',
        type: 'transfer',
      },
    },
    { $sort: { createdAt: -1 } },
    {
      $project: {
        contact: {
          $cond: [
            { $eq: ['$sender', userId] },
            '$receiver',
            '$sender',
          ],
        },
        createdAt: 1,
      },
    },
    {
      $group: {
        _id: '$contact',
        lastTransaction: { $first: '$createdAt' },
      },
    },
    { $sort: { lastTransaction: -1 } },
    { $limit: limit },
  ]);
  
  // Populate contact details
  const contactIds = recentTransactions.map((t) => t._id);
  const { User } = require('../models');
  
  const contacts = await User.find({ _id: { $in: contactIds } })
    .select('firstName lastName upiId phoneNumber');
  
  // Map back with last transaction date
  return recentTransactions.map((t) => {
    const contact = contacts.find((c) => c._id.toString() === t._id.toString());
    return {
      ...contact?.toObject(),
      lastTransaction: t.lastTransaction,
    };
  });
};

module.exports = {
  getTransactions,
  getTransactionById,
  getTransactionByReference,
  getTransactionSummary,
  getRecentContacts,
};
