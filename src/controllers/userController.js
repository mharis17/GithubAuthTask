import * as userService from '../services/userService.js';
import { successResponse, errorResponse, paginatedResponse } from '../../utils/responseHandler.js';
import asyncHandler from '../../utils/asyncHandler.js';

const createUser = asyncHandler(async (req, res) => {
  const userData = req.body;
  
  const existingUser = await userService.getUserByEmail(userData.email);
  if (existingUser) {
    return errorResponse(res, 'User with this email already exists', 400);
  }

  const user = await userService.createUser(userData);
  return successResponse(res, user, 'User created successfully', 201);
});

const getUserById = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const user = await userService.getUserById(userId);
  return successResponse(res, user, 'User retrieved successfully');
});

const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  
  const { users, total } = await userService.getAllUsers(
    parseInt(page),
    parseInt(limit)
  );

  return paginatedResponse(res, users, parseInt(page), parseInt(limit), total, 'Users retrieved successfully');
});

const updateUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const updateData = req.body;

  const user = await userService.updateUser(userId, updateData);
  return successResponse(res, user, 'User updated successfully');
});

const deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const result = await userService.deleteUser(userId);
  return successResponse(res, result, 'User deleted successfully');
});

const getProfile = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    return errorResponse(res, 'User not authenticated', 401);
  }

  const user = await userService.getUserById(userId);
  return successResponse(res, user, 'Profile retrieved successfully');
});

const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    return errorResponse(res, 'User not authenticated', 401);
  }

  const updateData = req.body;
  delete updateData.role;
  delete updateData.status;
  delete updateData.email;
  delete updateData.username;

  const user = await userService.updateUser(userId, updateData);
  return successResponse(res, user, 'Profile updated successfully');
});

export {
  createUser,
  getUserById,
  getAllUsers,
  updateUser,
  deleteUser,
  getProfile,
  updateProfile,
}; 