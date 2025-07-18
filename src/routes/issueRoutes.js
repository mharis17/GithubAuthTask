import express from 'express';
import {
  getAllIssues,
  getIssueById,
  getIssueByGitHubId,
  syncIssuesFromGitHub,
  getIssueStats,
  checkIssueSyncStatus
} from '../controllers/issueController.js';
import { 
  requireAuth, 
  requireGitHubIntegration,
  requireResourceOwnership 
} from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(requireAuth);
router.use(requireGitHubIntegration);

// Get all issues with pagination, repository filter, and state filter
router.get('/', getAllIssues);

// Check issue sync status for all repositories
router.get('/sync-status', checkIssueSyncStatus);

// Get issue by ID (with ownership check)
router.get('/:issueId', requireResourceOwnership('Issue'), getIssueById);

// Get issue by GitHub ID
router.get('/github/:githubId', getIssueByGitHubId);

// Sync issues from GitHub for a repository (with ownership check)
router.post('/sync/:repositoryId', requireResourceOwnership('Repository'), syncIssuesFromGitHub);

// Get issue statistics for a repository (with ownership check)
router.get('/stats/:repositoryId', requireResourceOwnership('Repository'), getIssueStats);

export default router; 