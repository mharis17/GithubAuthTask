import { errorResponse } from '../../utils/responseHandler.js';
import logger from '../../utils/logger.js';

// Authentication middleware
const requireAuth = (req, res, next) => {
  try {
    // Check if user is authenticated via session
    if (!req.isAuthenticated()) {
      logger.warn(`Unauthorized access attempt to ${req.originalUrl}`);
      return errorResponse(res, 'Authentication required', 401);
    }
    // Do NOT overwrite req.user here; let Passport handle it
    logger.info(`Authenticated request from GitHub user: ${req.user?.username}`);
    next();
  } catch (error) {
    logger.error('Authentication middleware error:', error);
    return errorResponse(res, 'Authentication error', 500);
  }
};

// Check if user has active GitHub integration
const requireGitHubIntegration = async (req, res, next) => {
  try {
    if (!req.user) {
      return errorResponse(res, 'Authentication required', 401);
    }

    // Check if user has an active GitHub integration
    const Integration = (await import('../models/Integration.js')).default;
    console.log('Looking for integration with github_id:', req.user.github_id);
    const integration = await Integration.findOne({ 
      github_id: req.user.github_id,
      status: 'active'
    });
    console.log('Integration found:', integration);

    if (!integration) {
      logger.warn(`GitHub user ${req.user.username} has no active integration`);
      return errorResponse(res, 'GitHub integration required', 403);
    }

    // Add integration to request object
    req.integration = integration;
    
    logger.info(`GitHub integration verified for user: ${req.user.username}`);
    next();
  } catch (error) {
    logger.error('GitHub integration middleware error:', error);
    return errorResponse(res, 'Integration verification error', 500);
  }
};

// Check if user owns the resource
const requireResourceOwnership = (resourceType) => {
  return async (req, res, next) => {
    try {
      console.log('=== RESOURCE OWNERSHIP MIDDLEWARE START ===');
      console.log('Resource type:', resourceType);
      console.log('Request params:', req.params);
      
      if (!req.user) {
        return errorResponse(res, 'Authentication required', 401);
      }

      // Try different parameter naming conventions
      let resourceId = req.params[`${resourceType}Id`] || 
                      req.params[`${resourceType.toLowerCase()}Id`] || 
                      req.params.id;
      
      console.log('Extracted resource ID:', resourceId);
      
      if (!resourceId) {
        console.log('Resource ID not found in params');
        return errorResponse(res, 'Resource ID required', 400);
      }

      // Import the appropriate model
      const Model = (await import(`../models/${resourceType}.js`)).default;
      
      console.log('Looking for resource with ID:', resourceId);
      const resource = await Model.findById(resourceId);
      if (!resource) {
        console.log('Resource not found');
        return errorResponse(res, `${resourceType} not found`, 404);
      }

      console.log('Resource found:', {
        _id: resource._id,
        integration_id: resource.integration_id
      });

      // Check if user owns this resource
      if (resource.integration_id && req.integration) {
        if (resource.integration_id.toString() !== req.integration._id.toString()) {
          console.log('Access denied - integration mismatch');
          logger.warn(`GitHub user ${req.user.username} attempted to access ${resourceType} they don't own`);
          return errorResponse(res, 'Access denied', 403);
        }
      }

      // Add resource to request object
      req.resource = resource;
      
      console.log('Resource ownership verified');
      console.log('=== RESOURCE OWNERSHIP MIDDLEWARE END ===');
      
      logger.info(`Resource ownership verified for GitHub user: ${req.user.username}`);
      next();
    } catch (error) {
      console.log('Resource ownership middleware error:', error.message);
      logger.error(`${resourceType} ownership middleware error:`, error);
      return errorResponse(res, 'Resource verification error', 500);
    }
  };
};

export {
  requireAuth,
  requireGitHubIntegration,
  requireResourceOwnership
}; 