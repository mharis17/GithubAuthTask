import * as repositoryService from '../services/repositoryService.js';
import { successResponse, errorResponse } from '../../utils/responseHandler.js';
import asyncHandler from '../../utils/asyncHandler.js';
import logger from '../../utils/logger.js';

// Get all repositories with pagination, search, and organization filter
const getAllRepositories = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, organization_id } = req.query;
  
  const repositories = await repositoryService.getAllRepositories({
    page: parseInt(page),
    limit: parseInt(limit),
    search,
    organization_id
  });
  
  return successResponse(res, repositories, 'Repositories retrieved successfully');
});

// Get repository by ID
const getRepositoryById = asyncHandler(async (req, res) => {
  const { repositoryId } = req.params;
  
  const repository = await repositoryService.getRepositoryById(repositoryId);
  
  return successResponse(res, repository, 'Repository retrieved successfully');
});

// Get repository by GitHub ID
const getRepositoryByGitHubId = asyncHandler(async (req, res) => {
  const { githubId } = req.params;
  
  const repository = await repositoryService.getRepositoryByGitHubId(githubId);
  
  return successResponse(res, repository, 'Repository retrieved successfully');
});

// Sync repositories from GitHub
const syncRepositoriesFromGitHub = asyncHandler(async (req, res) => {
  const { integrationId } = req.params;
  const { organization_id } = req.query;
  
  const result = await repositoryService.syncRepositoriesFromGitHub(integrationId, organization_id);
  
  logger.info(`Repositories synced from GitHub for integration: ${integrationId}`);
  return successResponse(res, result, 'Repositories synced successfully');
});

// Get repository statistics
const getRepositoryStats = asyncHandler(async (req, res) => {
  const { repositoryId } = req.params;
  
  const stats = await repositoryService.getRepositoryStats(repositoryId);
  
  return successResponse(res, stats, 'Repository statistics retrieved successfully');
});

export {
  getAllRepositories,
  getRepositoryById,
  getRepositoryByGitHubId,
  syncRepositoriesFromGitHub,
  getRepositoryStats
}; 