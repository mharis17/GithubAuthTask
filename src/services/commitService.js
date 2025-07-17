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
    const repository = await Repository.findById(repositoryId);
    if (!repository) {
      throw new Error('Repository not found');
    }
    
    const integration = await Integration.findById(repository.integration_id);
    if (!integration) {
      throw new Error('Integration not found');
    }
    
    // Build API URL with optional date filters
    let apiUrl = `https://api.github.com/repos/${repository.full_name}/commits`;
    const params = { per_page: 100 };
    
    if (since) params.since = since;
    if (until) params.until = until;
    
    // Fetch commits from GitHub API
    const response = await axios.get(apiUrl, {
      headers: {
        'Authorization': `token ${integration.access_token}`,
        'Accept': 'application/vnd.github.v3+json'
      },
      params
    });
    
    const githubCommits = response.data;
    const syncedCommits = [];
    
    for (const githubCommit of githubCommits) {
      try {
        // Check if commit already exists for this repository
        let commit = await Commit.findOne({ 
          sha: githubCommit.sha,
          repository_id: repositoryId
        });
        
        if (commit) {
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
            integration_id: repository.integration_id
          });
          await commit.save();
        }
        
        syncedCommits.push(commit);
      } catch (commitError) {
        logger.error(`Error syncing commit ${githubCommit.sha}:`, commitError);
      }
    }
    
    logger.info(`Synced ${syncedCommits.length} commits for repository ${repositoryId}`);
    return {
      synced: syncedCommits.length,
      commits: syncedCommits
    };
  } catch (error) {
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