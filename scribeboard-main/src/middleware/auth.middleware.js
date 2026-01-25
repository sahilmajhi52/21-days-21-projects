/**
 * Authentication Middleware
 */

const { prisma } = require('../config/database');
const tokenService = require('../services/token.service');
const AppError = require('../utils/AppError');

/**
 * Authenticate user via JWT
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw AppError.unauthorized('Access token required');
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = tokenService.verifyAccessToken(token);
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true
      }
    });
    
    if (!user) {
      throw AppError.unauthorized('User not found');
    }
    
    if (!user.isActive) {
      throw AppError.forbidden('Account is deactivated');
    }
    
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional authentication - doesn't fail if no token
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = tokenService.verifyAccessToken(token);
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true
        }
      });
      
      if (user && user.isActive) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Silently continue without authentication
    next();
  }
};

/**
 * Require specific roles
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(AppError.unauthorized('Authentication required'));
    }
    
    if (!roles.includes(req.user.role)) {
      return next(AppError.forbidden(`Access denied. Required roles: ${roles.join(', ')}`));
    }
    
    next();
  };
};

/**
 * Admin only access
 */
const adminOnly = requireRole('ADMIN');

/**
 * Editor or Admin access
 */
const editorOrAdmin = requireRole('ADMIN', 'EDITOR');

/**
 * Author, Editor, or Admin access
 */
const authorOrAbove = requireRole('ADMIN', 'EDITOR', 'AUTHOR');

module.exports = {
  authenticate,
  optionalAuth,
  requireRole,
  adminOnly,
  editorOrAdmin,
  authorOrAbove
};
