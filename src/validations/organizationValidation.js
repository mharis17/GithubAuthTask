import Joi from 'joi';

// Create organization validation schema
export const createOrganizationSchema = Joi.object({
  github_id: Joi.number().required().messages({
    'number.base': 'GitHub ID must be a number',
    'any.required': 'GitHub ID is required'
  }),
  login: Joi.string().max(50).required().messages({
    'string.max': 'Login must be at most 50 characters',
    'any.required': 'Login is required'
  }),
  name: Joi.string().max(50).optional().messages({
    'string.max': 'Name must be at most 50 characters'
  }),
  description: Joi.string().max(255).optional().messages({
    'string.max': 'Description must be at most 255 characters'
  }),
  avatar_url: Joi.string().uri().optional().messages({
    'string.uri': 'Avatar URL must be a valid URL'
  }),
  integration_id: Joi.string().hex().length(24).required().messages({
    'string.hex': 'Integration ID must be a valid MongoDB ObjectId',
    'string.length': 'Integration ID must be 24 characters',
    'any.required': 'Integration ID is required'
  })
});

// Update organization validation schema
export const updateOrganizationSchema = Joi.object({
  login: Joi.string().max(50).optional().messages({
    'string.max': 'Login must be at most 50 characters'
  }),
  name: Joi.string().max(50).optional().messages({
    'string.max': 'Name must be at most 50 characters'
  }),
  description: Joi.string().max(255).optional().messages({
    'string.max': 'Description must be at most 255 characters'
  }),
  avatar_url: Joi.string().uri().optional().messages({
    'string.uri': 'Avatar URL must be a valid URL'
  })
});

// Query parameters validation schema
export const organizationQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1).messages({
    'number.base': 'Page must be a number',
    'number.integer': 'Page must be an integer',
    'number.min': 'Page must be at least 1'
  }),
  limit: Joi.number().integer().min(1).max(100).default(10).messages({
    'number.base': 'Limit must be a number',
    'number.integer': 'Limit must be an integer',
    'number.min': 'Limit must be at least 1',
    'number.max': 'Limit must be at most 100'
  }),
  search: Joi.string().max(100).optional().messages({
    'string.max': 'Search term must be at most 100 characters'
  })
});

// ID parameter validation schema
export const organizationIdSchema = Joi.object({
  organizationId: Joi.string().hex().length(24).required().messages({
    'string.hex': 'Organization ID must be a valid MongoDB ObjectId',
    'string.length': 'Organization ID must be 24 characters',
    'any.required': 'Organization ID is required'
  })
});

// GitHub ID parameter validation schema
export const githubIdSchema = Joi.object({
  githubId: Joi.number().required().messages({
    'number.base': 'GitHub ID must be a number',
    'any.required': 'GitHub ID is required'
  })
});

// Integration ID parameter validation schema
export const integrationIdSchema = Joi.object({
  integrationId: Joi.string().hex().length(24).required().messages({
    'string.hex': 'Integration ID must be a valid MongoDB ObjectId',
    'string.length': 'Integration ID must be 24 characters',
    'any.required': 'Integration ID is required'
  })
}); 