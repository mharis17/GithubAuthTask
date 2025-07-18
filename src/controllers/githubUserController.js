import * as githubUserService from '../services/githubUserService.js';
import { successResponse, errorResponse } from '../../utils/responseHandler.js';
import asyncHandler from '../../utils/asyncHandler.js';
import logger from '../../utils/logger.js';

// Get all GitHub users with pagination and filters
const getAllGitHubUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, organization_id, role } = req.query;
  
  // Use authenticated user's integration
  const integrationId = req.integration._id;
  
  const users = await githubUserService.getAllGitHubUsers({
    page: parseInt(page),
    limit: parseInt(limit),
    organization_id,
    role,
    integrationId
  });
  
  return successResponse(res, users, 'GitHub users retrieved successfully');
});

// Get GitHub user by ID
const getGitHubUserById = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  
  const user = await githubUserService.getGitHubUserById(userId);
  
  return successResponse(res, user, 'GitHub user retrieved successfully');
});

// Get GitHub user by GitHub ID
const getGitHubUserByGitHubId = asyncHandler(async (req, res) => {
  const { githubId } = req.params;
  
  const user = await githubUserService.getGitHubUserByGitHubId(githubId);
  
  return successResponse(res, user, 'GitHub user retrieved successfully');
});

// Sync GitHub users from GitHub for an organization
const syncGitHubUsersFromGitHub = asyncHandler(async (req, res) => {
  console.log('=== SYNC GITHUB USERS CONTROLLER START ===');
  console.log('Request params:', req.params);
  console.log('Request query:', req.query);
  console.log('Request body:', req.body);
  
  const { organizationId } = req.params;
  
  console.log('Organization ID:', organizationId);
  
  if (!organizationId) {
    console.log('Organization ID is missing');
    return errorResponse(res, 'Organization ID is required', 400);
  }
  
  const result = await githubUserService.syncGitHubUsersFromGitHub(organizationId);
  
  console.log('Sync result:', result);
  console.log('=== SYNC GITHUB USERS CONTROLLER END ===');
  
  logger.info(`GitHub users synced from GitHub for user: ${req.user.username}, organization: ${organizationId}`);
  return successResponse(res, result, 'GitHub users synced successfully');
});

// Get GitHub user statistics for an organization
const getGitHubUserStats = asyncHandler(async (req, res) => {
  const { organizationId } = req.params;
  
  const stats = await githubUserService.getGitHubUserStats(organizationId);
  
  return successResponse(res, stats, 'GitHub user statistics retrieved successfully');
});

export {
  getAllGitHubUsers,
  getGitHubUserById,
  getGitHubUserByGitHubId,
  syncGitHubUsersFromGitHub,
  getGitHubUserStats
}; 