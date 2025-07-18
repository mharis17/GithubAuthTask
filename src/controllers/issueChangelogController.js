import * as issueChangelogService from '../services/issueChangelogService.js';
import { successResponse, errorResponse } from '../../utils/responseHandler.js';
import asyncHandler from '../../utils/asyncHandler.js';
import logger from '../../utils/logger.js';

// Get all issue changelogs with pagination and filters
const getAllIssueChangelogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, issue_id, repository_id } = req.query;
  
  // Use authenticated user's integration
  const integrationId = req.integration._id;
  
  const changelogs = await issueChangelogService.getAllIssueChangelogs({
    page: parseInt(page),
    limit: parseInt(limit),
    issue_id,
    repository_id,
    integrationId
  });
  
  return successResponse(res, changelogs, 'Issue changelogs retrieved successfully');
});

// Get issue changelog by ID
const getIssueChangelogById = asyncHandler(async (req, res) => {
  const { changelogId } = req.params;
  
  const changelog = await issueChangelogService.getIssueChangelogById(changelogId);
  
  return successResponse(res, changelog, 'Issue changelog retrieved successfully');
});

// Get issue changelog by GitHub ID
const getIssueChangelogByGitHubId = asyncHandler(async (req, res) => {
  const { githubId } = req.params;
  
  const changelog = await issueChangelogService.getIssueChangelogByGitHubId(githubId);
  
  return successResponse(res, changelog, 'Issue changelog retrieved successfully');
});

// Sync issue changelogs from GitHub for an issue
const syncIssueChangelogsFromGitHub = asyncHandler(async (req, res) => {
  console.log('=== SYNC ISSUE CHANGELOGS CONTROLLER START ===');
  console.log('Request params:', req.params);
  console.log('Request query:', req.query);
  console.log('Request body:', req.body);
  
  const { issueId } = req.params;
  
  console.log('Issue ID:', issueId);
  
  if (!issueId) {
    console.log('Issue ID is missing');
    return errorResponse(res, 'Issue ID is required', 400);
  }
  
  const result = await issueChangelogService.syncIssueChangelogsFromGitHub(issueId);
  
  console.log('Sync result:', result);
  console.log('=== SYNC ISSUE CHANGELOGS CONTROLLER END ===');
  
  logger.info(`Issue changelogs synced from GitHub for user: ${req.user.username}, issue: ${issueId}`);
  return successResponse(res, result, 'Issue changelogs synced successfully');
});

// Get issue changelog statistics for an issue
const getIssueChangelogStats = asyncHandler(async (req, res) => {
  const { issueId } = req.params;
  
  const stats = await issueChangelogService.getIssueChangelogStats(issueId);
  
  return successResponse(res, stats, 'Issue changelog statistics retrieved successfully');
});

export {
  getAllIssueChangelogs,
  getIssueChangelogById,
  getIssueChangelogByGitHubId,
  syncIssueChangelogsFromGitHub,
  getIssueChangelogStats
}; 