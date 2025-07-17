// Email validation helper
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone number validation helper
const isValidPhoneNumber = (phone) => {
  if (!phone) return false;
  
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  
  // Check if it's a valid US phone number (10 digits)
  return cleaned.length === 10;
};

// Password strength validation helper
const isStrongPassword = (password) => {
  if (!password || password.length < 8) return false;
  
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
};

// Username validation helper
const isValidUsername = (username) => {
  if (!username || username.length < 3 || username.length > 50) return false;
  
  // Only allow letters, numbers, and underscores
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  return usernameRegex.test(username);
};

// URL validation helper
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Date validation helper
const isValidDate = (date) => {
  const d = new Date(date);
  return d instanceof Date && !isNaN(d);
};

// Number validation helper
const isValidNumber = (value) => {
  return !isNaN(value) && !isNaN(parseFloat(value));
};

// Required field validation helper
const isRequired = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

// Minimum length validation helper
const hasMinLength = (value, minLength) => {
  if (!value) return false;
  return value.length >= minLength;
};

// Maximum length validation helper
const hasMaxLength = (value, maxLength) => {
  if (!value) return true;
  return value.length <= maxLength;
};

// Range validation helper
const isInRange = (value, min, max) => {
  const num = parseFloat(value);
  return !isNaN(num) && num >= min && num <= max;
};

// Enum validation helper
const isInEnum = (value, allowedValues) => {
  return allowedValues.includes(value);
};

// Object ID validation helper
const isValidObjectId = (id) => {
  if (!id) return false;
  
  // MongoDB ObjectId pattern
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return objectIdRegex.test(id);
};

// File type validation helper
const isValidFileType = (filename, allowedTypes) => {
  if (!filename) return false;
  
  const extension = filename.split('.').pop().toLowerCase();
  return allowedTypes.includes(extension);
};

// File size validation helper
const isValidFileSize = (fileSize, maxSizeInMB) => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return fileSize <= maxSizeInBytes;
};

export {
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