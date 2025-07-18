import Organization from '../models/Organization.js';
import Integration from '../models/Integration.js';
import axios from 'axios';
import logger from '../../utils/logger.js';

const getOrganizationById = async (organizationId) => {
  try {
    const organization = await Organization.findById(organizationId);
    if (!organization) {
      throw new Error('Organization not found');
    }
    return organization;
  } catch (error) {
    logger.error(`Error fetching organization ${organizationId}:`, error);
    throw error;
  }
};

const getOrganizationByGitHubId = async (githubId) => {
  try {
    const organization = await Organization.findOne({ github_id: githubId });
    if (!organization) {
      throw new Error('Organization not found');
    }
    return organization;
  } catch (error) {
    logger.error(`Error fetching organization by GitHub ID ${githubId}:`, error);
    throw error;
  }
};

const getAllOrganizations = async ({ page = 1, limit = 10, search = '', integrationId = '' }) => {
  try {
    const skip = (page - 1) * limit;
    let query = {};
    
    // Filter by integration ID to ensure user only sees their data
    if (integrationId) {
      query.integration_id = integrationId;
    }
    
    if (search) {
      query.$or = [
        { login: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const organizations = await Organization.find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Organization.countDocuments(query);
    
    return {
      organizations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    logger.error('Error fetching organizations:', error);
    throw error;
  }
};

const syncOrganizationsFromGitHub = async (integrationId) => {
  try {
    console.log('=== SYNC ORGANIZATIONS SERVICE START ===');
    console.log('Looking for integration with ID:', integrationId);
    
    const integration = await Integration.findById(integrationId);
    if (!integration) {
      console.log('Integration not found for ID:', integrationId);
      throw new Error('Integration not found');
    }
    
    console.log('Integration found:', {
      github_id: integration.github_id,
      username: integration.username,
      access_token: integration.access_token ? 'EXISTS' : 'MISSING'
    });
    
    // Fetch organizations from GitHub API
    console.log('Making GitHub API call to: https://api.github.com/user/orgs');
    const response = await axios.get('https://api.github.com/user/orgs', {
      headers: {
        'Authorization': `token ${integration.access_token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    console.log('GitHub API response status:', response.status);
    console.log('GitHub API response data:', response.data);
    console.log('Number of organizations from GitHub:', response.data.length);
    
    const githubOrganizations = response.data;
    const syncedOrganizations = [];
    
    for (const githubOrg of githubOrganizations) {
      try {
        console.log('Processing organization:', githubOrg.login);
        
        // Check if organization already exists for this integration
        let organization = await Organization.findOne({ 
          github_id: githubOrg.id,
          integration_id: integrationId
        });
        
        if (organization) {
          console.log('Organization exists, updating:', githubOrg.login);
          // Update existing organization
          organization = await Organization.findByIdAndUpdate(
            organization._id,
            {
              login: githubOrg.login,
              name: githubOrg.name || githubOrg.login,
              description: githubOrg.description,
              avatar_url: githubOrg.avatar_url,
              updated_at: new Date()
            },
            { new: true }
          );
        } else {
          console.log('Organization does not exist, creating new:', githubOrg.login);
          // Create new organization
          organization = new Organization({
            github_id: githubOrg.id,
            login: githubOrg.login,
            name: githubOrg.name || githubOrg.login,
            description: githubOrg.description,
            avatar_url: githubOrg.avatar_url,
            integration_id: integrationId
          });
          await organization.save();
        }
        
        syncedOrganizations.push(organization);
        console.log('Successfully processed organization:', githubOrg.login);
      } catch (orgError) {
        console.log('Error processing organization:', githubOrg.login, orgError.message);
        logger.error(`Error syncing organization ${githubOrg.login}:`, orgError);
      }
    }
    
    console.log('Total organizations synced:', syncedOrganizations.length);
    console.log('=== SYNC ORGANIZATIONS SERVICE END ===');
    
    logger.info(`Synced ${syncedOrganizations.length} organizations for integration ${integrationId}`);
    return {
      synced: syncedOrganizations.length,
      organizations: syncedOrganizations
    };
  } catch (error) {
    console.log('Error in syncOrganizationsFromGitHub:', error.message);
    console.log('Error details:', error.response?.data || error.message);
    logger.error(`Error syncing organizations for integration ${integrationId}:`, error);
    throw error;
  }
};

export {
  getOrganizationById,
  getOrganizationByGitHubId,
  getAllOrganizations,
  syncOrganizationsFromGitHub
}; 