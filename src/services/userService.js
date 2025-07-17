import User from '../models/User.js';
import logger from '../../utils/logger.js';
import { paginateQuery } from '../../utils/database.js';
import { formatFullName } from '../helpers/formatHelper.js';

const createUser = async (userData) => {
  try {
    const user = new User(userData);
    await user.save();
    
    const userResponse = user.toObject();
    delete userResponse.password;
    
    logger.info(`User created: ${user.email}`);
    return userResponse;
  } catch (error) {
    logger.error('Error creating user:', error);
    throw error;
  }
};

const getUserById = async (userId) => {
  try {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  } catch (error) {
    logger.error(`Error fetching user ${userId}:`, error);
    throw error;
  }
};

const getUserByEmail = async (email) => {
  try {
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    return user;
  } catch (error) {
    logger.error(`Error fetching user by email ${email}:`, error);
    throw error;
  }
};

const getAllUsers = async (page = 1, limit = 10) => {
  try {
    const query = User.find().select('-password').sort({ createdAt: -1 });
    const paginatedQuery = paginateQuery(query, page, limit);
    
    const [users, total] = await Promise.all([
      paginatedQuery,
      User.countDocuments(),
    ]);

    return { users, total };
  } catch (error) {
    logger.error('Error fetching users:', error);
    throw error;
  }
};

const updateUser = async (userId, updateData) => {
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      throw new Error('User not found');
    }

    logger.info(`User updated: ${user.email}`);
    return user;
  } catch (error) {
    logger.error(`Error updating user ${userId}:`, error);
    throw error;
  }
};

const deleteUser = async (userId) => {
  try {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      throw new Error('User not found');
    }

    logger.info(`User deleted: ${user.email}`);
    return { message: 'User deleted successfully' };
  } catch (error) {
    logger.error(`Error deleting user ${userId}:`, error);
    throw error;
  }
};

export {
  createUser,
  getUserById,
  getUserByEmail,
  getAllUsers,
  updateUser,
  deleteUser,
}; 