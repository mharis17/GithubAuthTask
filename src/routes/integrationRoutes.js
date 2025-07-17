import express from 'express';
import passport from 'passport';
import { 
  handleGitHubCallback,
  getIntegrationStatus,
  getAllIntegrations,
  getIntegrationById,
  updateIntegration,
  deleteIntegration,
  removeMyIntegration,
} from '../controllers/integrationController.js';

const router = express.Router();

// GitHub OAuth routes
router.get('/github', passport.authenticate('github', { 
  scope: ['repo', 'user', 'read:org'] 
}));

router.get('/github/callback', 
  passport.authenticate('github', { 
    failureRedirect: '/api/auth/error',
    session: true 
  }), 
  handleGitHubCallback
);

// Integration status and management
router.get('/status', getIntegrationStatus);
router.delete('/remove', removeMyIntegration);

// Admin routes (for managing integrations)
router.get('/', getAllIntegrations);
router.get('/:integrationId', getIntegrationById);
router.put('/:integrationId', updateIntegration);
router.delete('/:integrationId', deleteIntegration);

// Error route for OAuth failures
router.get('/error', (req, res) => {
  res.status(401).json({
    success: false,
    message: 'GitHub authentication failed'
  });
});

export default router; 