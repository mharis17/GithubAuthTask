import * as organizationService from '../services/organizationService.js';
import { successResponse, errorResponse } from '../../utils/responseHandler.js';
import asyncHandler from '../../utils/asyncHandler.js';
import logger from '../../utils/logger.js';

// Get all organizations with pagination and search
const getAllOrganizations = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search } = req.query;
  
  // Use authenticated user's integration
  const integrationId = req.integration._id;
  
  const organizations = await organizationService.getAllOrganizations({
    page: parseInt(page),
    limit: parseInt(limit),
    search,
    integrationId
  });
  
  return successResponse(res, organizations, 'Organizations retrieved successfully');
});

// Get organization by ID
const getOrganizationById = asyncHandler(async (req, res) => {
  const { organizationId } = req.params;
  
  const organization = await organizationService.getOrganizationById(organizationId);
  
  return successResponse(res, organization, 'Organization retrieved successfully');
});

// Get organization by GitHub ID
const getOrganizationByGitHubId = asyncHandler(async (req, res) => {
  const { githubId } = req.params;
  
  const organization = await organizationService.getOrganizationByGitHubId(githubId);
  
  return successResponse(res, organization, 'Organization retrieved successfully');
});

// Sync organizations from GitHub
const syncOrganizationsFromGitHub = asyncHandler(async (req, res) => {
  // Use authenticated user's integration
  const integrationId = req.integration._id;
  
  const result = await organizationService.syncOrganizationsFromGitHub(integrationId);
  
  logger.info(`Organizations synced from GitHub for user: ${req.user.login}`);
  return successResponse(res, result, 'Organizations synced successfully');
});

export {
  getAllOrganizations,
  getOrganizationById,
  getOrganizationByGitHubId,
  syncOrganizationsFromGitHub
}; 