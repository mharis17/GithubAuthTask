import express from 'express';
import {
  getAllIssueChangelogs,
  getIssueChangelogById,
  getIssueChangelogByGitHubId,
  syncIssueChangelogsFromGitHub,
  getIssueChangelogStats
} from '../controllers/issueChangelogController.js';
import { 
  requireAuth, 
  requireGitHubIntegration,
  requireResourceOwnership 
} from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(requireAuth);
router.use(requireGitHubIntegration);

// Get all issue changelogs with pagination and filters
router.get('/', getAllIssueChangelogs);

// Get issue changelog by ID (with ownership check)
router.get('/:changelogId', requireResourceOwnership('IssueChangelog'), getIssueChangelogById);

// Get issue changelog by GitHub ID
router.get('/github/:githubId', getIssueChangelogByGitHubId);

// Sync issue changelogs from GitHub for an issue (with ownership check)
router.post('/sync/:issueId', requireResourceOwnership('Issue'), syncIssueChangelogsFromGitHub);

// Get issue changelog statistics for an issue (with ownership check)
router.get('/stats/:issueId', requireResourceOwnership('Issue'), getIssueChangelogStats);

export default router; 