/**
 * Token Service
 * Handles JWT access and refresh token operations
 */

const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');
const prisma = require('../config/database');
const AppError = require('../utils/AppError');

/**
 * Generate access token
 * @param {Object} payload - Token payload (user data)
 * @returns {string} Access token
 */
const generateAccessToken = (payload) => {
  return jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn,
    issuer: 'authx',
    subject: payload.userId,
  });
};

/**
 * Generate refresh token and store in database
 * @param {string} userId - User ID
 * @param {Object} metadata - Additional metadata (userAgent, ipAddress)
 * @returns {string} Refresh token
 */
const generateRefreshToken = async (userId, metadata = {}) => {
  const tokenId = uuidv4();
  const expiresAt = new Date();
  
  // Parse refresh token expiry
  const expiresIn = config.jwt.refreshExpiresIn;
  const match = expiresIn.match(/^(\d+)([smhd])$/);
  
  if (match) {
    const value = parseInt(match[1], 10);
    const unit = match[2];
    
    switch (unit) {
      case 's': expiresAt.setSeconds(expiresAt.getSeconds() + value); break;
      case 'm': expiresAt.setMinutes(expiresAt.getMinutes() + value); break;
      case 'h': expiresAt.setHours(expiresAt.getHours() + value); break;
      case 'd': expiresAt.setDate(expiresAt.getDate() + value); break;
    }
  } else {
    // Default to 7 days
    expiresAt.setDate(expiresAt.getDate() + 7);
  }

  const token = jwt.sign(
    { tokenId, userId, type: 'refresh' },
    config.jwt.refreshSecret,
    {
      expiresIn: config.jwt.refreshExpiresIn,
      issuer: 'authx',
      subject: userId,
    }
  );

  // Store refresh token in database
  await prisma.refreshToken.create({
    data: {
      id: tokenId,
      token,
      userId,
      expiresAt,
      userAgent: metadata.userAgent || null,
      ipAddress: metadata.ipAddress || null,
    },
  });

  return token;
};

/**
 * Generate both access and refresh tokens
 */
const generateTokenPair = async (user, metadata = {}) => {
  const payload = {
    userId: user.id,
    email: user.email,
    username: user.username,
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = await generateRefreshToken(user.id, metadata);

  return {
    accessToken,
    refreshToken,
    expiresIn: config.jwt.accessExpiresIn,
  };
};

/**
 * Verify access token
 * @param {string} token - Access token
 * @returns {Object} Decoded token payload
 */
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.accessSecret, {
      issuer: 'authx',
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw AppError.unauthorized('Access token has expired', 'TOKEN_EXPIRED');
    }
    if (error.name === 'JsonWebTokenError') {
      throw AppError.unauthorized('Invalid access token', 'INVALID_TOKEN');
    }
    throw error;
  }
};

/**
 * Verify refresh token
 * @param {string} token - Refresh token
 * @returns {Object} Decoded token payload
 */
const verifyRefreshToken = async (token) => {
  try {
    const decoded = jwt.verify(token, config.jwt.refreshSecret, {
      issuer: 'authx',
    });

    // Check if token exists in database and is not revoked
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token },
    });

    if (!storedToken) {
      throw AppError.unauthorized('Refresh token not found', 'TOKEN_NOT_FOUND');
    }

    if (storedToken.isRevoked) {
      // Potential token theft - revoke all tokens for this user
      await revokeAllUserTokens(storedToken.userId);
      throw AppError.unauthorized('Refresh token has been revoked', 'TOKEN_REVOKED');
    }

    if (new Date() > storedToken.expiresAt) {
      throw AppError.unauthorized('Refresh token has expired', 'TOKEN_EXPIRED');
    }

    return { ...decoded, storedToken };
  } catch (error) {
    if (error instanceof AppError) throw error;
    if (error.name === 'TokenExpiredError') {
      throw AppError.unauthorized('Refresh token has expired', 'TOKEN_EXPIRED');
    }
    if (error.name === 'JsonWebTokenError') {
      throw AppError.unauthorized('Invalid refresh token', 'INVALID_TOKEN');
    }
    throw error;
  }
};

/**
 * Rotate refresh token (invalidate old, issue new)
 */
const rotateRefreshToken = async (oldToken, metadata = {}) => {
  const { storedToken, userId } = await verifyRefreshToken(oldToken);

  // Revoke the old token
  await prisma.refreshToken.update({
    where: { id: storedToken.id },
    data: {
      isRevoked: true,
      revokedAt: new Date(),
    },
  });

  // Get user data for new token pair
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, username: true },
  });

  if (!user) {
    throw AppError.unauthorized('User not found', 'USER_NOT_FOUND');
  }

  // Generate new token pair
  return generateTokenPair(user, metadata);
};

/**
 * Revoke a specific refresh token
 */
const revokeRefreshToken = async (token) => {
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token },
  });

  if (storedToken && !storedToken.isRevoked) {
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: {
        isRevoked: true,
        revokedAt: new Date(),
      },
    });
  }
};

/**
 * Revoke all refresh tokens for a user
 */
const revokeAllUserTokens = async (userId) => {
  await prisma.refreshToken.updateMany({
    where: {
      userId,
      isRevoked: false,
    },
    data: {
      isRevoked: true,
      revokedAt: new Date(),
    },
  });
};

/**
 * Clean up expired tokens (for scheduled job)
 */
const cleanupExpiredTokens = async () => {
  const result = await prisma.refreshToken.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: new Date() } },
        { isRevoked: true, revokedAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
      ],
    },
  });

  return result.count;
};

/**
 * Get active tokens for a user
 */
const getUserActiveTokens = async (userId) => {
  return prisma.refreshToken.findMany({
    where: {
      userId,
      isRevoked: false,
      expiresAt: { gt: new Date() },
    },
    select: {
      id: true,
      userAgent: true,
      ipAddress: true,
      createdAt: true,
      expiresAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateTokenPair,
  verifyAccessToken,
  verifyRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
  cleanupExpiredTokens,
  getUserActiveTokens,
};
