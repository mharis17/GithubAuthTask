import GitHubUser from '../models/GitHubUser.js';
import Organization from '../models/Organization.js';
import Integration from '../models/Integration.js';
import axios from 'axios';
import logger from '../../utils/logger.js';

const getGitHubUserById = async (userId) => {
  try {
    const user = await GitHubUser.findById(userId);
    if (!user) {
      throw new Error('GitHub user not found');
    }
    return user;
  } catch (error) {
    logger.error(`Error fetching GitHub user ${userId}:`, error);
    throw error;
  }
};

const getGitHubUserByGitHubId = async (githubId) => {
  try {
    const user = await GitHubUser.findOne({ github_id: githubId });
    if (!user) {
      throw new Error('GitHub user not found');
    }
    return user;
  } catch (error) {
    logger.error(`Error fetching GitHub user by GitHub ID ${githubId}:`, error);
    throw error;
  }
};

const getAllGitHubUsers = async ({ page = 1, limit = 10, organization_id = '', role = '', integrationId = '' }) => {
  try {
    const skip = (page - 1) * limit;
    let query = {};
    
    // Filter by integration ID to ensure user only sees their data
    if (integrationId) {
      query.integration_id = integrationId;
    }
    
    if (organization_id) {
      query.organization_id = organization_id;
    }
    
    if (role) {
      query.role = role;
    }
    
    const users = await GitHubUser.find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await GitHubUser.countDocuments(query);
    
    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    logger.error('Error fetching GitHub users:', error);
    throw error;
  }
};

const syncGitHubUsersFromGitHub = async (organizationId) => {
  try {
    console.log('=== SYNC GITHUB USERS SERVICE START ===');
    console.log('Organization ID:', organizationId);
    
    const organization = await Organization.findById(organizationId);
    if (!organization) {
      console.log('Organization not found for ID:', organizationId);
      throw new Error('Organization not found');
    }
    
    console.log('Organization found:', {
      _id: organization._id,
      login: organization.login,
      name: organization.name
    });
    
    // Get integration from the organization's repositories
    const Repository = (await import('../models/Repository.js')).default;
    const repository = await Repository.findOne({ organization_id: organizationId });
    if (!repository) {
      console.log('No repository found for organization:', organizationId);
      throw new Error('No repository found for organization');
    }
    
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
    
    // Build API URL for organization members
    let apiUrl = `https://api.github.com/orgs/${organization.login}/members`;
    const params = { 
      per_page: 100
    };
    
    console.log('Making GitHub API call to:', apiUrl);
    console.log('API params:', params);
    
    // Fetch organization members from GitHub API
    const response = await axios.get(apiUrl, {
      headers: {
        'Authorization': `token ${integration.access_token}`,
        'Accept': 'application/vnd.github.v3+json'
      },
      params
    });
    
    console.log('GitHub API response status:', response.status);
    console.log('GitHub API response data length:', response.data.length);
    console.log('First few users:', response.data.slice(0, 3).map(user => ({ id: user.id, login: user.login })));
    
    const githubUsers = response.data;
    const syncedUsers = [];
    
    for (const githubUser of githubUsers) {
      try {
        console.log('Processing user:', githubUser.login);
        
        // Check if user already exists for this organization
        let user = await GitHubUser.findOne({ 
          github_id: githubUser.id,
          organization_id: organizationId
        });
        
        if (user) {
          console.log('User exists, updating:', githubUser.login);
          // Update existing user
          user = await GitHubUser.findByIdAndUpdate(
            user._id,
            {
              login: githubUser.login,
              avatar_url: githubUser.avatar_url,
              html_url: githubUser.html_url,
              type: githubUser.type,
              site_admin: githubUser.site_admin,
              updated_at: new Date()
            },
            { new: true }
          );
        } else {
          console.log('User does not exist, creating new:', githubUser.login);
          // Create new user
          user = new GitHubUser({
            github_id: githubUser.id,
            login: githubUser.login,
            avatar_url: githubUser.avatar_url,
            html_url: githubUser.html_url,
            type: githubUser.type,
            site_admin: githubUser.site_admin,
            organization_id: organizationId,
            integration_id: integration._id,
            role: 'member' // Default role for organization members
          });
          await user.save();
        }
        
        syncedUsers.push(user);
        console.log('Successfully processed user:', githubUser.login);
      } catch (userError) {
        console.log('Error processing user:', githubUser.login, userError.message);
        logger.error(`Error syncing user ${githubUser.login}:`, userError);
      }
    }
    
    console.log('Total users synced:', syncedUsers.length);
    console.log('=== SYNC GITHUB USERS SERVICE END ===');
    
    logger.info(`Synced ${syncedUsers.length} users for organization ${organizationId}`);
    return {
      synced: syncedUsers.length,
      users: syncedUsers
    };
  } catch (error) {
    console.log('Error in syncGitHubUsersFromGitHub:', error.message);
    console.log('Error status:', error.response?.status);
    console.log('Error data:', error.response?.data);
    logger.error(`Error syncing users for organization ${organizationId}:`, error);
    throw error;
  }
};

const getGitHubUserStats = async (organizationId) => {
  try {
    const organization = await Organization.findById(organizationId);
    if (!organization) {
      throw new Error('Organization not found');
    }
    
    // Get counts by role
    const memberCount = await GitHubUser.countDocuments({ 
      organization_id: organizationId, 
      role: 'member' 
    });
    const adminCount = await GitHubUser.countDocuments({ 
      organization_id: organizationId, 
      role: 'admin' 
    });
    const ownerCount = await GitHubUser.countDocuments({ 
      organization_id: organizationId, 
      role: 'owner' 
    });
    
    // Get counts by type
    const userCount = await GitHubUser.countDocuments({ 
      organization_id: organizationId, 
      type: 'User' 
    });
    const botCount = await GitHubUser.countDocuments({ 
      organization_id: organizationId, 
      type: 'Bot' 
    });
    
    return {
      organization: {
        id: organization._id,
        login: organization.login,
        name: organization.name
      },
      statistics: {
        total: memberCount + adminCount + ownerCount,
        byRole: {
          members: memberCount,
          admins: adminCount,
          owners: ownerCount
        },
        byType: {
          users: userCount,
          bots: botCount
        }
      }
    };
  } catch (error) {
    logger.error(`Error getting user stats for organization ${organizationId}:`, error);
    throw error;
  }
};

export {
  getGitHubUserById,
  getGitHubUserByGitHubId,
  getAllGitHubUsers,
  syncGitHubUsersFromGitHub,
  getGitHubUserStats
}; 