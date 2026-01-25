/**
 * Authentication Service
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');
const config = require('../config');
const AppError = require('../utils/AppError');

/**
 * Register new user
 */
const register = async (userData) => {
  const { email, phone, password, firstName, lastName } = userData;

  // Check existing user
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, ...(phone ? [{ phone }] : [])] },
  });

  if (existing) {
    throw AppError.conflict(
      existing.email === email ? 'Email already registered' : 'Phone already registered',
      'USER_EXISTS'
    );
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, config.bcrypt.saltRounds);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      phone,
      password: hashedPassword,
      firstName,
      lastName,
    },
    select: {
      id: true,
      email: true,
      phone: true,
      firstName: true,
      lastName: true,
      role: true,
      createdAt: true,
    },
  });

  // Generate tokens
  const tokens = await generateTokens(user);

  return { user, tokens };
};

/**
 * Login user
 */
const login = async (email, password) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw AppError.unauthorized('Invalid credentials', 'INVALID_CREDENTIALS');
  }

  if (!user.isActive) {
    throw AppError.forbidden('Account is disabled', 'ACCOUNT_DISABLED');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw AppError.unauthorized('Invalid credentials', 'INVALID_CREDENTIALS');
  }

  const tokens = await generateTokens(user);

  const { password: _, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, tokens };
};

/**
 * Generate access and refresh tokens
 */
const generateTokens = async (user) => {
  const accessToken = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    config.jwt.accessSecret,
    { expiresIn: config.jwt.accessExpiresIn }
  );

  const refreshToken = jwt.sign(
    { userId: user.id, type: 'refresh' },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiresIn }
  );

  // Store refresh token
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt,
    },
  });

  return { accessToken, refreshToken, expiresIn: config.jwt.accessExpiresIn };
};

/**
 * Refresh access token
 */
const refreshToken = async (token) => {
  try {
    const decoded = jwt.verify(token, config.jwt.refreshSecret);

    const storedToken = await prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw AppError.unauthorized('Invalid refresh token', 'INVALID_TOKEN');
    }

    // Delete old token
    await prisma.refreshToken.delete({ where: { id: storedToken.id } });

    // Generate new tokens
    return generateTokens(storedToken.user);
  } catch (error) {
    throw AppError.unauthorized('Invalid refresh token', 'INVALID_TOKEN');
  }
};

/**
 * Logout - revoke refresh token
 */
const logout = async (token) => {
  await prisma.refreshToken.deleteMany({ where: { token } });
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
      phone: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw AppError.notFound('User not found', 'USER_NOT_FOUND');
  }

  return user;
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getUserById,
  generateTokens,
};
