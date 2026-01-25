/**
 * Role Service
 * Handles role and permission management for RBAC
 */

const prisma = require('../config/database');
const AppError = require('../utils/AppError');

// ==================== ROLE OPERATIONS ====================

/**
 * Get all roles
 */
const getAllRoles = async () => {
  return prisma.role.findMany({
    include: {
      permissions: {
        include: {
          permission: true,
        },
      },
      _count: {
        select: { users: true },
      },
    },
    orderBy: { name: 'asc' },
  });
};

/**
 * Get role by ID
 */
const getRoleById = async (id) => {
  const role = await prisma.role.findUnique({
    where: { id },
    include: {
      permissions: {
        include: {
          permission: true,
        },
      },
      users: {
        include: {
          user: {
            select: { id: true, email: true, username: true },
          },
        },
      },
    },
  });

  if (!role) {
    throw AppError.notFound('Role not found', 'ROLE_NOT_FOUND');
  }

  return {
    ...role,
    permissions: role.permissions.map((rp) => rp.permission),
    users: role.users.map((ur) => ur.user),
  };
};

/**
 * Create a new role
 */
const createRole = async (roleData) => {
  const { name, description, isDefault, permissionIds } = roleData;

  // Check if role name exists
  const existing = await prisma.role.findUnique({ where: { name } });
  if (existing) {
    throw AppError.conflict('Role name already exists', 'ROLE_EXISTS');
  }

  // If this role is default, unset other defaults
  if (isDefault) {
    await prisma.role.updateMany({
      where: { isDefault: true },
      data: { isDefault: false },
    });
  }

  const role = await prisma.role.create({
    data: {
      name,
      description,
      isDefault: isDefault || false,
      permissions: permissionIds?.length > 0 ? {
        create: permissionIds.map((permissionId) => ({
          permissionId,
        })),
      } : undefined,
    },
    include: {
      permissions: {
        include: {
          permission: true,
        },
      },
    },
  });

  return {
    ...role,
    permissions: role.permissions.map((rp) => rp.permission),
  };
};

/**
 * Update a role
 */
const updateRole = async (id, updateData) => {
  const { name, description, isDefault } = updateData;

  // Check if role exists
  const existing = await prisma.role.findUnique({ where: { id } });
  if (!existing) {
    throw AppError.notFound('Role not found', 'ROLE_NOT_FOUND');
  }

  // Check name uniqueness if changed
  if (name && name !== existing.name) {
    const nameExists = await prisma.role.findUnique({ where: { name } });
    if (nameExists) {
      throw AppError.conflict('Role name already exists', 'ROLE_EXISTS');
    }
  }

  // Handle default role change
  if (isDefault === true) {
    await prisma.role.updateMany({
      where: { isDefault: true, NOT: { id } },
      data: { isDefault: false },
    });
  }

  return prisma.role.update({
    where: { id },
    data: {
      name: name || undefined,
      description: description !== undefined ? description : undefined,
      isDefault: isDefault !== undefined ? isDefault : undefined,
    },
    include: {
      permissions: {
        include: {
          permission: true,
        },
      },
    },
  });
};

/**
 * Delete a role
 */
const deleteRole = async (id) => {
  const role = await prisma.role.findUnique({
    where: { id },
    include: { users: true },
  });

  if (!role) {
    throw AppError.notFound('Role not found', 'ROLE_NOT_FOUND');
  }

  if (role.users.length > 0) {
    throw AppError.conflict(
      'Cannot delete role with assigned users. Remove users from role first.',
      'ROLE_HAS_USERS'
    );
  }

  await prisma.role.delete({ where: { id } });
  return true;
};

// ==================== PERMISSION OPERATIONS ====================

/**
 * Get all permissions
 */
const getAllPermissions = async () => {
  return prisma.permission.findMany({
    orderBy: [{ resource: 'asc' }, { action: 'asc' }],
  });
};

/**
 * Get permissions grouped by resource
 */
const getPermissionsByResource = async () => {
  const permissions = await prisma.permission.findMany({
    orderBy: [{ resource: 'asc' }, { action: 'asc' }],
  });

  return permissions.reduce((acc, perm) => {
    if (!acc[perm.resource]) {
      acc[perm.resource] = [];
    }
    acc[perm.resource].push(perm);
    return acc;
  }, {});
};

/**
 * Create a new permission
 */
const createPermission = async (permData) => {
  const { name, description, resource, action } = permData;

  const existing = await prisma.permission.findUnique({
    where: { resource_action: { resource, action } },
  });

  if (existing) {
    throw AppError.conflict('Permission already exists for this resource and action', 'PERMISSION_EXISTS');
  }

  return prisma.permission.create({
    data: { name, description, resource, action },
  });
};

/**
 * Delete a permission
 */
const deletePermission = async (id) => {
  const permission = await prisma.permission.findUnique({ where: { id } });

  if (!permission) {
    throw AppError.notFound('Permission not found', 'PERMISSION_NOT_FOUND');
  }

  await prisma.permission.delete({ where: { id } });
  return true;
};

// ==================== ROLE-PERMISSION OPERATIONS ====================

/**
 * Assign permission to role
 */
const assignPermissionToRole = async (roleId, permissionId) => {
  const role = await prisma.role.findUnique({ where: { id: roleId } });
  if (!role) {
    throw AppError.notFound('Role not found', 'ROLE_NOT_FOUND');
  }

  const permission = await prisma.permission.findUnique({ where: { id: permissionId } });
  if (!permission) {
    throw AppError.notFound('Permission not found', 'PERMISSION_NOT_FOUND');
  }

  const existing = await prisma.rolePermission.findUnique({
    where: { roleId_permissionId: { roleId, permissionId } },
  });

  if (existing) {
    throw AppError.conflict('Permission already assigned to role', 'PERMISSION_ALREADY_ASSIGNED');
  }

  await prisma.rolePermission.create({
    data: { roleId, permissionId },
  });

  return getRoleById(roleId);
};

/**
 * Remove permission from role
 */
const removePermissionFromRole = async (roleId, permissionId) => {
  const rolePermission = await prisma.rolePermission.findUnique({
    where: { roleId_permissionId: { roleId, permissionId } },
  });

  if (!rolePermission) {
    throw AppError.notFound('Permission not assigned to role', 'PERMISSION_NOT_ASSIGNED');
  }

  await prisma.rolePermission.delete({
    where: { id: rolePermission.id },
  });

  return getRoleById(roleId);
};

/**
 * Set all permissions for a role (replace existing)
 */
const setRolePermissions = async (roleId, permissionIds) => {
  const role = await prisma.role.findUnique({ where: { id: roleId } });
  if (!role) {
    throw AppError.notFound('Role not found', 'ROLE_NOT_FOUND');
  }

  // Validate all permission IDs
  if (permissionIds.length > 0) {
    const permissions = await prisma.permission.findMany({
      where: { id: { in: permissionIds } },
    });

    if (permissions.length !== permissionIds.length) {
      throw AppError.badRequest('One or more permission IDs are invalid', 'INVALID_PERMISSIONS');
    }
  }

  // Transaction: delete existing and create new
  await prisma.$transaction([
    prisma.rolePermission.deleteMany({ where: { roleId } }),
    ...permissionIds.map((permissionId) =>
      prisma.rolePermission.create({
        data: { roleId, permissionId },
      })
    ),
  ]);

  return getRoleById(roleId);
};

// ==================== USER PERMISSION CHECKS ====================

/**
 * Check if user has a specific permission
 */
const userHasPermission = async (userId, resource, action) => {
  const count = await prisma.userRole.count({
    where: {
      userId,
      role: {
        permissions: {
          some: {
            permission: {
              resource,
              action,
            },
          },
        },
      },
    },
  });

  return count > 0;
};

/**
 * Check if user has a specific role
 */
const userHasRole = async (userId, roleName) => {
  const count = await prisma.userRole.count({
    where: {
      userId,
      role: { name: roleName },
    },
  });

  return count > 0;
};

/**
 * Get all permissions for a user
 */
const getUserPermissions = async (userId) => {
  const userRoles = await prisma.userRole.findMany({
    where: { userId },
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
  });

  const permissions = new Set();
  userRoles.forEach((ur) => {
    ur.role.permissions.forEach((rp) => {
      permissions.add(`${rp.permission.resource}:${rp.permission.action}`);
    });
  });

  return Array.from(permissions);
};

module.exports = {
  // Role operations
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,

  // Permission operations
  getAllPermissions,
  getPermissionsByResource,
  createPermission,
  deletePermission,

  // Role-Permission operations
  assignPermissionToRole,
  removePermissionFromRole,
  setRolePermissions,

  // User permission checks
  userHasPermission,
  userHasRole,
  getUserPermissions,
};
