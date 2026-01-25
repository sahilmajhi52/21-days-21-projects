/**
 * User Service
 * Handles user management operations
 */

const bcrypt = require('bcryptjs');
const prisma = require('../config/database');
const config = require('../config');
const tokenService = require('./token.service');
const AppError = require('../utils/AppError');

/**
 * Get all users with pagination
 */
const getAllUsers = async (options = {}) => {
  const { page = 1, limit = 20, search, isActive, isVerified } = options;

  const where = {};

  if (search) {
    where.OR = [
      { email: { contains: search, mode: 'insensitive' } },
      { username: { contains: search, mode: 'insensitive' } },
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (isActive !== undefined) {
    where.isActive = isActive;
  }

  if (isVerified !== undefined) {
    where.isVerified = isVerified;
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        isActive: true,
        isVerified: true,
        lastLoginAt: true,
        createdAt: true,
        roles: {
          include: {
            role: {
              select: { id: true, name: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  // Transform roles
  const transformedUsers = users.map((user) => ({
    ...user,
    roles: user.roles.map((ur) => ur.role),
  }));

  return { users: transformedUsers, total, page, limit };
};

/**
 * Get user by ID
 */
const getUserById = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      username: true,
      firstName: true,
      lastName: true,
      isActive: true,
      isVerified: true,
      lastLoginAt: true,
      createdAt: true,
      updatedAt: true,
      roles: {
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw AppError.notFound('User not found', 'USER_NOT_FOUND');
  }

  // Transform response
  return {
    ...user,
    roles: user.roles.map((ur) => ({
      id: ur.role.id,
      name: ur.role.name,
      permissions: ur.role.permissions.map((rp) => ({
        id: rp.permission.id,
        name: rp.permission.name,
        resource: rp.permission.resource,
        action: rp.permission.action,
      })),
    })),
  };
};

/**
 * Update user profile
 */
const updateUser = async (id, updateData) => {
  const { firstName, lastName, username } = updateData;

  // Check username uniqueness if being changed
  if (username) {
    const existing = await prisma.user.findFirst({
      where: {
        username,
        NOT: { id },
      },
    });

    if (existing) {
      throw AppError.conflict('Username already taken', 'USERNAME_EXISTS');
    }
  }

  const user = await prisma.user.update({
    where: { id },
    data: {
      firstName: firstName !== undefined ? firstName : undefined,
      lastName: lastName !== undefined ? lastName : undefined,
      username: username !== undefined ? username : undefined,
    },
    select: {
      id: true,
      email: true,
      username: true,
      firstName: true,
      lastName: true,
      isActive: true,
      isVerified: true,
      updatedAt: true,
    },
  });

  return user;
};

/**
 * Update user status (admin)
 */
const updateUserStatus = async (id, status) => {
  const { isActive, isVerified } = status;

  const user = await prisma.user.update({
    where: { id },
    data: {
      isActive: isActive !== undefined ? isActive : undefined,
      isVerified: isVerified !== undefined ? isVerified : undefined,
    },
    select: {
      id: true,
      email: true,
      username: true,
      isActive: true,
      isVerified: true,
    },
  });

  // If user is deactivated, revoke all tokens
  if (isActive === false) {
    await tokenService.revokeAllUserTokens(id);
  }

  return user;
};

/**
 * Delete user
 */
const deleteUser = async (id) => {
  // Revoke all tokens first
  await tokenService.revokeAllUserTokens(id);

  await prisma.user.delete({
    where: { id },
  });

  return true;
};

/**
 * Assign role to user
 */
const assignRole = async (userId, roleId) => {
  // Check if user exists
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw AppError.notFound('User not found', 'USER_NOT_FOUND');
  }

  // Check if role exists
  const role = await prisma.role.findUnique({ where: { id: roleId } });
  if (!role) {
    throw AppError.notFound('Role not found', 'ROLE_NOT_FOUND');
  }

  // Check if already assigned
  const existing = await prisma.userRole.findUnique({
    where: {
      userId_roleId: { userId, roleId },
    },
  });

  if (existing) {
    throw AppError.conflict('Role already assigned to user', 'ROLE_ALREADY_ASSIGNED');
  }

  await prisma.userRole.create({
    data: { userId, roleId },
  });

  return getUserById(userId);
};

/**
 * Remove role from user
 */
const removeRole = async (userId, roleId) => {
  const userRole = await prisma.userRole.findUnique({
    where: {
      userId_roleId: { userId, roleId },
    },
  });

  if (!userRole) {
    throw AppError.notFound('Role not assigned to user', 'ROLE_NOT_ASSIGNED');
  }

  await prisma.userRole.delete({
    where: { id: userRole.id },
  });

  return getUserById(userId);
};

/**
 * Get user's active sessions
 */
const getUserSessions = async (userId) => {
  return prisma.session.findMany({
    where: {
      userId,
      isActive: true,
      expiresAt: { gt: new Date() },
    },
    select: {
      id: true,
      userAgent: true,
      ipAddress: true,
      lastActiveAt: true,
      createdAt: true,
      expiresAt: true,
    },
    orderBy: { lastActiveAt: 'desc' },
  });
};

/**
 * Terminate a specific session
 */
const terminateSession = async (userId, sessionId) => {
  const session = await prisma.session.findFirst({
    where: { id: sessionId, userId },
  });

  if (!session) {
    throw AppError.notFound('Session not found', 'SESSION_NOT_FOUND');
  }

  await prisma.session.update({
    where: { id: sessionId },
    data: { isActive: false },
  });

  return true;
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  updateUserStatus,
  deleteUser,
  assignRole,
  removeRole,
  getUserSessions,
  terminateSession,
};
