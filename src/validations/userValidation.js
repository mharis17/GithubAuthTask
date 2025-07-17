import Joi from 'joi';

const createUserSchema = Joi.object({
  username: Joi.string()
    .min(3)
    .max(50)
    .required()
    .messages({
      'string.min': 'Username must be at least 3 characters long',
      'string.max': 'Username cannot exceed 50 characters',
      'any.required': 'Username is required',
    }),
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please enter a valid email address',
      'any.required': 'Email is required',
    }),
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters long',
      'any.required': 'Password is required',
    }),
  firstName: Joi.string()
    .max(50)
    .required()
    .messages({
      'string.max': 'First name cannot exceed 50 characters',
      'any.required': 'First name is required',
    }),
  lastName: Joi.string()
    .max(50)
    .required()
    .messages({
      'string.max': 'Last name cannot exceed 50 characters',
      'any.required': 'Last name is required',
    }),
  phone: Joi.string()
    .max(20)
    .optional()
    .messages({
      'string.max': 'Phone number cannot exceed 20 characters',
    }),
  role: Joi.string()
    .valid('user', 'admin')
    .default('user')
    .messages({
      'any.only': 'Role must be user or admin',
    }),
});

const updateUserSchema = Joi.object({
  firstName: Joi.string()
    .max(50)
    .optional()
    .messages({
      'string.max': 'First name cannot exceed 50 characters',
    }),
  lastName: Joi.string()
    .max(50)
    .optional()
    .messages({
      'string.max': 'Last name cannot exceed 50 characters',
    }),
  phone: Joi.string()
    .max(20)
    .optional()
    .messages({
      'string.max': 'Phone number cannot exceed 20 characters',
    }),
  status: Joi.string()
    .valid('Active', 'Inactive')
    .optional()
    .messages({
      'any.only': 'Status must be Active or Inactive',
    }),
  role: Joi.string()
    .valid('user', 'admin')
    .optional()
    .messages({
      'any.only': 'Role must be user or admin',
    }),
});

export {
  createUserSchema,
  updateUserSchema,
}; 