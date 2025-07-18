import express from 'express';
import {
  getAllGitHubUsers,
  getGitHubUserById,
  getGitHubUserByGitHubId,
  syncGitHubUsersFromGitHub,
  getGitHubUserStats
} from '../controllers/githubUserController.js';
import { 
  requireAuth, 
  requireGitHubIntegration,
  requireResourceOwnership 
} from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(requireAuth);
router.use(requireGitHubIntegration);

// Get all GitHub users with pagination and filters
router.get('/', getAllGitHubUsers);

// Get GitHub user by ID (with ownership check)
router.get('/:userId', requireResourceOwnership('GitHubUser'), getGitHubUserById);

// Get GitHub user by GitHub ID
router.get('/github/:githubId', getGitHubUserByGitHubId);

// Sync GitHub users from GitHub for an organization (with ownership check)
router.post('/sync/:organizationId', requireResourceOwnership('Organization'), syncGitHubUsersFromGitHub);

// Get GitHub user statistics for an organization (with ownership check)
router.get('/stats/:organizationId', requireResourceOwnership('Organization'), getGitHubUserStats);

export default router; 