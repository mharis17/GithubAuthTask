import express from 'express';
import userRoutes from './userRoutes.js';

const router = express.Router();

// API routes
router.use('/users', userRoutes);

// Default route
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Upwork Task Backend API',
    endpoints: {
      users: '/api/users',
      health: '/health',
    },
  });
});

export default router; 