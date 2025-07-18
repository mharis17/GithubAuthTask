import * as commitService from '../services/commitService.js';
import { successResponse, errorResponse } from '../../utils/responseHandler.js';
import asyncHandler from '../../utils/asyncHandler.js';
import logger from '../../utils/logger.js';

// Get all commits with pagination, repository filter, and author filter
const getAllCommits = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, repository_id, author } = req.query;
  
  // Use authenticated user's integration
  const integrationId = req.integration._id;
  
  const commits = await commitService.getAllCommits({
    page: parseInt(page),
    limit: parseInt(limit),
    repository_id,
    author,
    integrationId
  });
  
  return successResponse(res, commits, 'Commits retrieved successfully');
});

// Get commit by ID
const getCommitById = asyncHandler(async (req, res) => {
  const { commitId } = req.params;
  
  const commit = await commitService.getCommitById(commitId);
  
  return successResponse(res, commit, 'Commit retrieved successfully');
});

// Get commit by SHA
const getCommitBySha = asyncHandler(async (req, res) => {
  const { sha } = req.params;
  
  const commit = await commitService.getCommitBySha(sha);
  
  return successResponse(res, commit, 'Commit retrieved successfully');
});

// Sync commits from GitHub for a repository
const syncCommitsFromGitHub = asyncHandler(async (req, res) => {
  console.log('=== SYNC COMMITS CONTROLLER START ===');
  console.log('Request params:', req.params);
  console.log('Request query:', req.query);
  console.log('Request body:', req.body);
  
  const { repositoryId } = req.params;
  const { since, until } = req.query;
  
  console.log('Repository ID:', repositoryId);
  console.log('Since:', since);
  console.log('Until:', until);
  
  if (!repositoryId) {
    console.log('Repository ID is missing');
    return errorResponse(res, 'Repository ID is required', 400);
  }
  
  const result = await commitService.syncCommitsFromGitHub(repositoryId, { since, until });
  
  console.log('Sync result:', result);
  console.log('=== SYNC COMMITS CONTROLLER END ===');
  
  logger.info(`Commits synced from GitHub for user: ${req.user.username}, repository: ${repositoryId}`);
  return successResponse(res, result, 'Commits synced successfully');
});

// Get commit statistics for a repository
const getCommitStats = asyncHandler(async (req, res) => {
  const { repositoryId } = req.params;
  const { period = '30d' } = req.query;
  
  const stats = await commitService.getCommitStats(repositoryId, period);
  
  return successResponse(res, stats, 'Commit statistics retrieved successfully');
});

export {
  getAllCommits,
  getCommitById,
  getCommitBySha,
  syncCommitsFromGitHub,
  getCommitStats
}; 