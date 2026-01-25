const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * Generate access token
 */
const generateAccessToken = (userId) => {
  const payload = { sub: userId, type: 'access' };
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: `${config.jwt.accessExpirationMinutes}m`,
  });
};

/**
 * Generate refresh token
 */
const generateRefreshToken = (userId) => {
  const payload = { sub: userId, type: 'refresh' };
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: `${config.jwt.refreshExpirationDays}d`,
  });
};

/**
 * Generate both tokens
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
 */
const verifyToken = (token) => {
  return jwt.verify(token, config.jwt.secret);
};

/**
 * Verify refresh token
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
