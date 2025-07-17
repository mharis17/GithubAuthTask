import express from 'express';
import { 
  createUser,
  getUserById,
  getAllUsers,
  updateUser,
  deleteUser,
  getProfile,
  updateProfile,
} from '../controllers/userController.js';
import validate from '../middleware/validate.js';
import { 
  createUserSchema, 
  updateUserSchema, 
} from '../validations/userValidation.js';

const router = express.Router();

// Public routes
router.post('/register', validate(createUserSchema), createUser);

// Protected routes (will add auth middleware later)
router.get('/profile', getProfile);
router.put('/profile', validate(updateUserSchema), updateProfile);

// Admin routes (will add role-based middleware later)
router.get('/', getAllUsers);
router.get('/:userId', getUserById);
router.put('/:userId', validate(updateUserSchema), updateUser);
router.delete('/:userId', deleteUser);

export default router; 