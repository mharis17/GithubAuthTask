import Integration from '../models/Integration.js';
import logger from '../../utils/logger.js';

const createIntegration = async (integrationData) => {
  try {
    const integration = new Integration(integrationData);
    await integration.save();
    
    logger.info(`GitHub integration created for user: ${integration.username}`);
    return integration;
  } catch (error) {
    logger.error('Error creating GitHub integration:', error);
    throw error;
  }
};

const getIntegrationByGitHubId = async (githubId) => {
  try {
    const integration = await Integration.findOne({ github_id: githubId });
    return integration;
  } catch (error) {
    logger.error(`Error fetching integration by GitHub ID ${githubId}:`, error);
    throw error;
  }
};

const getIntegrationById = async (integrationId) => {
  try {
    const integration = await Integration.findById(integrationId);
    if (!integration) {
      throw new Error('Integration not found');
    }
    return integration;
  } catch (error) {
    logger.error(`Error fetching integration ${integrationId}:`, error);
    throw error;
  }
};

const getAllIntegrations = async () => {
  try {
    const integrations = await Integration.find().sort({ created_at: -1 });
    return integrations;
  } catch (error) {
    logger.error('Error fetching integrations:', error);
    throw error;
  }
};

const updateIntegration = async (integrationId, updateData) => {
  try {
    const integration = await Integration.findByIdAndUpdate(
      integrationId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!integration) {
      throw new Error('Integration not found');
    }

    logger.info(`Integration updated: ${integration.username}`);
    return integration;
  } catch (error) {
    logger.error(`Error updating integration ${integrationId}:`, error);
    throw error;
  }
};

const deleteIntegration = async (integrationId) => {
  try {
    const integration = await Integration.findByIdAndDelete(integrationId);
    if (!integration) {
      throw new Error('Integration not found');
    }

    logger.info(`Integration deleted: ${integration.username}`);
    return { message: 'Integration deleted successfully' };
  } catch (error) {
    logger.error(`Error deleting integration ${integrationId}:`, error);
    throw error;
  }
};

const checkIntegrationStatus = async (githubId) => {
  try {
    const integration = await Integration.findOne({ 
      github_id: githubId, 
      status: 'active' 
    });
    return integration;
  } catch (error) {
    logger.error(`Error checking integration status for ${githubId}:`, error);
    throw error;
  }
};

export {
  createIntegration,
  getIntegrationByGitHubId,
  getIntegrationById,
  getAllIntegrations,
  updateIntegration,
  deleteIntegration,
  checkIntegrationStatus,
}; 