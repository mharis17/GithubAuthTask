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

    // Add user info to request object
    req.user = req.session.passport?.user;
    
    logger.info(`Authenticated request from GitHub user: ${req.user?.login}`);
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
    const integration = await Integration.findOne({ 
      github_id: req.user.id,
      status: 'active'
    });

    if (!integration) {
      logger.warn(`GitHub user ${req.user.login} has no active integration`);
      return errorResponse(res, 'GitHub integration required', 403);
    }

    // Add integration to request object
    req.integration = integration;
    
    logger.info(`GitHub integration verified for user: ${req.user.login}`);
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
      if (!req.user) {
        return errorResponse(res, 'Authentication required', 401);
      }

      const resourceId = req.params[`${resourceType}Id`] || req.params.id;
      if (!resourceId) {
        return errorResponse(res, 'Resource ID required', 400);
      }

      // Import the appropriate model
      const Model = (await import(`../models/${resourceType}.js`)).default;
      
      const resource = await Model.findById(resourceId);
      if (!resource) {
        return errorResponse(res, `${resourceType} not found`, 404);
      }

      // Check if user owns this resource
      if (resource.integration_id && req.integration) {
        if (resource.integration_id.toString() !== req.integration._id.toString()) {
          logger.warn(`GitHub user ${req.user.login} attempted to access ${resourceType} they don't own`);
          return errorResponse(res, 'Access denied', 403);
        }
      }

      // Add resource to request object
      req.resource = resource;
      
      logger.info(`Resource ownership verified for GitHub user: ${req.user.login}`);
      next();
    } catch (error) {
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