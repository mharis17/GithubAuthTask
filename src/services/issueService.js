import Issue from '../models/Issue.js';
import Repository from '../models/Repository.js';
import Integration from '../models/Integration.js';
import axios from 'axios';
import logger from '../../utils/logger.js';

const getIssueById = async (issueId) => {
  try {
    const issue = await Issue.findById(issueId);
    if (!issue) {
      throw new Error('Issue not found');
    }
    return issue;
  } catch (error) {
    logger.error(`Error fetching issue ${issueId}:`, error);
    throw error;
  }
};

const getIssueByGitHubId = async (githubId) => {
  try {
    const issue = await Issue.findOne({ github_id: githubId });
    if (!issue) {
      throw new Error('Issue not found');
    }
    return issue;
  } catch (error) {
    logger.error(`Error fetching issue by GitHub ID ${githubId}:`, error);
    throw error;
  }
};

const getAllIssues = async ({ page = 1, limit = 10, repository_id = '', state = '', author = '', labels = '', integrationId = '' }) => {
  try {
    logger.info(`[ISSUE_SERVICE] Getting all issues with params:`, {
      page,
      limit,
      repository_id,
      state,
      author,
      labels,
      integrationId: integrationId ? integrationId.toString() : 'none'
    });

    const skip = (page - 1) * limit;
    let query = {};
    
    // Filter by integration ID to ensure user only sees their data
    if (integrationId) {
      query.integration_id = integrationId;
      logger.info(`[ISSUE_SERVICE] Added integration_id filter: ${integrationId}`);
    }
    
    if (repository_id) {
      query.repository_id = repository_id;
      logger.info(`[ISSUE_SERVICE] Added repository_id filter: ${repository_id}`);
    }
    
    if (state) {
      query.state = state;
      logger.info(`[ISSUE_SERVICE] Added state filter: ${state}`);
    }
    
    if (author) {
      query['user.login'] = { $regex: author, $options: 'i' };
      logger.info(`[ISSUE_SERVICE] Added author filter: ${author}`);
    }
    
    if (labels) {
      query['labels.name'] = { $regex: labels, $options: 'i' };
      logger.info(`[ISSUE_SERVICE] Added labels filter: ${labels}`);
    }
    
    logger.info(`[ISSUE_SERVICE] Final query:`, JSON.stringify(query, null, 2));
    
    // Check total issues in database (without filters)
    const totalInDB = await Issue.countDocuments({});
    logger.info(`[ISSUE_SERVICE] Total issues in database: ${totalInDB}`);
    
    // Check issues for this integration (without other filters)
    if (integrationId) {
      const totalForIntegration = await Issue.countDocuments({ integration_id: integrationId });
      logger.info(`[ISSUE_SERVICE] Total issues for integration ${integrationId}: ${totalForIntegration}`);
    }
    
    const issues = await Issue.find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);
    
    logger.info(`[ISSUE_SERVICE] Found ${issues.length} issues`);
    
    const total = await Issue.countDocuments(query);
    
    logger.info(`[ISSUE_SERVICE] Total count: ${total}, Pages: ${Math.ceil(total / limit)}`);
    
    // Log first few issues for debugging
    if (issues.length > 0) {
      logger.info(`[ISSUE_SERVICE] First issue sample:`, {
        _id: issues[0]._id,
        github_id: issues[0].github_id,
        number: issues[0].number,
        title: issues[0].title,
        state: issues[0].state,
        repository_id: issues[0].repository_id,
        integration_id: issues[0].integration_id
      });
    }
    
    return {
      issues,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    logger.error('[ISSUE_SERVICE] Error fetching issues:', error);
    throw error;
  }
};

const syncIssuesFromGitHub = async (repositoryId, { state = 'all', labels = '' } = {}) => {
  try {

    
    const repository = await Repository.findById(repositoryId);
    if (!repository) {
      throw new Error('Repository not found');
    }
    
    const integration = await Integration.findById(repository.integration_id);
    if (!integration) {
      throw new Error('Integration not found');
    }
    
    // Build API URL
    let apiUrl = `https://api.github.com/repos/${repository.full_name}/issues`;
    const params = { 
      per_page: 100,
      state: state // 'open', 'closed', 'all'
    };
    
    if (labels) {
      params.labels = labels;
    }
    
    // Fetch issues from GitHub API
    const response = await axios.get(apiUrl, {
      headers: {
        'Authorization': `token ${integration.access_token}`,
        'Accept': 'application/vnd.github.v3+json'
      },
      params
    });
    
    const githubIssues = response.data;
    const syncedIssues = [];
    
    for (const githubIssue of githubIssues) {
      try {
        // Check if issue already exists for this repository
        let issue = await Issue.findOne({ 
          github_id: githubIssue.id,
          repository_id: repositoryId
        });
        
        if (issue) {
          // Update existing issue
          issue = await Issue.findByIdAndUpdate(
            issue._id,
            {
              number: githubIssue.number,
              title: githubIssue.title,
              body: githubIssue.body,
              state: githubIssue.state,
              locked: githubIssue.locked,
              assignees: githubIssue.assignees?.map(assignee => ({
                login: assignee.login,
                id: assignee.id,
                avatar_url: assignee.avatar_url
              })) || [],
              labels: githubIssue.labels?.map(label => ({
                name: label.name,
                color: label.color,
                description: label.description
              })) || [],
              milestone: githubIssue.milestone ? {
                id: githubIssue.milestone.id,
                number: githubIssue.milestone.number,
                title: githubIssue.milestone.title,
                description: githubIssue.milestone.description,
                state: githubIssue.milestone.state
              } : null,
              closed_at: githubIssue.closed_at,
              updated_at: new Date()
            },
            { new: true }
          );
        } else {
          // Create new issue
          issue = new Issue({
            github_id: githubIssue.id,
            number: githubIssue.number,
            title: githubIssue.title,
            body: githubIssue.body,
            state: githubIssue.state,
            locked: githubIssue.locked,
            user: {
              login: githubIssue.user.login,
              id: githubIssue.user.id,
              avatar_url: githubIssue.user.avatar_url
            },
            assignees: githubIssue.assignees?.map(assignee => ({
              login: assignee.login,
              id: assignee.id,
              avatar_url: assignee.avatar_url
            })) || [],
            labels: githubIssue.labels?.map(label => ({
              name: label.name,
              color: label.color,
              description: label.description
            })) || [],
            milestone: githubIssue.milestone ? {
              id: githubIssue.milestone.id,
              number: githubIssue.milestone.number,
              title: githubIssue.milestone.title,
              description: githubIssue.milestone.description,
              state: githubIssue.milestone.state
            } : null,
            closed_at: githubIssue.closed_at,
            repository_id: repositoryId,
            integration_id: repository.integration_id,
            organization_id: repository.organization_id,
            repository_name: repository.name,
            repository_uuid: repository.github_id.toString(),
            html_url: githubIssue.html_url
          });
          await issue.save();
        }
        
        syncedIssues.push(issue);
      } catch (issueError) {
        logger.error(`Error syncing issue ${githubIssue.number}:`, issueError);
      }
    }
    
    logger.info(`Synced ${syncedIssues.length} issues for repository ${repositoryId}`);
    return {
      synced: syncedIssues.length,
      issues: syncedIssues
    };
  } catch (error) {
    logger.error(`Error syncing issues for repository ${repositoryId}:`, error);
    throw error;
  }
};

const getIssueStats = async (repositoryId) => {
  try {
    const repository = await Repository.findById(repositoryId);
    if (!repository) {
      throw new Error('Repository not found');
    }

    const stats = await Issue.aggregate([
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
    logger.error(`Error fetching issue stats for repository ${repositoryId}:`, error);
    throw error;
  }
};

// Check if repositories have issues and suggest syncing
const checkIssueSyncStatus = async (integrationId) => {
  try {
    logger.info(`[ISSUE_SERVICE] Checking sync status for integration: ${integrationId}`);
    
    // Get all repositories for this integration
    const repositories = await Repository.find({ integration_id: integrationId });
    logger.info(`[ISSUE_SERVICE] Found ${repositories.length} repositories for integration`);
    
    const syncStatus = [];
    
    for (const repo of repositories) {
      const issueCount = await Issue.countDocuments({ repository_id: repo._id });
      const hasIssues = issueCount > 0;
      
      syncStatus.push({
        repository_id: repo._id,
        repository_name: repo.name,
        full_name: repo.full_name,
        has_issues: hasIssues,
        issue_count: issueCount,
        needs_sync: !hasIssues
      });
      
      logger.info(`[ISSUE_SERVICE] Repository ${repo.name}: ${issueCount} issues`);
    }
    
    return syncStatus;
  } catch (error) {
    logger.error(`[ISSUE_SERVICE] Error checking sync status:`, error);
    throw error;
  }
};

export {
  getIssueById,
  getIssueByGitHubId,
  getAllIssues,
  syncIssuesFromGitHub,
  getIssueStats,
  checkIssueSyncStatus
}; 