import express from 'express';
import {
  getAllRepositories,
  getRepositoryById,
  getRepositoryByGitHubId,
  syncRepositoriesFromGitHub,
  getRepositoryStats
} from '../controllers/repositoryController.js';
import { 
  requireAuth, 
  requireGitHubIntegration,
  requireResourceOwnership 
} from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(requireAuth);
router.use(requireGitHubIntegration);

// Get all repositories with pagination, search, and organization filter
router.get('/', getAllRepositories);

// Get repository by ID (with ownership check)
router.get('/:repositoryId', requireResourceOwnership('Repository'), getRepositoryById);

// Get repository by GitHub ID
router.get('/github/:githubId', getRepositoryByGitHubId);

// Get repository statistics (with ownership check)
router.get('/:repositoryId/stats', requireResourceOwnership('Repository'), getRepositoryStats);

// Sync repositories from GitHub (no integrationId needed - uses authenticated user)
router.post('/sync', syncRepositoriesFromGitHub);

export default router; 