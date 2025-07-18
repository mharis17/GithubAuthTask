import IssueChangelog from '../models/IssueChangelog.js';
import Issue from '../models/Issue.js';
import Repository from '../models/Repository.js';
import Integration from '../models/Integration.js';
import axios from 'axios';
import logger from '../../utils/logger.js';

const getIssueChangelogById = async (changelogId) => {
  try {
    const changelog = await IssueChangelog.findById(changelogId);
    if (!changelog) {
      throw new Error('Issue changelog not found');
    }
    return changelog;
  } catch (error) {
    logger.error(`Error fetching issue changelog ${changelogId}:`, error);
    throw error;
  }
};

const getIssueChangelogByGitHubId = async (githubId) => {
  try {
    const changelog = await IssueChangelog.findOne({ github_id: githubId });
    if (!changelog) {
      throw new Error('Issue changelog not found');
    }
    return changelog;
  } catch (error) {
    logger.error(`Error fetching issue changelog by GitHub ID ${githubId}:`, error);
    throw error;
  }
};

const getAllIssueChangelogs = async ({ page = 1, limit = 10, issue_id = '', repository_id = '', integrationId = '' }) => {
  try {
    const skip = (page - 1) * limit;
    let query = {};
    
    // Filter by integration ID to ensure user only sees their data
    if (integrationId) {
      query.integration_id = integrationId;
    }
    
    if (issue_id) {
      query.issue_id = issue_id;
    }
    
    if (repository_id) {
      query.repository_id = repository_id;
    }
    
    const changelogs = await IssueChangelog.find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await IssueChangelog.countDocuments(query);
    
    return {
      changelogs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    logger.error('Error fetching issue changelogs:', error);
    throw error;
  }
};

const syncIssueChangelogsFromGitHub = async (issueId) => {
  try {

    
    const issue = await Issue.findById(issueId);
    if (!issue) {
      throw new Error('Issue not found');
    }
    
    const repository = await Repository.findById(issue.repository_id);
    if (!repository) {
      throw new Error('Repository not found');
    }
    
    const integration = await Integration.findById(repository.integration_id);
    if (!integration) {
      throw new Error('Integration not found');
    }
    
    // Build API URL for issue events
    let apiUrl = `https://api.github.com/repos/${repository.full_name}/issues/${issue.number}/events`;
    const params = { 
      per_page: 100
    };
    

    
    // Fetch issue events from GitHub API
    const response = await axios.get(apiUrl, {
      headers: {
        'Authorization': `token ${integration.access_token}`,
        'Accept': 'application/vnd.github.v3+json'
      },
      params
    });
    
    const githubEvents = response.data;
    const syncedChangelogs = [];
    
    for (const githubEvent of githubEvents) {
      try {
        // Check if changelog already exists for this issue
        let changelog = await IssueChangelog.findOne({ 
          github_id: githubEvent.id,
          issue_id: issueId
        });
        
        if (changelog) {
          // Update existing changelog
          changelog = await IssueChangelog.findByIdAndUpdate(
            changelog._id,
            {
              event: githubEvent.event,
              actor: githubEvent.actor ? {
                login: githubEvent.actor.login,
                id: githubEvent.actor.id,
                avatar_url: githubEvent.actor.avatar_url
              } : null,
              assignee: githubEvent.assignee ? {
                login: githubEvent.assignee.login,
                id: githubEvent.assignee.id,
                avatar_url: githubEvent.assignee.avatar_url
              } : null,
              assigner: githubEvent.assigner ? {
                login: githubEvent.assigner.login,
                id: githubEvent.assigner.id,
                avatar_url: githubEvent.assigner.avatar_url
              } : null,
              label: githubEvent.label ? {
                name: githubEvent.label.name,
                color: githubEvent.label.color
              } : null,
              milestone: githubEvent.milestone ? {
                id: githubEvent.milestone.id,
                number: githubEvent.milestone.number,
                title: githubEvent.milestone.title
              } : null,
              rename: githubEvent.rename ? {
                from: githubEvent.rename.from,
                to: githubEvent.rename.to
              } : null,
              commit_id: githubEvent.commit_id,
              commit_url: githubEvent.commit_url,
              updated_at: new Date()
            },
            { new: true }
          );
        } else {
          // Create new changelog
          changelog = new IssueChangelog({
            github_id: githubEvent.id,
            event: githubEvent.event,
            actor: githubEvent.actor ? {
              login: githubEvent.actor.login,
              id: githubEvent.actor.id,
              avatar_url: githubEvent.actor.avatar_url
            } : null,
            assignee: githubEvent.assignee ? {
              login: githubEvent.assignee.login,
              id: githubEvent.assignee.id,
              avatar_url: githubEvent.assignee.avatar_url
            } : null,
            assigner: githubEvent.assigner ? {
              login: githubEvent.assigner.login,
              id: githubEvent.assigner.id,
              avatar_url: githubEvent.assigner.avatar_url
            } : null,
            label: githubEvent.label ? {
              name: githubEvent.label.name,
              color: githubEvent.label.color
            } : null,
            milestone: githubEvent.milestone ? {
              id: githubEvent.milestone.id,
              number: githubEvent.milestone.number,
              title: githubEvent.milestone.title
            } : null,
            rename: githubEvent.rename ? {
              from: githubEvent.rename.from,
              to: githubEvent.rename.to
            } : null,
            commit_id: githubEvent.commit_id,
            commit_url: githubEvent.commit_url,
            issue_id: issueId,
            repository_id: issue.repository_id,
            integration_id: issue.integration_id,
            organization_id: issue.organization_id
          });
          await changelog.save();
        }
        
        syncedChangelogs.push(changelog);
      } catch (changelogError) {
        logger.error(`Error syncing changelog ${githubEvent.id}:`, changelogError);
      }
    }
    
    logger.info(`Synced ${syncedChangelogs.length} changelogs for issue ${issueId}`);
    return {
      synced: syncedChangelogs.length,
      changelogs: syncedChangelogs
    };
  } catch (error) {
    logger.error(`Error syncing changelogs for issue ${issueId}:`, error);
    throw error;
  }
};

const getIssueChangelogStats = async (issueId) => {
  try {
    const issue = await Issue.findById(issueId);
    if (!issue) {
      throw new Error('Issue not found');
    }
    
    // Get counts by event type
    const eventStats = await IssueChangelog.aggregate([
      { $match: { issue_id: issue._id } },
      { $group: { _id: '$event', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Get total changelog count
    const totalCount = await IssueChangelog.countDocuments({ issue_id: issueId });
    
    return {
      issue: {
        id: issue._id,
        number: issue.number,
        title: issue.title
      },
      statistics: {
        total: totalCount,
        events: eventStats
      }
    };
  } catch (error) {
    logger.error(`Error getting changelog stats for issue ${issueId}:`, error);
    throw error;
  }
};

export {
  getIssueChangelogById,
  getIssueChangelogByGitHubId,
  getAllIssueChangelogs,
  syncIssueChangelogsFromGitHub,
  getIssueChangelogStats
}; 