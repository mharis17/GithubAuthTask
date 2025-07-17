import Joi from 'joi';

// Query parameters validation schema
export const commitQuerySchema = Joi.object({
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
  repository_id: Joi.string().hex().length(24).optional().messages({
    'string.hex': 'Repository ID must be a valid MongoDB ObjectId',
    'string.length': 'Repository ID must be 24 characters'
  }),
  author: Joi.string().max(100).optional().messages({
    'string.max': 'Author name must be at most 100 characters'
  })
});

// ID parameter validation schema
export const commitIdSchema = Joi.object({
  commitId: Joi.string().hex().length(24).required().messages({
    'string.hex': 'Commit ID must be a valid MongoDB ObjectId',
    'string.length': 'Commit ID must be 24 characters',
    'any.required': 'Commit ID is required'
  })
});

// SHA parameter validation schema
export const commitShaSchema = Joi.object({
  sha: Joi.string().min(7).max(40).required().messages({
    'string.min': 'SHA must be at least 7 characters',
    'string.max': 'SHA must be at most 40 characters',
    'any.required': 'SHA is required'
  })
});

// Repository ID parameter validation schema
export const repositoryIdSchema = Joi.object({
  repositoryId: Joi.string().hex().length(24).required().messages({
    'string.hex': 'Repository ID must be a valid MongoDB ObjectId',
    'string.length': 'Repository ID must be 24 characters',
    'any.required': 'Repository ID is required'
  })
});

// Sync query parameters validation schema
export const syncQuerySchema = Joi.object({
  since: Joi.date().iso().optional().messages({
    'date.base': 'Since date must be a valid date',
    'date.format': 'Since date must be in ISO format'
  }),
  until: Joi.date().iso().optional().messages({
    'date.base': 'Until date must be a valid date',
    'date.format': 'Until date must be in ISO format'
  }),
  period: Joi.string().valid('7d', '30d', '90d').default('30d').messages({
    'string.base': 'Period must be a string',
    'any.only': 'Period must be one of: 7d, 30d, 90d'
  })
}); 