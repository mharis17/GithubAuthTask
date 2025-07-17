import express from 'express';
import userRoutes from './userRoutes.js';
import integrationRoutes from './integrationRoutes.js';
import organizationRoutes from './organizationRoutes.js';
import repositoryRoutes from './repositoryRoutes.js';
import commitRoutes from './commitRoutes.js';
import testRoutes from './testRoutes.js';

const router = express.Router();

// API routes
router.use('/users', userRoutes);
router.use('/auth', integrationRoutes);
router.use('/organizations', organizationRoutes);
router.use('/repositories', repositoryRoutes);
router.use('/commits', commitRoutes);

// Test routes (only in development)
if (process.env.NODE_ENV === 'development') {
  router.use('/test', testRoutes);
}

// Default route
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Upwork Task Backend API',
    endpoints: {
      users: '/api/users',
      auth: '/api/auth',
      organizations: '/api/organizations',
      repositories: '/api/repositories',
      commits: '/api/commits',
      ...(process.env.NODE_ENV === 'development' && { test: '/api/test' })
    },
  });
});

export default router; 