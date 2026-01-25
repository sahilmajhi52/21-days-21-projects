/**
 * User Controller
 * Handles user management HTTP requests
 */

const userService = require('../services/user.service');
const { success, paginated } = require('../utils/response');

/**
 * @route   GET /api/v1/users
 * @desc    Get all users with pagination
 * @access  Private (requires users:read permission)
 */
const getUsers = async (req, res, next) => {
  try {
    const { page, limit, search, isActive, isVerified } = req.query;

    const result = await userService.getAllUsers({
      page,
      limit,
      search,
      isActive,
      isVerified,
    });

    return paginated(res, result.users, {
      page: result.page,
      limit: result.limit,
      total: result.total,
    }, 'Users retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/v1/users/:id
 * @desc    Get user by ID
 * @access  Private (owner or users:read permission)
 */
const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    return success(res, { user }, 'User retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/v1/users/:id
 * @desc    Update user profile
 * @access  Private (owner or users:update permission)
 */
const updateUser = async (req, res, next) => {
  try {
    const { firstName, lastName, username } = req.body;

    const user = await userService.updateUser(req.params.id, {
      firstName,
      lastName,
      username,
    });

    return success(res, { user }, 'User updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/v1/users/:id/status
 * @desc    Update user status (admin)
 * @access  Private (requires users:manage permission)
 */
const updateUserStatus = async (req, res, next) => {
  try {
    const { isActive, isVerified } = req.body;

    const user = await userService.updateUserStatus(req.params.id, {
      isActive,
      isVerified,
    });

    return success(res, { user }, 'User status updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/v1/users/:id
 * @desc    Delete user
 * @access  Private (requires users:delete permission)
 */
const deleteUser = async (req, res, next) => {
  try {
    await userService.deleteUser(req.params.id);
    return success(res, null, 'User deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/v1/users/:id/roles
 * @desc    Assign role to user
 * @access  Private (requires users:manage permission)
 */
const assignRole = async (req, res, next) => {
  try {
    const { roleId } = req.body;
    const user = await userService.assignRole(req.params.id, roleId);
    return success(res, { user }, 'Role assigned successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/v1/users/:id/roles/:roleId
 * @desc    Remove role from user
 * @access  Private (requires users:manage permission)
 */
const removeRole = async (req, res, next) => {
  try {
    const user = await userService.removeRole(req.params.id, req.params.roleId);
    return success(res, { user }, 'Role removed successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/v1/users/:id/sessions
 * @desc    Get user's active sessions
 * @access  Private (owner or users:manage permission)
 */
const getUserSessions = async (req, res, next) => {
  try {
    const sessions = await userService.getUserSessions(req.params.id);
    return success(res, { sessions }, 'Sessions retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/v1/users/:id/sessions/:sessionId
 * @desc    Terminate a specific session
 * @access  Private (owner or users:manage permission)
 */
const terminateSession = async (req, res, next) => {
  try {
    await userService.terminateSession(req.params.id, req.params.sessionId);
    return success(res, null, 'Session terminated successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  updateUserStatus,
  deleteUser,
  assignRole,
  removeRole,
  getUserSessions,
  terminateSession,
};
