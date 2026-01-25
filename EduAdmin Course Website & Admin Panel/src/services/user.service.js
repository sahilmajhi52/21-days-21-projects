const { User } = require('../models');
const ApiError = require('../utils/ApiError');
const { getPagination, getPaginationResult, getSort } = require('../utils/pagination');

/**
 * Get users with pagination and filtering
 * @param {Object} query - Query parameters
 * @returns {Promise<Object>} Users and pagination info
 */
const getUsers = async (query) => {
  const { page, limit, skip } = getPagination(query);
  const sort = getSort(query.sort, ['createdAt', 'firstName', 'lastName', 'email']);
  
  // Build filter
  const filter = {};
  
  if (query.role) {
    filter.role = query.role;
  }
  
  if (query.isActive !== undefined) {
    filter.isActive = query.isActive;
  }
  
  if (query.search) {
    filter.$or = [
      { firstName: { $regex: query.search, $options: 'i' } },
      { lastName: { $regex: query.search, $options: 'i' } },
      { email: { $regex: query.search, $options: 'i' } },
    ];
  }
  
  const [users, totalResults] = await Promise.all([
    User.find(filter).sort(sort).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);
  
  const pagination = getPaginationResult(page, limit, totalResults);
  
  return { users, pagination };
};

/**
 * Get user by ID
 * @param {string} userId - User ID
 * @returns {Promise<User>}
 */
const getUserById = async (userId) => {
  const user = await User.findById(userId);
  
  if (!user) {
    throw ApiError.notFound('User not found');
  }
  
  return user;
};

/**
 * Create a new user (admin only)
 * @param {Object} userData - User data
 * @returns {Promise<User>}
 */
const createUser = async (userData) => {
  if (await User.isEmailTaken(userData.email)) {
    throw ApiError.conflict('Email already taken');
  }
  
  return User.create(userData);
};

/**
 * Update user (admin only)
 * @param {string} userId - User ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<User>}
 */
const updateUser = async (userId, updateData) => {
  const user = await User.findById(userId);
  
  if (!user) {
    throw ApiError.notFound('User not found');
  }
  
  if (updateData.email && (await User.isEmailTaken(updateData.email, userId))) {
    throw ApiError.conflict('Email already taken');
  }
  
  Object.assign(user, updateData);
  await user.save();
  
  return user;
};

/**
 * Delete user
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
const deleteUser = async (userId) => {
  const user = await User.findById(userId);
  
  if (!user) {
    throw ApiError.notFound('User not found');
  }
  
  // Soft delete - just deactivate
  user.isActive = false;
  await user.save();
};

/**
 * Get user statistics
 * @returns {Promise<Object>}
 */
const getStatistics = async () => {
  const [totalUsers, activeUsers, roleStats] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isActive: true }),
    User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]),
  ]);
  
  const byRole = {};
  roleStats.forEach((stat) => {
    byRole[stat._id] = stat.count;
  });
  
  return {
    total: totalUsers,
    active: activeUsers,
    byRole,
  };
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getStatistics,
};
