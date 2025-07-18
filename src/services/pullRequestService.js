import PullRequest from '../models/PullRequest.js';
import Repository from '../models/Repository.js';
import Integration from '../models/Integration.js';
import axios from 'axios';
import logger from '../../utils/logger.js';

const getPullRequestById = async (pullRequestId) => {
  try {
    const pullRequest = await PullRequest.findById(pullRequestId);
    if (!pullRequest) {
      throw new Error('Pull request not found');
    }
    return pullRequest;
  } catch (error) {
    logger.error(`Error fetching pull request ${pullRequestId}:`, error);
    throw error;
  }
};

const getPullRequestByGitHubId = async (githubId) => {
  try {
    const pullRequest = await PullRequest.findOne({ github_id: githubId });
    if (!pullRequest) {
      throw new Error('Pull request not found');
    }
    return pullRequest;
  } catch (error) {
    logger.error(`Error fetching pull request by GitHub ID ${githubId}:`, error);
    throw error;
  }
};

const getAllPullRequests = async ({ page = 1, limit = 10, repository_id = '', state = '', author = '', integrationId = '' }) => {
  try {
    logger.info(`[PULL_REQUEST_SERVICE] Getting all pull requests with params:`, {
      page,
      limit,
      repository_id,
      state,
      author,
      integrationId: integrationId ? integrationId.toString() : 'none'
    });

    const skip = (page - 1) * limit;
    let query = {};
    
    // Filter by integration ID to ensure user only sees their data
    if (integrationId) {
      query.integration_id = integrationId;
      logger.info(`[PULL_REQUEST_SERVICE] Added integration_id filter: ${integrationId}`);
    }
    
    if (repository_id) {
      query.repository_id = repository_id;
      logger.info(`[PULL_REQUEST_SERVICE] Added repository_id filter: ${repository_id}`);
    }
    
    if (state) {
      query.state = state;
      logger.info(`[PULL_REQUEST_SERVICE] Added state filter: ${state}`);
    }
    
    if (author) {
      query['user.login'] = { $regex: author, $options: 'i' };
      logger.info(`[PULL_REQUEST_SERVICE] Added author filter: ${author}`);
    }
    
    logger.info(`[PULL_REQUEST_SERVICE] Final query:`, JSON.stringify(query, null, 2));
    
    // Check total pull requests in database (without filters)
    const totalInDB = await PullRequest.countDocuments({});
    logger.info(`[PULL_REQUEST_SERVICE] Total pull requests in database: ${totalInDB}`);
    
    // Check pull requests for this integration (without other filters)
    if (integrationId) {
      const totalForIntegration = await PullRequest.countDocuments({ integration_id: integrationId });
      logger.info(`[PULL_REQUEST_SERVICE] Total pull requests for integration ${integrationId}: ${totalForIntegration}`);
    }
    
    const pullRequests = await PullRequest.find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);
    
    logger.info(`[PULL_REQUEST_SERVICE] Found ${pullRequests.length} pull requests`);
    
    const total = await PullRequest.countDocuments(query);
    
    logger.info(`[PULL_REQUEST_SERVICE] Total count: ${total}, Pages: ${Math.ceil(total / limit)}`);
    
    // Log first few pull requests for debugging
    if (pullRequests.length > 0) {
      logger.info(`[PULL_REQUEST_SERVICE] First pull request sample:`, {
        _id: pullRequests[0]._id,
        github_id: pullRequests[0].github_id,
        number: pullRequests[0].number,
        title: pullRequests[0].title,
        state: pullRequests[0].state,
        repository_id: pullRequests[0].repository_id,
        integration_id: pullRequests[0].integration_id
      });
    }
    
    return {
      pullRequests,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    logger.error('[PULL_REQUEST_SERVICE] Error fetching pull requests:', error);
    throw error;
  }
};

const syncPullRequestsFromGitHub = async (repositoryId, { state = 'all' } = {}) => {
  try {
    console.log('=== SYNC PULL REQUESTS SERVICE START ===');
    console.log('Repository ID:', repositoryId);
    console.log('State filter:', state);
    
    const repository = await Repository.findById(repositoryId);
    if (!repository) {
      console.log('Repository not found for ID:', repositoryId);
      throw new Error('Repository not found');
    }
    
    console.log('Repository found:', {
      _id: repository._id,
      name: repository.name,
      full_name: repository.full_name,
      integration_id: repository.integration_id
    });
    
    const integration = await Integration.findById(repository.integration_id);
    if (!integration) {
      console.log('Integration not found for ID:', repository.integration_id);
      throw new Error('Integration not found');
    }
    
    console.log('Integration found:', {
      _id: integration._id,
      username: integration.username,
      access_token: integration.access_token ? 'EXISTS' : 'MISSING'
    });
    
    // Build API URL
    let apiUrl = `https://api.github.com/repos/${repository.full_name}/pulls`;
    const params = { 
      per_page: 100,
      state: state // 'open', 'closed', 'all'
    };
    
    console.log('Making GitHub API call to:', apiUrl);
    console.log('API params:', params);
    
    // Fetch pull requests from GitHub API
    const response = await axios.get(apiUrl, {
      headers: {
        'Authorization': `token ${integration.access_token}`,
        'Accept': 'application/vnd.github.v3+json'
      },
      params
    });
    
    console.log('GitHub API response status:', response.status);
    console.log('GitHub API response data length:', response.data.length);
    console.log('First few PRs:', response.data.slice(0, 3).map(pr => ({ number: pr.number, title: pr.title, state: pr.state })));
    
    const githubPullRequests = response.data;
    const syncedPullRequests = [];
    
    for (const githubPR of githubPullRequests) {
      try {
        console.log('Processing pull request:', githubPR.number);
        
        // Check if pull request already exists for this repository
        let pullRequest = await PullRequest.findOne({ 
          github_id: githubPR.id,
          repository_id: repositoryId
        });
        
        if (pullRequest) {
          console.log('Pull request exists, updating:', githubPR.number);
          // Update existing pull request
          pullRequest = await PullRequest.findByIdAndUpdate(
            pullRequest._id,
            {
              number: githubPR.number,
              title: githubPR.title,
              body: githubPR.body,
              state: githubPR.state,
              locked: githubPR.locked,
              draft: githubPR.draft,
              merged: githubPR.merged,
              mergeable: githubPR.mergeable,
              mergeable_state: githubPR.mergeable_state,
              merged_at: githubPR.merged_at,
              closed_at: githubPR.closed_at,
              user: {
                login: githubPR.user.login,
                id: githubPR.user.id,
                avatar_url: githubPR.user.avatar_url
              },
              assignees: githubPR.assignees?.map(assignee => ({
                login: assignee.login,
                id: assignee.id,
                avatar_url: assignee.avatar_url
              })) || [],
              labels: githubPR.labels?.map(label => ({
                name: label.name,
                color: label.color,
                description: label.description
              })) || [],
              updated_at: new Date()
            },
            { new: true }
          );
        } else {
          console.log('Pull request does not exist, creating new:', githubPR.number);
          // Create new pull request
          pullRequest = new PullRequest({
            github_id: githubPR.id,
            number: githubPR.number,
            title: githubPR.title,
            body: githubPR.body,
            state: githubPR.state,
            locked: githubPR.locked,
            draft: githubPR.draft,
            merged: githubPR.merged,
            mergeable: githubPR.mergeable,
            mergeable_state: githubPR.mergeable_state,
            merged_at: githubPR.merged_at,
            closed_at: githubPR.closed_at,
            user: {
              login: githubPR.user.login,
              id: githubPR.user.id,
              avatar_url: githubPR.user.avatar_url
            },
            assignees: githubPR.assignees?.map(assignee => ({
              login: assignee.login,
              id: assignee.id,
              avatar_url: assignee.avatar_url
            })) || [],
            labels: githubPR.labels?.map(label => ({
              name: label.name,
              color: label.color,
              description: label.description
            })) || [],
            repository_id: repositoryId,
            integration_id: repository.integration_id,
            organization_id: repository.organization_id,
            repository_name: repository.name,
            repository_uuid: repository.github_id.toString(),
            html_url: githubPR.html_url
          });
          await pullRequest.save();
        }
        
        syncedPullRequests.push(pullRequest);
        console.log('Successfully processed pull request:', githubPR.number);
      } catch (prError) {
        console.log('Error processing pull request:', githubPR.number, prError.message);
        logger.error(`Error syncing pull request ${githubPR.number}:`, prError);
      }
    }
    
    console.log('Total pull requests synced:', syncedPullRequests.length);
    console.log('=== SYNC PULL REQUESTS SERVICE END ===');
    
    logger.info(`Synced ${syncedPullRequests.length} pull requests for repository ${repositoryId}`);
    return {
      synced: syncedPullRequests.length,
      pullRequests: syncedPullRequests
    };
  } catch (error) {
    console.log('Error in syncPullRequestsFromGitHub:', error.message);
    console.log('Error status:', error.response?.status);
    console.log('Error data:', error.response?.data);
    logger.error(`Error syncing pull requests for repository ${repositoryId}:`, error);
    throw error;
  }
};

const getPullRequestStats = async (repositoryId) => {
  try {
    const repository = await Repository.findById(repositoryId);
    if (!repository) {
      throw new Error('Repository not found');
    }

    const stats = await PullRequest.aggregate([
      { $match: { repository_id: repositoryId } },
      {
        $group: {
          _id: '$state',
          count: { $sum: 1 }
        }
      }
    ]);

    return {
      repository: repository.name,
      stats: stats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
      total: stats.reduce((sum, stat) => sum + stat.count, 0)
    };
  } catch (error) {
    logger.error(`Error fetching pull request stats for repository ${repositoryId}:`, error);
    throw error;
  }
};

// Check if repositories have pull requests and suggest syncing
const checkPullRequestSyncStatus = async (integrationId) => {
  try {
    logger.info(`[PULL_REQUEST_SERVICE] Checking sync status for integration: ${integrationId}`);
    
    // Get all repositories for this integration
    const repositories = await Repository.find({ integration_id: integrationId });
    logger.info(`[PULL_REQUEST_SERVICE] Found ${repositories.length} repositories for integration`);
    
    const syncStatus = [];
    
    for (const repo of repositories) {
      const pullRequestCount = await PullRequest.countDocuments({ repository_id: repo._id });
      const hasPullRequests = pullRequestCount > 0;
      
      syncStatus.push({
        repository_id: repo._id,
        repository_name: repo.name,
        full_name: repo.full_name,
        has_pull_requests: hasPullRequests,
        pull_request_count: pullRequestCount,
        needs_sync: !hasPullRequests
      });
      
      logger.info(`[PULL_REQUEST_SERVICE] Repository ${repo.name}: ${pullRequestCount} pull requests`);
    }
    
    return syncStatus;
  } catch (error) {
    logger.error(`[PULL_REQUEST_SERVICE] Error checking sync status:`, error);
    throw error;
  }
};

export {
  getPullRequestById,
  getPullRequestByGitHubId,
  getAllPullRequests,
  syncPullRequestsFromGitHub,
  getPullRequestStats,
  checkPullRequestSyncStatus
}; 