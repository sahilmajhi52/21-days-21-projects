/**
 * Audit Service
 * Handles security audit logging
 */

const prisma = require('../config/database');

/**
 * Log an audit event
 * @param {Object} event - Audit event details
 */
const log = async (event) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId: event.userId || null,
        action: event.action,
        resource: event.resource || null,
        details: event.details || null,
        ipAddress: event.ipAddress || null,
        userAgent: event.userAgent || null,
        success: event.success !== false,
      },
    });
  } catch (error) {
    // Don't let audit logging failures affect the main operation
    console.error('Audit logging failed:', error);
  }
};

/**
 * Get audit logs for a user
 */
const getUserLogs = async (userId, options = {}) => {
  const { page = 1, limit = 20, action, startDate, endDate } = options;

  const where = { userId };

  if (action) {
    where.action = action;
  }

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { logs, total, page, limit };
};

/**
 * Get all audit logs (admin)
 */
const getAllLogs = async (options = {}) => {
  const { page = 1, limit = 50, action, userId, startDate, endDate, success } = options;

  const where = {};

  if (action) where.action = action;
  if (userId) where.userId = userId;
  if (success !== undefined) where.success = success;

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: { id: true, email: true, username: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { logs, total, page, limit };
};

/**
 * Clean up old audit logs
 */
const cleanupOldLogs = async (daysToKeep = 90) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  const result = await prisma.auditLog.deleteMany({
    where: {
      createdAt: { lt: cutoffDate },
    },
  });

  return result.count;
};

module.exports = {
  log,
  getUserLogs,
  getAllLogs,
  cleanupOldLogs,
};
