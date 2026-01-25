/**
 * Token Service
 * JWT token generation and verification
 */

const jwt = require('jsonwebtoken');
const config = require('../config');
const { prisma } = require('../config/database');
const AppError = require('../utils/AppError');

/**
 * Generate access token
 */
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role
    },
    config.jwt.accessSecret,
    { expiresIn: config.jwt.accessExpiresIn }
  );
};

/**
 * Generate refresh token
 */
const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      type: 'refresh'
    },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiresIn }
  );
};

/**
 * Generate both tokens
 */
const generateTokens = async (user) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  
  // Store refresh token in database
  const decoded = jwt.decode(refreshToken);
  await prisma.token.create({
    data: {
      token: refreshToken,
      type: 'REFRESH',
      userId: user.id,
      expiresAt: new Date(decoded.exp * 1000)
    }
  });
  
  return { accessToken, refreshToken };
};

/**
 * Verify access token
 */
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.accessSecret);
  } catch (error) {
    throw AppError.unauthorized('Invalid or expired token');
  }
};

/**
 * Verify refresh token
 */
const verifyRefreshToken = async (token) => {
  try {
    const decoded = jwt.verify(token, config.jwt.refreshSecret);
    
    // Check if token exists and is not revoked
    const storedToken = await prisma.token.findFirst({
      where: {
        token,
        type: 'REFRESH',
        isRevoked: false,
        expiresAt: { gt: new Date() }
      }
    });
    
    if (!storedToken) {
      throw AppError.unauthorized('Invalid refresh token');
    }
    
    return decoded;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw AppError.unauthorized('Invalid or expired refresh token');
  }
};

/**
 * Revoke refresh token
 */
const revokeToken = async (token) => {
  await prisma.token.updateMany({
    where: { token },
    data: { isRevoked: true }
  });
};

/**
 * Revoke all user tokens
 */
const revokeAllUserTokens = async (userId) => {
  await prisma.token.updateMany({
    where: { userId },
    data: { isRevoked: true }
  });
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
  revokeToken,
  revokeAllUserTokens
};
