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
    const integration = await Integration.findById(integrationId);
    if (!integration) {
      throw new Error('Integration not found');
    }
    
    // Fetch organizations from GitHub API
    const response = await axios.get('https://api.github.com/user/orgs', {
      headers: {
        'Authorization': `token ${integration.access_token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    const githubOrganizations = response.data;
    const syncedOrganizations = [];
    
    for (const githubOrg of githubOrganizations) {
      try {
        // Check if organization already exists for this integration
        let organization = await Organization.findOne({ 
          github_id: githubOrg.id,
          integration_id: integrationId
        });
        
        if (organization) {
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
      } catch (orgError) {
        logger.error(`Error syncing organization ${githubOrg.login}:`, orgError);
      }
    }
    
    logger.info(`Synced ${syncedOrganizations.length} organizations for integration ${integrationId}`);
    return {
      synced: syncedOrganizations.length,
      organizations: syncedOrganizations
    };
  } catch (error) {
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