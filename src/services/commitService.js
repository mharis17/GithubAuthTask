import Commit from '../models/Commit.js';
import Repository from '../models/Repository.js';
import Integration from '../models/Integration.js';
import axios from 'axios';
import logger from '../../utils/logger.js';

const getCommitById = async (commitId) => {
  try {
    const commit = await Commit.findById(commitId);
    if (!commit) {
      throw new Error('Commit not found');
    }
    return commit;
  } catch (error) {
    logger.error(`Error fetching commit ${commitId}:`, error);
    throw error;
  }
};

const getCommitBySha = async (sha) => {
  try {
    const commit = await Commit.findOne({ sha });
    if (!commit) {
      throw new Error('Commit not found');
    }
    return commit;
  } catch (error) {
    logger.error(`Error fetching commit by SHA ${sha}:`, error);
    throw error;
  }
};

const getAllCommits = async ({ page = 1, limit = 10, repository_id = '', author = '', integrationId = '' }) => {
  try {
    const skip = (page - 1) * limit;
    let query = {};
    
    // Filter by integration ID to ensure user only sees their data
    if (integrationId) {
      query.integration_id = integrationId;
    }
    
    if (repository_id) {
      query.repository_id = repository_id;
    }
    
    if (author) {
      query['author.name'] = { $regex: author, $options: 'i' };
    }
    
    const commits = await Commit.find(query)
      .sort({ commit_date: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Commit.countDocuments(query);
    
    return {
      commits,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    logger.error('Error fetching commits:', error);
    throw error;
  }
};

const syncCommitsFromGitHub = async (repositoryId, { since, until } = {}) => {
  try {
    console.log('=== SYNC COMMITS SERVICE START ===');
    console.log('Repository ID:', repositoryId);
    console.log('Since:', since);
    console.log('Until:', until);
    
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
    
    // Build API URL with optional date filters
    let apiUrl = `https://api.github.com/repos/${repository.full_name}/commits`;
    const params = { per_page: 100 };
    
    if (since) params.since = since;
    if (until) params.until = until;
    
    console.log('Making GitHub API call to:', apiUrl);
    console.log('API params:', params);
    
    // Fetch commits from GitHub API
    const response = await axios.get(apiUrl, {
      headers: {
        'Authorization': `token ${integration.access_token}`,
        'Accept': 'application/vnd.github.v3+json'
      },
      params
    });
    
    console.log('GitHub API response status:', response.status);
    console.log('GitHub API response data length:', response.data.length);
    console.log('First few commits:', response.data.slice(0, 3).map(c => ({ sha: c.sha, message: c.commit.message })));
    
    const githubCommits = response.data;
    const syncedCommits = [];
    
    for (const githubCommit of githubCommits) {
      try {
        console.log('Processing commit:', githubCommit.sha);
        
        // Check if commit already exists for this repository
        let commit = await Commit.findOne({ 
          sha: githubCommit.sha,
          repository_id: repositoryId
        });
        
        if (commit) {
          console.log('Commit exists, updating:', githubCommit.sha);
          // Update existing commit
          commit = await Commit.findByIdAndUpdate(
            commit._id,
            {
              message: githubCommit.commit.message,
              author: {
                name: githubCommit.commit.author.name,
                email: githubCommit.commit.author.email,
                date: githubCommit.commit.author.date
              },
              committer: {
                name: githubCommit.commit.committer.name,
                email: githubCommit.commit.committer.email,
                date: githubCommit.commit.committer.date
              },
              updated_at: new Date()
            },
            { new: true }
          );
        } else {
          console.log('Commit does not exist, creating new:', githubCommit.sha);
          // Create new commit
          commit = new Commit({
            sha: githubCommit.sha,
            message: githubCommit.commit.message,
            author: {
              name: githubCommit.commit.author.name,
              email: githubCommit.commit.author.email,
              date: githubCommit.commit.author.date
            },
            committer: {
              name: githubCommit.commit.committer.name,
              email: githubCommit.commit.committer.email,
              date: githubCommit.commit.committer.date
            },
            repository_id: repositoryId,
            integration_id: repository.integration_id,
            organization_id: repository.organization_id, // Add organization_id
            repository_name: repository.name, // Add repository_name
            repository_uuid: repository.github_id.toString(), // Add repository_uuid (GitHub ID as string)
            branch: repository.default_branch || 'main', // Add branch info
            html_url: githubCommit.html_url // Add HTML URL if available
          });
          await commit.save();
        }
        
        syncedCommits.push(commit);
        console.log('Successfully processed commit:', githubCommit.sha);
      } catch (commitError) {
        console.log('Error processing commit:', githubCommit.sha, commitError.message);
        logger.error(`Error syncing commit ${githubCommit.sha}:`, commitError);
      }
    }
    
    console.log('Total commits synced:', syncedCommits.length);
    console.log('=== SYNC COMMITS SERVICE END ===');
    
    logger.info(`Synced ${syncedCommits.length} commits for repository ${repositoryId}`);
    return {
      synced: syncedCommits.length,
      commits: syncedCommits
    };
  } catch (error) {
    console.log('Error in syncCommitsFromGitHub:', error.message);
    console.log('Error status:', error.response?.status);
    console.log('Error status text:', error.response?.statusText);
    console.log('Error data:', error.response?.data);
    console.log('Error headers:', error.response?.headers);
    
    // Handle specific GitHub API errors
    if (error.response?.status === 409) {
      console.log('GitHub API 409 Conflict Error - This usually means:');
      console.log('1. Repository is empty (no commits)');
      console.log('2. Repository access issues');
      console.log('3. Repository state conflicts');
      throw new Error(`GitHub API Conflict (409): ${error.response.data?.message || 'Repository may be empty or inaccessible'}`);
    } else if (error.response?.status === 403) {
      console.log('GitHub API 403 Forbidden - Access token may not have repo scope');
      throw new Error(`GitHub API Forbidden (403): ${error.response.data?.message || 'Access token may not have sufficient permissions'}`);
    } else if (error.response?.status === 404) {
      console.log('GitHub API 404 Not Found - Repository may not exist or be accessible');
      throw new Error(`GitHub API Not Found (404): ${error.response.data?.message || 'Repository not found or not accessible'}`);
    }
    
    logger.error(`Error syncing commits for repository ${repositoryId}:`, error);
    throw error;
  }
};

const getCommitStats = async (repositoryId, period = '30d') => {
  try {
    const repository = await Repository.findById(repositoryId);
    if (!repository) {
      throw new Error('Repository not found');
    }
    
    // Calculate date range based on period
    const now = new Date();
    let startDate;
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    
    // Get commit counts by author
    const authorStats = await Commit.aggregate([
      {
        $match: {
          repository_id: repository._id,
          'author.date': { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$author.name',
          count: { $sum: 1 },
          emails: { $addToSet: '$author.email' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    // Get total commits in period
    const totalCommits = await Commit.countDocuments({
      repository_id: repository._id,
      'author.date': { $gte: startDate }
    });
    
    // Get commits per day
    const dailyStats = await Commit.aggregate([
      {
        $match: {
          repository_id: repository._id,
          'author.date': { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$author.date'
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    return {
      repository: {
        id: repository._id,
        name: repository.name,
        full_name: repository.full_name
      },
      period,
      statistics: {
        total_commits: totalCommits,
        top_contributors: authorStats.slice(0, 10),
        daily_activity: dailyStats
      }
    };
  } catch (error) {
    logger.error(`Error getting commit stats for repository ${repositoryId}:`, error);
    throw error;
  }
};

export {
  getCommitById,
  getCommitBySha,
  getAllCommits,
  syncCommitsFromGitHub,
  getCommitStats
}; 