import express from 'express';
import integrationRoutes from './integrationRoutes.js';
import organizationRoutes from './organizationRoutes.js';
import repositoryRoutes from './repositoryRoutes.js';
import commitRoutes from './commitRoutes.js';
import pullRequestRoutes from './pullRequestRoutes.js';
import issueRoutes from './issueRoutes.js';
import issueChangelogRoutes from './issueChangelogRoutes.js';
import githubUserRoutes from './githubUserRoutes.js';
import testRoutes from './testRoutes.js';

const router = express.Router();

// API routes
router.use('/auth', integrationRoutes);
router.use('/organizations', organizationRoutes);
router.use('/repositories', repositoryRoutes);
router.use('/commits', commitRoutes);
router.use('/pull-requests', pullRequestRoutes);
router.use('/issues', issueRoutes);
router.use('/issue-changelogs', issueChangelogRoutes);
router.use('/github-users', githubUserRoutes);

// Test routes (only in development)
if (process.env.NODE_ENV === 'development') {
  router.use('/test', testRoutes);
}

// Default route
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Upwork Task Backend API - GitHub Integration',
    endpoints: {
      auth: '/api/auth',
      organizations: '/api/organizations',
      repositories: '/api/repositories',
      commits: '/api/commits',
      pullRequests: '/api/pull-requests',
      issues: '/api/issues',
      issueChangelogs: '/api/issue-changelogs',
      githubUsers: '/api/github-users',
      ...(process.env.NODE_ENV === 'development' && { test: '/api/test' })
    },
  });
});

export default router; 