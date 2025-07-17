import * as integrationService from '../services/integrationService.js';
import { successResponse, errorResponse } from '../../utils/responseHandler.js';
import asyncHandler from '../../utils/asyncHandler.js';
import logger from '../../utils/logger.js';

// GitHub OAuth callback handler
const handleGitHubCallback = asyncHandler(async (req, res) => {
  try {
    // Check if user is authenticated via Passport
    if (!req.user) {
      return errorResponse(res, 'GitHub authentication failed', 401);
    }

    const { github_id, username, display_name, email, access_token } = req.user;

    // Check if integration already exists
    let integration = await integrationService.getIntegrationByGitHubId(github_id);

    if (integration) {
      // Update existing integration
      integration = await integrationService.updateIntegration(integration._id, {
        username,
        display_name,
        email,
        access_token,
        status: 'active',
        updated_at: new Date()
      });
      logger.info(`GitHub integration updated for user: ${username}`);
    } else {
      // Create new integration
      integration = await integrationService.createIntegration({
        github_id,
        username,
        display_name,
        email,
        access_token,
        status: 'active'
      });
      logger.info(`GitHub integration created for user: ${username}`);
    }

    // Redirect to frontend with success
    const frontendUrl = process.env.NODE_ENV === 'production' 
      ? process.env.FRONTEND_URL 
      : 'http://localhost:4200';
    
    res.redirect(`${frontendUrl}/integration/success?username=${username}`);
  } catch (error) {
    logger.error('Error in GitHub callback:', error);
    const frontendUrl = process.env.NODE_ENV === 'production' 
      ? process.env.FRONTEND_URL 
      : 'http://localhost:4200';
    res.redirect(`${frontendUrl}/integration/error`);
  }
});

// Get integration status
const getIntegrationStatus = asyncHandler(async (req, res) => {
  try {
    // Check if user is authenticated via session
    if (!req.user) {
      return errorResponse(res, 'Not authenticated', 401);
    }

    const { github_id } = req.user;
    const integration = await integrationService.checkIntegrationStatus(github_id);

    if (!integration) {
      return successResponse(res, { connected: false }, 'No active integration found');
    }

    return successResponse(res, {
      connected: true,
      username: integration.username,
      display_name: integration.display_name,
      connected_at: integration.created_at,
      status: integration.status
    }, 'Integration found');
  } catch (error) {
    logger.error('Error getting integration status:', error);
    return errorResponse(res, 'Error checking integration status', 500);
  }
});

// Remove current user's integration
const removeMyIntegration = asyncHandler(async (req, res) => {
  try {
    if (!req.user) {
      return errorResponse(res, 'Not authenticated', 401);
    }

    const { github_id } = req.user;
    const integration = await integrationService.getIntegrationByGitHubId(github_id);

    if (!integration) {
      return errorResponse(res, 'No integration found', 404);
    }

    const result = await integrationService.deleteIntegration(integration._id);
    
    // Clear session
    req.logout((err) => {
      if (err) {
        logger.error('Error logging out:', err);
      }
    });

    return successResponse(res, result, 'Integration removed successfully');
  } catch (error) {
    logger.error('Error removing integration:', error);
    return errorResponse(res, 'Error removing integration', 500);
  }
});

export {
  handleGitHubCallback,
  getIntegrationStatus,
  removeMyIntegration,
}; 