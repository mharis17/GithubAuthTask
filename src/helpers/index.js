// Export all helpers for easy importing
import {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  extractTokenFromHeader,
  generateUserPayload,
  hasRole,
  hasAnyRole,
} from './authHelper.js';

import {
  formatDate,
  formatCurrency,
  formatPhoneNumber,
  formatFullName,
  maskEmail,
  generateSlug,
  formatFileSize,
  truncateText,
  capitalizeFirst,
  generateRandomString,
} from './formatHelper.js';

import {
  isValidEmail,
  isValidPhoneNumber,
  isStrongPassword,
  isValidUsername,
  isValidUrl,
  isValidDate,
  isValidNumber,
  isRequired,
  hasMinLength,
  hasMaxLength,
  isInRange,
  isInEnum,
  isValidObjectId,
  isValidFileType,
  isValidFileSize,
} from './validationHelper.js';

export {
  // Auth helpers
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  extractTokenFromHeader,
  generateUserPayload,
  hasRole,
  hasAnyRole,
  
  // Format helpers
  formatDate,
  formatCurrency,
  formatPhoneNumber,
  formatFullName,
  maskEmail,
  generateSlug,
  formatFileSize,
  truncateText,
  capitalizeFirst,
  generateRandomString,
  
  // Validation helpers
  isValidEmail,
  isValidPhoneNumber,
  isStrongPassword,
  isValidUsername,
  isValidUrl,
  isValidDate,
  isValidNumber,
  isRequired,
  hasMinLength,
  hasMaxLength,
  isInRange,
  isInEnum,
  isValidObjectId,
  isValidFileType,
  isValidFileSize,
}; 