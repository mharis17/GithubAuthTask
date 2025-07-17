import express from 'express';
import {
  getAllOrganizations,
  getOrganizationById,
  getOrganizationByGitHubId,
  syncOrganizationsFromGitHub
} from '../controllers/organizationController.js';
import { 
  requireAuth, 
  requireGitHubIntegration,
  requireResourceOwnership 
} from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(requireAuth);
router.use(requireGitHubIntegration);

// Get all organizations with pagination and search
router.get('/', getAllOrganizations);

// Get organization by ID (with ownership check)
router.get('/:organizationId', requireResourceOwnership('Organization'), getOrganizationById);

// Get organization by GitHub ID
router.get('/github/:githubId', getOrganizationByGitHubId);

// Sync organizations from GitHub (no integrationId needed - uses authenticated user)
router.post('/sync', syncOrganizationsFromGitHub);

export default router; 