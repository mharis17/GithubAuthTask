import * as repositoryService from '../services/repositoryService.js';
import { successResponse, errorResponse } from '../../utils/responseHandler.js';
import asyncHandler from '../../utils/asyncHandler.js';
import logger from '../../utils/logger.js';
import axios from 'axios'; // Added axios import
import Integration from '../models/Integration.js'; // Fixed import path

// Get all repositories with pagination, search, and organization filter
const getAllRepositories = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, organization_id } = req.query;
  
  // Use authenticated user's integration
  const integrationId = req.integration._id;
  
  const repositories = await repositoryService.getAllRepositories({
    page: parseInt(page),
    limit: parseInt(limit),
    search,
    organization_id,
    integrationId
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

  
  // Use authenticated user's integration
  const integrationId = req.integration._id;
  const { organization_id } = req.body; // Changed from req.query to req.body
  
  
  
  const result = await repositoryService.syncRepositoriesFromGitHub(integrationId, organization_id);
  
  
  
  logger.info(`Repositories synced from GitHub for user: ${req.user.username}`);
  return successResponse(res, result, 'Repositories synced successfully');
});

// Get repository statistics
const getRepositoryStats = asyncHandler(async (req, res) => {
  const { repositoryId } = req.params;
  
  const stats = await repositoryService.getRepositoryStats(repositoryId);
  
  return successResponse(res, stats, 'Repository statistics retrieved successfully');
});

// Test repository status and check if it has commits
const testRepositoryStatus = asyncHandler(async (req, res) => {

  
  const { repositoryId } = req.params;
  
  
  const repository = await repositoryService.getRepositoryById(repositoryId);
  
  
  // Test GitHub API call to check repository status
  const integration = await Integration.findById(repository.integration_id);
  console.log('Integration found:', {
    _id: integration._id,
    username: integration.username
  });
  
  try {
    // Test basic repository info
    const repoResponse = await axios.get(`https://api.github.com/repos/${repository.full_name}`, {
      headers: {
        'Authorization': `token ${integration.access_token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    console.log('Repository API response:', {
      status: repoResponse.status,
      name: repoResponse.data.name,
      full_name: repoResponse.data.full_name,
      private: repoResponse.data.private,
      size: repoResponse.data.size,
      default_branch: repoResponse.data.default_branch
    });
    
    // Test commits endpoint
    const commitsResponse = await axios.get(`https://api.github.com/repos/${repository.full_name}/commits`, {
      headers: {
        'Authorization': `token ${integration.access_token}`,
        'Accept': 'application/vnd.github.v3+json'
      },
      params: { per_page: 1 }
    });
    
    console.log('Commits API response:', {
      status: commitsResponse.status,
      data_length: commitsResponse.data.length,
      has_commits: commitsResponse.data.length > 0
    });
    
    console.log('=== TEST REPOSITORY STATUS END ===');
    
    return successResponse(res, {
      repository: {
        id: repository._id,
        name: repository.name,
        full_name: repository.full_name,
        private: repoResponse.data.private,
        size: repoResponse.data.size,
        default_branch: repoResponse.data.default_branch
      },
      commits: {
        has_commits: commitsResponse.data.length > 0,
        count: commitsResponse.data.length
      },
      api_status: {
        repository: repoResponse.status,
        commits: commitsResponse.status
      }
    }, 'Repository status checked successfully');
    
  } catch (error) {
    console.log('Error testing repository status:', error.message);
    console.log('Error status:', error.response?.status);
    console.log('Error data:', error.response?.data);
    
    return errorResponse(res, `Repository test failed: ${error.response?.data?.message || error.message}`, error.response?.status || 500);
  }
});

export {
  getAllRepositories,
  getRepositoryById,
  getRepositoryByGitHubId,
  syncRepositoriesFromGitHub,
  getRepositoryStats,
  testRepositoryStatus
}; 