import Repository from '../models/Repository.js';
import Integration from '../models/Integration.js';
import Organization from '../models/Organization.js';
import Commit from '../models/Commit.js';
import PullRequest from '../models/PullRequest.js';
import Issue from '../models/Issue.js';
import axios from 'axios';
import logger from '../../utils/logger.js';

const getRepositoryById = async (repositoryId) => {
  try {
    const repository = await Repository.findById(repositoryId);
    if (!repository) {
      throw new Error('Repository not found');
    }
    return repository;
  } catch (error) {
    logger.error(`Error fetching repository ${repositoryId}:`, error);
    throw error;
  }
};

const getRepositoryByGitHubId = async (githubId) => {
  try {
    const repository = await Repository.findOne({ github_id: githubId });
    if (!repository) {
      throw new Error('Repository not found');
    }
    return repository;
  } catch (error) {
    logger.error(`Error fetching repository by GitHub ID ${githubId}:`, error);
    throw error;
  }
};

const getAllRepositories = async ({ page = 1, limit = 10, search = '', organization_id = '', integrationId = '' }) => {
  try {
    const skip = (page - 1) * limit;
    let query = {};
    
    // Filter by integration ID to ensure user only sees their data
    if (integrationId) {
      query.integration_id = integrationId;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { full_name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (organization_id) {
      query.organization_id = organization_id;
    }
    
    const repositories = await Repository.find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Repository.countDocuments(query);
    
    return {
      repositories,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    logger.error('Error fetching repositories:', error);
    throw error;
  }
};

const syncRepositoriesFromGitHub = async (integrationId, organizationId = null) => {
  try {
    const integration = await Integration.findById(integrationId);
    if (!integration) {
      throw new Error('Integration not found');
    }
    
    let apiUrl = 'https://api.github.com/user/repos';
    if (organizationId) {
      const organization = await Organization.findById(organizationId);
      if (!organization) {
        throw new Error('Organization not found');
      }
      apiUrl = `https://api.github.com/orgs/${organization.login}/repos`;
    }
    
    // Fetch repositories from GitHub API
    const response = await axios.get(apiUrl, {
      headers: {
        'Authorization': `token ${integration.access_token}`,
        'Accept': 'application/vnd.github.v3+json'
      },
      params: {
        per_page: 100,
        sort: 'updated'
      }
    });
    
    const githubRepositories = response.data;
    const syncedRepositories = [];
    
    for (const githubRepo of githubRepositories) {
      try {
        // Check if repository already exists for this integration
        let repository = await Repository.findOne({ 
          github_id: githubRepo.id,
          integration_id: integrationId
        });
        
        if (repository) {
          // Update existing repository
          repository = await Repository.findByIdAndUpdate(
            repository._id,
            {
              name: githubRepo.name,
              full_name: githubRepo.full_name,
              description: githubRepo.description,
              private: githubRepo.private,
              fork: githubRepo.fork,
              language: githubRepo.language,
              stargazers_count: githubRepo.stargazers_count,
              watchers_count: githubRepo.watchers_count,
              forks_count: githubRepo.forks_count,
              open_issues_count: githubRepo.open_issues_count,
              default_branch: githubRepo.default_branch,
              updated_at: new Date()
            },
            { new: true }
          );
        } else {
          // Create new repository
          repository = new Repository({
            github_id: githubRepo.id,
            name: githubRepo.name,
            full_name: githubRepo.full_name,
            description: githubRepo.description,
            private: githubRepo.private,
            fork: githubRepo.fork,
            language: githubRepo.language,
            stargazers_count: githubRepo.stargazers_count,
            watchers_count: githubRepo.watchers_count,
            forks_count: githubRepo.forks_count,
            open_issues_count: githubRepo.open_issues_count,
            default_branch: githubRepo.default_branch,
            integration_id: integrationId,
            organization_id: organizationId
          });
          await repository.save();
        }
        
        syncedRepositories.push(repository);
      } catch (repoError) {
        logger.error(`Error syncing repository ${githubRepo.full_name}:`, repoError);
      }
    }
    
    logger.info(`Synced ${syncedRepositories.length} repositories for integration ${integrationId}`);
    return {
      synced: syncedRepositories.length,
      repositories: syncedRepositories
    };
  } catch (error) {
    logger.error(`Error syncing repositories for integration ${integrationId}:`, error);
    throw error;
  }
};

const getRepositoryStats = async (repositoryId) => {
  try {
    const repository = await Repository.findById(repositoryId);
    if (!repository) {
      throw new Error('Repository not found');
    }
    
    // Get counts for related entities
    const commitCount = await Commit.countDocuments({ repository_id: repositoryId });
    const pullRequestCount = await PullRequest.countDocuments({ repository_id: repositoryId });
    const issueCount = await Issue.countDocuments({ repository_id: repositoryId });
    
    return {
      repository: {
        id: repository._id,
        name: repository.name,
        full_name: repository.full_name,
        description: repository.description,
        language: repository.language,
        private: repository.private,
        fork: repository.fork
      },
      statistics: {
        commits: commitCount,
        pull_requests: pullRequestCount,
        issues: issueCount,
        stargazers: repository.stargazers_count,
        watchers: repository.watchers_count,
        forks: repository.forks_count,
        open_issues: repository.open_issues_count
      }
    };
  } catch (error) {
    logger.error(`Error getting repository stats for ${repositoryId}:`, error);
    throw error;
  }
};

export {
  getRepositoryById,
  getRepositoryByGitHubId,
  getAllRepositories,
  syncRepositoriesFromGitHub,
  getRepositoryStats
}; 