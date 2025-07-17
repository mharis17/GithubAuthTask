// Date formatting helpers
const formatDate = (date, format = 'YYYY-MM-DD') => {
  const d = new Date(date);
  
  if (format === 'YYYY-MM-DD') {
    return d.toISOString().split('T')[0];
  }
  
  if (format === 'DD/MM/YYYY') {
    return d.toLocaleDateString('en-GB');
  }
  
  if (format === 'MM/DD/YYYY') {
    return d.toLocaleDateString('en-US');
  }
  
  return d.toISOString();
};

// Currency formatting helper
const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

// Phone number formatting helper
const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  
  // Format as (XXX) XXX-XXXX
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  return phone; // Return original if not 10 digits
};

// Name formatting helper
const formatFullName = (firstName, lastName) => {
  if (!firstName && !lastName) return '';
  
  const first = firstName ? firstName.trim() : '';
  const last = lastName ? lastName.trim() : '';
  
  return `${first} ${last}`.trim();
};

// Email masking helper
const maskEmail = (email) => {
  if (!email) return '';
  
  const [localPart, domain] = email.split('@');
  if (!domain) return email;
  
  const maskedLocal = localPart.length > 2 
    ? localPart.charAt(0) + '*'.repeat(localPart.length - 2) + localPart.charAt(localPart.length - 1)
    : localPart;
  
  return `${maskedLocal}@${domain}`;
};

// Slug generation helper
const generateSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim('-'); // Remove leading/trailing hyphens
};

// File size formatting helper
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Truncate text helper
const truncateText = (text, maxLength = 100, suffix = '...') => {
  if (!text || text.length <= maxLength) return text;
  
  return text.substring(0, maxLength - suffix.length) + suffix;
};

// Capitalize first letter helper
const capitalizeFirst = (text) => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

// Generate random string helper
const generateRandomString = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
};

export {
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
}; 