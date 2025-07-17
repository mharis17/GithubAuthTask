import Joi from 'joi';

// Query parameters validation schema
export const repositoryQuerySchema = Joi.object({
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
  }),
  organization_id: Joi.string().hex().length(24).optional().messages({
    'string.hex': 'Organization ID must be a valid MongoDB ObjectId',
    'string.length': 'Organization ID must be 24 characters'
  })
});

// ID parameter validation schema
export const repositoryIdSchema = Joi.object({
  repositoryId: Joi.string().hex().length(24).required().messages({
    'string.hex': 'Repository ID must be a valid MongoDB ObjectId',
    'string.length': 'Repository ID must be 24 characters',
    'any.required': 'Repository ID is required'
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