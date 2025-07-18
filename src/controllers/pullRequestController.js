import * as pullRequestService from '../services/pullRequestService.js';
import { successResponse, errorResponse } from '../../utils/responseHandler.js';
import asyncHandler from '../../utils/asyncHandler.js';
import logger from '../../utils/logger.js';

// Get all pull requests with pagination, repository filter, and state filter
const getAllPullRequests = asyncHandler(async (req, res) => {
  logger.info(`[PULL_REQUEST_CONTROLLER] getAllPullRequests called`);
  logger.info(`[PULL_REQUEST_CONTROLLER] Request query params:`, req.query);
  logger.info(`[PULL_REQUEST_CONTROLLER] User:`, {
    github_id: req.user?.github_id,
    username: req.user?.username
  });
  logger.info(`[PULL_REQUEST_CONTROLLER] Integration:`, {
    _id: req.integration?._id,
    github_id: req.integration?.github_id,
    username: req.integration?.username
  });

  const { page = 1, limit = 10, repository_id, state, author } = req.query;
  
  // Use authenticated user's integration
  const integrationId = req.integration._id;
  
  logger.info(`[PULL_REQUEST_CONTROLLER] Calling service with params:`, {
    page: parseInt(page),
    limit: parseInt(limit),
    repository_id,
    state,
    author,
    integrationId: integrationId.toString()
  });
  
  const pullRequests = await pullRequestService.getAllPullRequests({
    page: parseInt(page),
    limit: parseInt(limit),
    repository_id,
    state,
    author,
    integrationId
  });
  
  logger.info(`[PULL_REQUEST_CONTROLLER] Service returned:`, {
    pullRequestsCount: pullRequests.pullRequests.length,
    pagination: pullRequests.pagination
  });
  
  return successResponse(res, pullRequests, 'Pull requests retrieved successfully');
});

// Get pull request by ID
const getPullRequestById = asyncHandler(async (req, res) => {
  const { pullRequestId } = req.params;
  
  const pullRequest = await pullRequestService.getPullRequestById(pullRequestId);
  
  return successResponse(res, pullRequest, 'Pull request retrieved successfully');
});

// Get pull request by GitHub ID
const getPullRequestByGitHubId = asyncHandler(async (req, res) => {
  const { githubId } = req.params;
  
  const pullRequest = await pullRequestService.getPullRequestByGitHubId(githubId);
  
  return successResponse(res, pullRequest, 'Pull request retrieved successfully');
});

// Sync pull requests from GitHub for a repository
const syncPullRequestsFromGitHub = asyncHandler(async (req, res) => {
  console.log('=== SYNC PULL REQUESTS CONTROLLER START ===');
  console.log('Request params:', req.params);
  console.log('Request query:', req.query);
  console.log('Request body:', req.body);
  
  const { repositoryId } = req.params;
  const { state } = req.query;
  
  console.log('Repository ID:', repositoryId);
  console.log('State filter:', state);
  
  if (!repositoryId) {
    console.log('Repository ID is missing');
    return errorResponse(res, 'Repository ID is required', 400);
  }
  
  const result = await pullRequestService.syncPullRequestsFromGitHub(repositoryId, { state });
  
  console.log('Sync result:', result);
  console.log('=== SYNC PULL REQUESTS CONTROLLER END ===');
  
  logger.info(`Pull requests synced from GitHub for user: ${req.user.username}, repository: ${repositoryId}`);
  return successResponse(res, result, 'Pull requests synced successfully');
});

// Get pull request statistics for a repository
const getPullRequestStats = asyncHandler(async (req, res) => {
  const { repositoryId } = req.params;
  
  const stats = await pullRequestService.getPullRequestStats(repositoryId);
  
  return successResponse(res, stats, 'Pull request statistics retrieved successfully');
});

// Check pull request sync status for all repositories
const checkPullRequestSyncStatus = asyncHandler(async (req, res) => {
  logger.info(`[PULL_REQUEST_CONTROLLER] checkPullRequestSyncStatus called`);
  logger.info(`[PULL_REQUEST_CONTROLLER] User:`, {
    github_id: req.user?.github_id,
    username: req.user?.username
  });
  
  const integrationId = req.integration._id;
  
  const syncStatus = await pullRequestService.checkPullRequestSyncStatus(integrationId);
  
  logger.info(`[PULL_REQUEST_CONTROLLER] Sync status check completed for ${syncStatus.length} repositories`);
  
  return successResponse(res, { syncStatus }, 'Pull request sync status retrieved successfully');
});

export {
  getAllPullRequests,
  getPullRequestById,
  getPullRequestByGitHubId,
  syncPullRequestsFromGitHub,
  getPullRequestStats,
  checkPullRequestSyncStatus
}; 