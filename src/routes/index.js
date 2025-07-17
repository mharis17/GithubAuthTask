import express from 'express';
import userRoutes from './userRoutes.js';
import integrationRoutes from './integrationRoutes.js';

const router = express.Router();

// API routes
router.use('/users', userRoutes);
router.use('/auth', integrationRoutes);

// Default route
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Upwork Task Backend API',
    endpoints: {
      users: '/api/users',
      auth: '/api/auth',
      health: '/health',
    },
  });
});

export default router; 