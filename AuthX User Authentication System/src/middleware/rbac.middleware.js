/**
 * Role-Based Access Control (RBAC) Middleware
 * Handles authorization based on roles and permissions
 */

const AppError = require('../utils/AppError');

/**
 * Check if user has required role(s)
 * @param {...string} allowedRoles - Role names that are allowed
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(AppError.unauthorized('Authentication required', 'AUTH_REQUIRED'));
    }

    const userRoles = req.user.roles || [];
    const hasRole = allowedRoles.some((role) => userRoles.includes(role));

    if (!hasRole) {
      return next(
        AppError.forbidden(
          `Access denied. Required role(s): ${allowedRoles.join(', ')}`,
          'INSUFFICIENT_ROLE'
        )
      );
    }

    next();
  };
};

/**
 * Check if user has required permission(s)
 * Permission format: "resource:action" (e.g., "users:read", "posts:delete")
 * @param {...string} requiredPermissions - Permissions required (all must be present)
 */
const requirePermission = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(AppError.unauthorized('Authentication required', 'AUTH_REQUIRED'));
    }

    const userPermissions = req.user.permissions || [];
    const missingPermissions = requiredPermissions.filter(
      (perm) => !userPermissions.includes(perm)
    );

    if (missingPermissions.length > 0) {
      return next(
        AppError.forbidden(
          `Access denied. Missing permission(s): ${missingPermissions.join(', ')}`,
          'INSUFFICIENT_PERMISSIONS'
        )
      );
    }

    next();
  };
};

/**
 * Check if user has any of the required permissions
 * @param {...string} permissions - At least one must be present
 */
const requireAnyPermission = (...permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(AppError.unauthorized('Authentication required', 'AUTH_REQUIRED'));
    }

    const userPermissions = req.user.permissions || [];
    const hasAny = permissions.some((perm) => userPermissions.includes(perm));

    if (!hasAny) {
      return next(
        AppError.forbidden(
          `Access denied. Requires one of: ${permissions.join(', ')}`,
          'INSUFFICIENT_PERMISSIONS'
        )
      );
    }

    next();
  };
};

/**
 * Check if user is accessing their own resource or has admin permission
 * @param {string} paramName - Request parameter containing the user ID to check
 * @param {string} adminPermission - Permission that bypasses ownership check
 */
const requireOwnershipOrPermission = (paramName = 'id', adminPermission = 'users:manage') => {
  return (req, res, next) => {
    if (!req.user) {
      return next(AppError.unauthorized('Authentication required', 'AUTH_REQUIRED'));
    }

    const resourceUserId = req.params[paramName];
    const isOwner = req.user.id === resourceUserId;
    const hasAdminPermission = req.user.permissions?.includes(adminPermission);

    if (!isOwner && !hasAdminPermission) {
      return next(
        AppError.forbidden(
          'Access denied. You can only access your own resources.',
          'NOT_OWNER'
        )
      );
    }

    // Attach ownership flag for controller logic
    req.isOwner = isOwner;
    next();
  };
};

/**
 * Check if user has verified email
 */
const requireVerified = (req, res, next) => {
  if (!req.user) {
    return next(AppError.unauthorized('Authentication required', 'AUTH_REQUIRED'));
  }

  if (!req.user.isVerified) {
    return next(
      AppError.forbidden('Email verification required', 'EMAIL_NOT_VERIFIED')
    );
  }

  next();
};

/**
 * Combine multiple authorization checks (all must pass)
 * @param {...Function} middlewares - Authorization middleware functions
 */
const combineAuth = (...middlewares) => {
  return async (req, res, next) => {
    for (const middleware of middlewares) {
      const result = await new Promise((resolve) => {
        middleware(req, res, (error) => {
          resolve(error);
        });
      });

      if (result) {
        return next(result);
      }
    }
    next();
  };
};

/**
 * Resource-based permission check
 * Dynamically checks permission based on HTTP method
 */
const resourcePermission = (resource) => {
  const methodToAction = {
    GET: 'read',
    POST: 'create',
    PUT: 'update',
    PATCH: 'update',
    DELETE: 'delete',
  };

  return (req, res, next) => {
    if (!req.user) {
      return next(AppError.unauthorized('Authentication required', 'AUTH_REQUIRED'));
    }

    const action = methodToAction[req.method] || 'read';
    const permission = `${resource}:${action}`;
    const userPermissions = req.user.permissions || [];

    // Check for specific permission or manage permission
    const hasPermission = 
      userPermissions.includes(permission) || 
      userPermissions.includes(`${resource}:manage`);

    if (!hasPermission) {
      return next(
        AppError.forbidden(
          `Access denied. Required permission: ${permission}`,
          'INSUFFICIENT_PERMISSIONS'
        )
      );
    }

    next();
  };
};

module.exports = {
  requireRole,
  requirePermission,
  requireAnyPermission,
  requireOwnershipOrPermission,
  requireVerified,
  combineAuth,
  resourcePermission,
};
