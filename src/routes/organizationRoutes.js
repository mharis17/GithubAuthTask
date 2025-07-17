import express from 'express';
import {
  getAllOrganizations,
  getOrganizationById,
  getOrganizationByGitHubId,
  syncOrganizationsFromGitHub
} from '../controllers/organizationController.js';

const router = express.Router();

// Get all organizations with pagination and search
router.get('/', getAllOrganizations);

// Get organization by ID
router.get('/:organizationId', getOrganizationById);

// Get organization by GitHub ID
router.get('/github/:githubId', getOrganizationByGitHubId);

// Sync organizations from GitHub
router.post('/sync/:integrationId', syncOrganizationsFromGitHub);

export default router; 