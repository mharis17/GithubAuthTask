import express from 'express';
import { successResponse, errorResponse } from '../../utils/responseHandler.js';

const router = express.Router();

// Test endpoint to check if server is running
router.get('/health', (req, res) => {
  return successResponse(res, {
    message: 'Test routes are working',
    timestamp: new Date().toISOString(),
    endpoints: {
      'test-integration': '/api/test/integration',
      'test-github-data': '/api/test/github-data',
      'test-models': '/api/test/models'
    }
  }, 'Test health check successful');
});

// Test integration creation (simulate OAuth callback)
router.post('/integration', (req, res) => {
  try {
    const { github_id, username, access_token } = req.body;
    
    if (!github_id || !username || !access_token) {
      return errorResponse(res, 'Missing required fields: github_id, username, access_token', 400);
    }

    // Simulate successful integration
    const mockIntegration = {
      github_id,
      username,
      display_name: username,
      email: `${username}@github.com`,
      access_token,
      status: 'active',
      created_at: new Date()
    };

    return successResponse(res, mockIntegration, 'Test integration created successfully');
  } catch (error) {
    return errorResponse(res, 'Error creating test integration', 500);
  }
});

// Test GitHub data structure
router.get('/github-data', (req, res) => {
  const mockData = {
    organizations: [
      {
        github_id: 123456,
        login: 'test-org',
        name: 'Test Organization',
        description: 'A test organization'
      }
    ],
    repositories: [
      {
        github_id: 789012,
        name: 'test-repo',
        full_name: 'test-org/test-repo',
        description: 'A test repository'
      }
    ],
    commits: [
      {
        sha: 'abc123def456',
        message: 'Test commit message',
        author: {
          name: 'Test User',
          email: 'test@example.com',
          date: new Date()
        }
      }
    ],
    pull_requests: [
      {
        github_id: 1,
        number: 1,
        title: 'Test Pull Request',
        state: 'open'
      }
    ],
    issues: [
      {
        github_id: 1,
        number: 1,
        title: 'Test Issue',
        state: 'open'
      }
    ]
  };

  return successResponse(res, mockData, 'Test GitHub data structure');
});

// Test database models
router.get('/models', (req, res) => {
  const models = [
    'Integration',
    'Organization', 
    'Repository',
    'Commit',
    'PullRequest',
    'Issue',
    'IssueChangelog',
    'GitHubUser'
  ];

  return successResponse(res, { models }, 'Available models');
});

export default router; 