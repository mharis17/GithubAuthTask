import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Password hashing helper
const hashPassword = async (password) => {
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
  return bcrypt.hash(password, saltRounds);
};

// Password comparison helper
const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

// JWT token generation helper
const generateToken = (payload) => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  
  return jwt.sign(payload, secret, { expiresIn });
};

// JWT token verification helper
const verifyToken = (token) => {
  const secret = process.env.JWT_SECRET;
  return jwt.verify(token, secret);
};

// Extract token from authorization header
const extractTokenFromHeader = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7); // Remove 'Bearer ' prefix
};

// Generate user payload for JWT
const generateUserPayload = (user) => {
  return {
    id: user._id,
    email: user.email,
    username: user.username,
    role: user.role,
  };
};

// Check if user has required role
const hasRole = (user, requiredRole) => {
  if (!user || !user.role) return false;
  
  const roleHierarchy = {
    user: 1,
    admin: 2,
  };
  
  const userLevel = roleHierarchy[user.role] || 0;
  const requiredLevel = roleHierarchy[requiredRole] || 0;
  
  return userLevel >= requiredLevel;
};

// Check if user has any of the required roles
const hasAnyRole = (user, requiredRoles) => {
  if (!user || !user.role) return false;
  return requiredRoles.includes(user.role);
};

export {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  extractTokenFromHeader,
  generateUserPayload,
  hasRole,
  hasAnyRole,
}; 