/**
 * Role Controller
 * Handles role and permission management HTTP requests
 */

const roleService = require('../services/role.service');
const { success, created } = require('../utils/response');

// ==================== ROLE ENDPOINTS ====================

/**
 * @route   GET /api/v1/roles
 * @desc    Get all roles
 * @access  Private (requires roles:read permission)
 */
const getRoles = async (req, res, next) => {
  try {
    const roles = await roleService.getAllRoles();
    return success(res, { roles }, 'Roles retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/v1/roles/:id
 * @desc    Get role by ID
 * @access  Private (requires roles:read permission)
 */
const getRoleById = async (req, res, next) => {
  try {
    const role = await roleService.getRoleById(req.params.id);
    return success(res, { role }, 'Role retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/v1/roles
 * @desc    Create a new role
 * @access  Private (requires roles:create permission)
 */
const createRole = async (req, res, next) => {
  try {
    const { name, description, isDefault, permissionIds } = req.body;

    const role = await roleService.createRole({
      name,
      description,
      isDefault,
      permissionIds,
    });

    return created(res, { role }, 'Role created successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/v1/roles/:id
 * @desc    Update a role
 * @access  Private (requires roles:update permission)
 */
const updateRole = async (req, res, next) => {
  try {
    const { name, description, isDefault } = req.body;

    const role = await roleService.updateRole(req.params.id, {
      name,
      description,
      isDefault,
    });

    return success(res, { role }, 'Role updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/v1/roles/:id
 * @desc    Delete a role
 * @access  Private (requires roles:delete permission)
 */
const deleteRole = async (req, res, next) => {
  try {
    await roleService.deleteRole(req.params.id);
    return success(res, null, 'Role deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/v1/roles/:id/permissions
 * @desc    Set all permissions for a role
 * @access  Private (requires roles:manage permission)
 */
const setRolePermissions = async (req, res, next) => {
  try {
    const { permissionIds } = req.body;
    const role = await roleService.setRolePermissions(req.params.id, permissionIds);
    return success(res, { role }, 'Role permissions updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/v1/roles/:roleId/permissions
 * @desc    Assign permission to role
 * @access  Private (requires roles:manage permission)
 */
const assignPermission = async (req, res, next) => {
  try {
    const { permissionId } = req.body;
    const role = await roleService.assignPermissionToRole(req.params.roleId, permissionId);
    return success(res, { role }, 'Permission assigned successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/v1/roles/:roleId/permissions/:permissionId
 * @desc    Remove permission from role
 * @access  Private (requires roles:manage permission)
 */
const removePermission = async (req, res, next) => {
  try {
    const role = await roleService.removePermissionFromRole(
      req.params.roleId,
      req.params.permissionId
    );
    return success(res, { role }, 'Permission removed successfully');
  } catch (error) {
    next(error);
  }
};

// ==================== PERMISSION ENDPOINTS ====================

/**
 * @route   GET /api/v1/permissions
 * @desc    Get all permissions
 * @access  Private (requires roles:read permission)
 */
const getPermissions = async (req, res, next) => {
  try {
    const permissions = await roleService.getAllPermissions();
    return success(res, { permissions }, 'Permissions retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/v1/permissions/grouped
 * @desc    Get permissions grouped by resource
 * @access  Private (requires roles:read permission)
 */
const getPermissionsGrouped = async (req, res, next) => {
  try {
    const permissions = await roleService.getPermissionsByResource();
    return success(res, { permissions }, 'Permissions retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/v1/permissions
 * @desc    Create a new permission
 * @access  Private (requires roles:manage permission)
 */
const createPermission = async (req, res, next) => {
  try {
    const { name, description, resource, action } = req.body;

    const permission = await roleService.createPermission({
      name,
      description,
      resource,
      action,
    });

    return created(res, { permission }, 'Permission created successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/v1/permissions/:id
 * @desc    Delete a permission
 * @access  Private (requires roles:manage permission)
 */
const deletePermission = async (req, res, next) => {
  try {
    await roleService.deletePermission(req.params.id);
    return success(res, null, 'Permission deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  // Role endpoints
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  setRolePermissions,
  assignPermission,
  removePermission,

  // Permission endpoints
  getPermissions,
  getPermissionsGrouped,
  createPermission,
  deletePermission,
};
