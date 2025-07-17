import express from 'express';
import {
  getAllCommits,
  getCommitById,
  getCommitBySha,
  syncCommitsFromGitHub,
  getCommitStats
} from '../controllers/commitController.js';

const router = express.Router();

// Get all commits with pagination, repository filter, and author filter
router.get('/', getAllCommits);

// Get commit by ID
router.get('/:commitId', getCommitById);

// Get commit by SHA
router.get('/sha/:sha', getCommitBySha);

// Sync commits from GitHub for a repository
router.post('/sync/:repositoryId', syncCommitsFromGitHub);

// Get commit statistics for a repository
router.get('/stats/:repositoryId', getCommitStats);

export default router; 