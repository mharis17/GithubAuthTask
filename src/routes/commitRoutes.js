import express from 'express';
import {
  getAllCommits,
  getCommitById,
  getCommitBySha,
  syncCommitsFromGitHub,
  getCommitStats
} from '../controllers/commitController.js';
import { 
  requireAuth, 
  requireGitHubIntegration,
  requireResourceOwnership 
} from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(requireAuth);
router.use(requireGitHubIntegration);

// Get all commits with pagination, repository filter, and author filter
router.get('/', getAllCommits);

// Get commit by ID (with ownership check)
router.get('/:commitId', requireResourceOwnership('Commit'), getCommitById);

// Get commit by SHA
router.get('/sha/:sha', getCommitBySha);

// Sync commits from GitHub for a repository (with ownership check)
router.post('/sync/:repositoryId', requireResourceOwnership('Repository'), syncCommitsFromGitHub);

// Get commit statistics for a repository (with ownership check)
router.get('/stats/:repositoryId', requireResourceOwnership('Repository'), getCommitStats);

export default router; 