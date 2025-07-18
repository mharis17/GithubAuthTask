import express from 'express';
import {
  getAllPullRequests,
  getPullRequestById,
  getPullRequestByGitHubId,
  syncPullRequestsFromGitHub,
  getPullRequestStats,
  checkPullRequestSyncStatus
} from '../controllers/pullRequestController.js';
import { 
  requireAuth, 
  requireGitHubIntegration,
  requireResourceOwnership 
} from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(requireAuth);
router.use(requireGitHubIntegration);

// Get all pull requests with pagination, repository filter, and state filter
router.get('/', getAllPullRequests);

// Check pull request sync status for all repositories
router.get('/sync-status', checkPullRequestSyncStatus);

// Get pull request by ID (with ownership check)
router.get('/:pullRequestId', requireResourceOwnership('PullRequest'), getPullRequestById);

// Get pull request by GitHub ID
router.get('/github/:githubId', getPullRequestByGitHubId);

// Sync pull requests from GitHub for a repository (with ownership check)
router.post('/sync/:repositoryId', requireResourceOwnership('Repository'), syncPullRequestsFromGitHub);

// Get pull request statistics for a repository (with ownership check)
router.get('/stats/:repositoryId', requireResourceOwnership('Repository'), getPullRequestStats);

export default router; 