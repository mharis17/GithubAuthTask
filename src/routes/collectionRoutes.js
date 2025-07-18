import express from 'express';
import { listCollections, fetchCollectionData } from '../controllers/collectionController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// List all collections/entities
router.get('/', requireAuth, listCollections);

// Fetch data from any collection
router.get('/:collectionName', requireAuth, fetchCollectionData);

export default router; 