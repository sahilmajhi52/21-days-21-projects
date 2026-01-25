/**
 * Authentication Service
 * User registration, login, and profile management
 */

const bcrypt = require('bcryptjs');
const { prisma } = require('../config/database');
const config = require('../config');
const AppError = require('../utils/AppError');
const tokenService = require('./token.service');

/**
 * Register new user
 */
const register = async (userData) => {
  const { email, password, firstName, lastName, role = 'AUTHOR' } = userData;
  
  // Check if email exists
  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() }
  });
  
  if (existingUser) {
    throw AppError.conflict('Email already registered');
  }
  
  // Hash password
  const hashedPassword = await bcrypt.hash(password, config.bcrypt.saltRounds);
  
  // Create user
  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      password: hashedPassword,
      firstName,
      lastName,
      role: role === 'ADMIN' ? 'AUTHOR' : role // Only super admin can create admins
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      createdAt: true
    }
  });
  
  // Generate tokens
  const tokens = await tokenService.generateTokens(user);
  
  return { user, ...tokens };
};

/**
 * Login user
 */
const login = async (email, password) => {
  // Find user
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() }
  });
  
  if (!user) {
    throw AppError.unauthorized('Invalid email or password');
  }
  
  if (!user.isActive) {
    throw AppError.forbidden('Account is deactivated');
  }
  
  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.password);
  
  if (!isValidPassword) {
    throw AppError.unauthorized('Invalid email or password');
  }
  
  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() }
  });
  
  // Generate tokens
  const tokens = await tokenService.generateTokens(user);
  
  // Return user without password
  const { password: _, ...userWithoutPassword } = user;
  
  return { user: userWithoutPassword, ...tokens };
};

/**
 * Refresh tokens
 */
const refreshTokens = async (refreshToken) => {
  const decoded = await tokenService.verifyRefreshToken(refreshToken);
  
  // Revoke old token
  await tokenService.revokeToken(refreshToken);
  
  // Get user
  const user = await prisma.user.findUnique({
    where: { id: decoded.userId }
  });
  
  if (!user || !user.isActive) {
    throw AppError.unauthorized('User not found or inactive');
  }
  
  // Generate new tokens
  return tokenService.generateTokens(user);
};

/**
 * Logout user
 */
const logout = async (refreshToken) => {
  await tokenService.revokeToken(refreshToken);
};

/**
 * Get user profile
 */
const getProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      bio: true,
      avatar: true,
      role: true,
      website: true,
      twitter: true,
      linkedin: true,
      isVerified: true,
      createdAt: true,
      _count: {
        select: {
          posts: true,
          comments: true
        }
      }
    }
  });
  
  if (!user) {
    throw AppError.notFound('User not found');
  }
  
  return user;
};

/**
 * Update user profile
 */
const updateProfile = async (userId, updateData) => {
  const { firstName, lastName, bio, avatar, website, twitter, linkedin } = updateData;
  
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
      ...(bio !== undefined && { bio }),
      ...(avatar !== undefined && { avatar }),
      ...(website !== undefined && { website }),
      ...(twitter !== undefined && { twitter }),
      ...(linkedin !== undefined && { linkedin })
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      bio: true,
      avatar: true,
      role: true,
      website: true,
      twitter: true,
      linkedin: true
    }
  });
  
  return user;
};

/**
 * Change password
 */
const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });
  
  if (!user) {
    throw AppError.notFound('User not found');
  }
  
  // Verify current password
  const isValidPassword = await bcrypt.compare(currentPassword, user.password);
  
  if (!isValidPassword) {
    throw AppError.unauthorized('Current password is incorrect');
  }
  
  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, config.bcrypt.saltRounds);
  
  // Update password and revoke all tokens
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword }
  });
  
  await tokenService.revokeAllUserTokens(userId);
  
  return { message: 'Password changed successfully. Please login again.' };
};

module.exports = {
  register,
  login,
  refreshTokens,
  logout,
  getProfile,
  updateProfile,
  changePassword
};
