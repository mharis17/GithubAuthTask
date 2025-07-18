import * as issueService from '../services/issueService.js';
import { successResponse, errorResponse } from '../../utils/responseHandler.js';
import asyncHandler from '../../utils/asyncHandler.js';
import logger from '../../utils/logger.js';

// Get all issues with pagination, repository filter, and state filter
const getAllIssues = asyncHandler(async (req, res) => {
  logger.info(`[ISSUE_CONTROLLER] getAllIssues called`);
  logger.info(`[ISSUE_CONTROLLER] Request query params:`, req.query);
  logger.info(`[ISSUE_CONTROLLER] User:`, {
    github_id: req.user?.github_id,
    username: req.user?.username
  });
  logger.info(`[ISSUE_CONTROLLER] Integration:`, {
    _id: req.integration?._id,
    github_id: req.integration?.github_id,
    username: req.integration?.username
  });

  const { page = 1, limit = 10, repository_id, state, author, labels } = req.query;
  
  // Use authenticated user's integration
  const integrationId = req.integration._id;
  
  logger.info(`[ISSUE_CONTROLLER] Calling service with params:`, {
    page: parseInt(page),
    limit: parseInt(limit),
    repository_id,
    state,
    author,
    labels,
    integrationId: integrationId.toString()
  });
  
  const issues = await issueService.getAllIssues({
    page: parseInt(page),
    limit: parseInt(limit),
    repository_id,
    state,
    author,
    labels,
    integrationId
  });
  
  logger.info(`[ISSUE_CONTROLLER] Service returned:`, {
    issuesCount: issues.issues.length,
    pagination: issues.pagination
  });
  
  return successResponse(res, issues, 'Issues retrieved successfully');
});

// Get issue by ID
const getIssueById = asyncHandler(async (req, res) => {
  const { issueId } = req.params;
  
  const issue = await issueService.getIssueById(issueId);
  
  return successResponse(res, issue, 'Issue retrieved successfully');
});

// Get issue by GitHub ID
const getIssueByGitHubId = asyncHandler(async (req, res) => {
  const { githubId } = req.params;
  
  const issue = await issueService.getIssueByGitHubId(githubId);
  
  return successResponse(res, issue, 'Issue retrieved successfully');
});

// Sync issues from GitHub for a repository
const syncIssuesFromGitHub = asyncHandler(async (req, res) => {
  console.log('=== SYNC ISSUES CONTROLLER START ===');
  console.log('Request params:', req.params);
  console.log('Request query:', req.query);
  console.log('Request body:', req.body);
  
  const { repositoryId } = req.params;
  const { state, labels } = req.query;
  
  console.log('Repository ID:', repositoryId);
  console.log('State filter:', state);
  console.log('Labels filter:', labels);
  
  if (!repositoryId) {
    console.log('Repository ID is missing');
    return errorResponse(res, 'Repository ID is required', 400);
  }
  
  const result = await issueService.syncIssuesFromGitHub(repositoryId, { state, labels });
  
  console.log('Sync result:', result);
  console.log('=== SYNC ISSUES CONTROLLER END ===');
  
  logger.info(`Issues synced from GitHub for user: ${req.user.username}, repository: ${repositoryId}`);
  return successResponse(res, result, 'Issues synced successfully');
});

// Get issue statistics for a repository
const getIssueStats = asyncHandler(async (req, res) => {
  const { repositoryId } = req.params;
  
  const stats = await issueService.getIssueStats(repositoryId);
  
  return successResponse(res, stats, 'Issue statistics retrieved successfully');
});

// Check issue sync status for all repositories
const checkIssueSyncStatus = asyncHandler(async (req, res) => {
  logger.info(`[ISSUE_CONTROLLER] checkIssueSyncStatus called`);
  logger.info(`[ISSUE_CONTROLLER] User:`, {
    github_id: req.user?.github_id,
    username: req.user?.username
  });
  
  const integrationId = req.integration._id;
  
  const syncStatus = await issueService.checkIssueSyncStatus(integrationId);
  
  logger.info(`[ISSUE_CONTROLLER] Sync status check completed for ${syncStatus.length} repositories`);
  
  return successResponse(res, { syncStatus }, 'Issue sync status retrieved successfully');
});

export {
  getAllIssues,
  getIssueById,
  getIssueByGitHubId,
  syncIssuesFromGitHub,
  getIssueStats,
  checkIssueSyncStatus
}; 