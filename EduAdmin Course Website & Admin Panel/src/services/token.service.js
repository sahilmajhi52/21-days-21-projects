const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * Generate access token
 * @param {string} userId - User ID
 * @returns {string} Access token
 */
const generateAccessToken = (userId) => {
  const payload = {
    sub: userId,
    type: 'access',
  };
  
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: `${config.jwt.accessExpirationMinutes}m`,
  });
};

/**
 * Generate refresh token
 * @param {string} userId - User ID
 * @returns {string} Refresh token
 */
const generateRefreshToken = (userId) => {
  const payload = {
    sub: userId,
    type: 'refresh',
  };
  
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: `${config.jwt.refreshExpirationDays}d`,
  });
};

/**
 * Generate both access and refresh tokens
 * @param {string} userId - User ID
 * @returns {Object} Token pair
 */
const generateAuthTokens = (userId) => {
  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken(userId);
  
  return {
    access: {
      token: accessToken,
      expires: new Date(Date.now() + config.jwt.accessExpirationMinutes * 60 * 1000),
    },
    refresh: {
      token: refreshToken,
      expires: new Date(Date.now() + config.jwt.refreshExpirationDays * 24 * 60 * 60 * 1000),
    },
  };
};

/**
 * Verify token
 * @param {string} token - Token to verify
 * @returns {Object} Decoded token payload
 */
const verifyToken = (token) => {
  return jwt.verify(token, config.jwt.secret);
};

/**
 * Verify refresh token
 * @param {string} token - Refresh token
 * @returns {Object} Decoded token payload
 */
const verifyRefreshToken = (token) => {
  const decoded = verifyToken(token);
  
  if (decoded.type !== 'refresh') {
    throw new Error('Invalid token type');
  }
  
  return decoded;
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateAuthTokens,
  verifyToken,
  verifyRefreshToken,
};
