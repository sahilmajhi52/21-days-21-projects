/**
 * Authentication Service
 * Handles user authentication logic
 */

const bcrypt = require('bcryptjs');
const prisma = require('../config/database');
const config = require('../config');
const tokenService = require('./token.service');
const auditService = require('./audit.service');
const AppError = require('../utils/AppError');

/**
 * Register a new user
 */
const register = async (userData, metadata = {}) => {
  const { email, username, password, firstName, lastName } = userData;

  // Check if user already exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { username }],
    },
  });

  if (existingUser) {
    if (existingUser.email === email) {
      throw AppError.conflict('Email already registered', 'EMAIL_EXISTS');
    }
    throw AppError.conflict('Username already taken', 'USERNAME_EXISTS');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, config.bcrypt.saltRounds);

  // Create user with default role
  const user = await prisma.$transaction(async (tx) => {
    // Create the user
    const newUser = await tx.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        firstName: firstName || null,
        lastName: lastName || null,
      },
    });

    // Assign default role if exists
    const defaultRole = await tx.role.findFirst({
      where: { isDefault: true },
    });

    if (defaultRole) {
      await tx.userRole.create({
        data: {
          userId: newUser.id,
          roleId: defaultRole.id,
        },
      });
    }

    return newUser;
  });

  // Generate tokens
  const tokens = await tokenService.generateTokenPair(user, metadata);

  // Log registration
  await auditService.log({
    userId: user.id,
    action: 'REGISTER',
    resource: 'auth',
    details: { email: user.email },
    ...metadata,
  });

  return {
    user: sanitizeUser(user),
    tokens,
  };
};

/**
 * Login user with email/username and password
 */
const login = async (credentials, metadata = {}) => {
  const { email, username, password } = credentials;

  // Find user by email or username
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: email || undefined },
        { username: username || undefined },
      ],
    },
    include: {
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
    await auditService.log({
      action: 'LOGIN_FAILED',
      resource: 'auth',
      details: { reason: 'User not found', identifier: email || username },
      success: false,
      ...metadata,
    });
    throw AppError.unauthorized('Invalid credentials', 'INVALID_CREDENTIALS');
  }

  // Check if user is active
  if (!user.isActive) {
    await auditService.log({
      userId: user.id,
      action: 'LOGIN_FAILED',
      resource: 'auth',
      details: { reason: 'Account disabled' },
      success: false,
      ...metadata,
    });
    throw AppError.forbidden('Account has been disabled', 'ACCOUNT_DISABLED');
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    await auditService.log({
      userId: user.id,
      action: 'LOGIN_FAILED',
      resource: 'auth',
      details: { reason: 'Invalid password' },
      success: false,
      ...metadata,
    });
    throw AppError.unauthorized('Invalid credentials', 'INVALID_CREDENTIALS');
  }

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  // Generate tokens
  const tokens = await tokenService.generateTokenPair(user, metadata);

  // Create session
  const session = await prisma.session.create({
    data: {
      userId: user.id,
      userAgent: metadata.userAgent || null,
      ipAddress: metadata.ipAddress || null,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  // Log successful login
  await auditService.log({
    userId: user.id,
    action: 'LOGIN',
    resource: 'auth',
    details: { sessionId: session.id },
    ...metadata,
  });

  return {
    user: sanitizeUser(user),
    tokens,
  };
};

/**
 * Logout user - revoke refresh token
 */
const logout = async (refreshToken, userId, metadata = {}) => {
  if (refreshToken) {
    await tokenService.revokeRefreshToken(refreshToken);
  }

  // Deactivate sessions
  await prisma.session.updateMany({
    where: {
      userId,
      isActive: true,
    },
    data: {
      isActive: false,
    },
  });

  await auditService.log({
    userId,
    action: 'LOGOUT',
    resource: 'auth',
    ...metadata,
  });
};

/**
 * Logout from all devices - revoke all tokens
 */
const logoutAll = async (userId, metadata = {}) => {
  await tokenService.revokeAllUserTokens(userId);

  await prisma.session.updateMany({
    where: { userId },
    data: { isActive: false },
  });

  await auditService.log({
    userId,
    action: 'LOGOUT_ALL',
    resource: 'auth',
    ...metadata,
  });
};

/**
 * Refresh access token
 */
const refreshToken = async (token, metadata = {}) => {
  const tokens = await tokenService.rotateRefreshToken(token, metadata);
  return tokens;
};

/**
 * Change password
 */
const changePassword = async (userId, currentPassword, newPassword, metadata = {}) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw AppError.notFound('User not found', 'USER_NOT_FOUND');
  }

  // Verify current password
  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

  if (!isPasswordValid) {
    await auditService.log({
      userId,
      action: 'PASSWORD_CHANGE_FAILED',
      resource: 'auth',
      details: { reason: 'Invalid current password' },
      success: false,
      ...metadata,
    });
    throw AppError.unauthorized('Current password is incorrect', 'INVALID_PASSWORD');
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, config.bcrypt.saltRounds);

  // Update password
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  // Revoke all refresh tokens (force re-login on all devices)
  await tokenService.revokeAllUserTokens(userId);

  await auditService.log({
    userId,
    action: 'PASSWORD_CHANGED',
    resource: 'auth',
    ...metadata,
  });

  return true;
};

/**
 * Get current user with roles and permissions
 */
const getCurrentUser = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
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

  return sanitizeUser(user);
};

/**
 * Remove sensitive fields from user object
 */
const sanitizeUser = (user) => {
  const { password, ...sanitized } = user;

  // Extract roles and permissions
  if (sanitized.roles) {
    sanitized.roles = sanitized.roles.map((ur) => ({
      id: ur.role.id,
      name: ur.role.name,
      permissions: ur.role.permissions?.map((rp) => ({
        id: rp.permission.id,
        name: rp.permission.name,
        resource: rp.permission.resource,
        action: rp.permission.action,
      })) || [],
    }));

    // Flatten permissions for easy access
    sanitized.permissions = [...new Set(
      sanitized.roles.flatMap((r) => r.permissions.map((p) => `${p.resource}:${p.action}`))
    )];
  }

  return sanitized;
};

module.exports = {
  register,
  login,
  logout,
  logoutAll,
  refreshToken,
  changePassword,
  getCurrentUser,
  sanitizeUser,
};
