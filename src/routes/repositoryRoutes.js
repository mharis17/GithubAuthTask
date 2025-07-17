import express from 'express';
import {
  getAllRepositories,
  getRepositoryById,
  getRepositoryByGitHubId,
  syncRepositoriesFromGitHub,
  getRepositoryStats
} from '../controllers/repositoryController.js';

const router = express.Router();

// Get all repositories with pagination, search, and organization filter
router.get('/', getAllRepositories);

// Get repository by ID
router.get('/:repositoryId', getRepositoryById);

// Get repository by GitHub ID
router.get('/github/:githubId', getRepositoryByGitHubId);

// Get repository statistics
router.get('/:repositoryId/stats', getRepositoryStats);

// Sync repositories from GitHub
router.post('/sync/:integrationId', syncRepositoriesFromGitHub);

export default router; 