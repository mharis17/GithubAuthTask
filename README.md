# Upwork Task Backend

A professional Node.js Express MongoDB backend with GitHub OAuth authentication and comprehensive GitHub data synchronization.

## Features

- **Node.js v22** - Latest LTS version with ES modules
- **Express.js v4.18.2** - Robust web framework with middleware support
- **Cluster Support** - Multi-process architecture for better performance
- **Comprehensive Error Handling** - Global error handler with proper logging
- **Request Validation** - Joi validation for all incoming requests
- **Security Middleware** - Helmet, CORS, rate limiting, and compression
- **Professional Logging** - Winston logger with file and console output
- **Database Integration** - MongoDB with Mongoose ODM
- **Response Standardization** - Consistent API response format
- **Code Quality** - ESLint configuration for code consistency
- **ES Modules** - Modern JavaScript with import/export
- **GitHub OAuth Authentication** - Secure user authentication via GitHub
- **GitHub Data Synchronization** - Sync organizations, repositories, commits, issues, pull requests, and changelogs
- **Vercel Deployment Ready** - Optimized for serverless deployment

## Project Structure

```
upwork-task-backend/
├── src/
│   ├── config/
│   │   ├── database.js          # Database connection configuration
│   │   ├── passport.js          # Passport.js configuration
│   │   └── session.js           # Session configuration
│   ├── controllers/
│   │   ├── collectionController.js      # Collection management controller
│   │   ├── commitController.js          # Commit controller
│   │   ├── githubUserController.js      # GitHub user controller
│   │   ├── integrationController.js     # GitHub integration controller
│   │   ├── issueController.js           # Issue controller
│   │   ├── issueChangelogController.js  # Issue changelog controller
│   │   ├── organizationController.js    # Organization controller
│   │   ├── pullRequestController.js     # Pull request controller
│   │   └── repositoryController.js      # Repository controller
│   ├── middleware/
│   │   ├── auth.js              # Authentication middleware
│   │   ├── errorHandler.js      # Global error handler
│   │   ├── requestLogger.js     # Request logging middleware
│   │   └── validate.js          # Joi validation middleware
│   ├── models/
│   │   ├── Commit.js            # Commit model
│   │   ├── GitHubUser.js        # GitHub user model
│   │   ├── Integration.js       # GitHub integration model
│   │   ├── Issue.js             # Issue model
│   │   ├── IssueChangelog.js    # Issue changelog model
│   │   ├── Organization.js      # GitHub organization model
│   │   ├── PullRequest.js       # Pull request model
│   │   └── Repository.js        # GitHub repository model
│   ├── routes/
│   │   ├── index.js             # Main routes aggregator
│   │   ├── collectionRoutes.js  # Collection routes
│   │   ├── commitRoutes.js      # Commit routes
│   │   ├── githubUserRoutes.js  # GitHub user routes
│   │   ├── integrationRoutes.js # GitHub integration routes
│   │   ├── issueRoutes.js       # Issue routes
│   │   ├── issueChangelogRoutes.js # Issue changelog routes
│   │   ├── organizationRoutes.js # Organization routes
│   │   ├── pullRequestRoutes.js # Pull request routes
│   │   ├── repositoryRoutes.js  # Repository routes
│   │   └── testRoutes.js        # Test routes (development only)
│   ├── services/
│   │   ├── collectionService.js # Collection service
│   │   ├── commitService.js     # Commit service
│   │   ├── githubUserService.js # GitHub user service
│   │   ├── integrationService.js # GitHub integration service
│   │   ├── issueService.js      # Issue service
│   │   ├── issueChangelogService.js # Issue changelog service
│   │   ├── organizationService.js # Organization service
│   │   ├── pullRequestService.js # Pull request service
│   │   └── repositoryService.js # Repository service
│   └── validations/
│       ├── commitValidation.js      # Commit validation schemas
│       ├── organizationValidation.js # Organization validation schemas
│       └── repositoryValidation.js   # Repository validation schemas
├── utils/
│   ├── asyncHandler.js      # Async error wrapper
│   ├── database.js          # Database utilities
│   ├── logger.js            # Winston logger configuration
│   └── responseHandler.js   # Response formatting utilities
├── logs/                    # Application logs
├── app.js                   # Express application setup
├── server.js                # Server with cluster support
├── vercel-server.js         # Vercel-optimized server
├── vercel.json              # Vercel deployment configuration
├── package.json             # Dependencies and scripts
├── env.example              # Environment variables template
├── eslint.config.js         # ESLint configuration
└── README.md               # Project documentation
```

## Prerequisites

- **Node.js v22** (>= 22.0.0) - Latest LTS version
- **MongoDB** (>= 4.0.0) or MongoDB Atlas
- **npm** or **yarn**
- **GitHub OAuth App** - For authentication

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd upwork-task-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp env.example .env
```

4. Update the `.env` file with your configuration:
```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/upwork_task_db
JWT_SECRET=your-super-secret-jwt-key-change-in-production
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
SESSION_SECRET=your-session-secret-key
```

5. Start MongoDB service

6. Run the application:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### Health Check
- `GET /health` - Application health status

### GitHub Authentication
- `GET /api/auth/github` - Initiate GitHub OAuth
- `GET /api/auth/github/callback` - GitHub OAuth callback
- `GET /api/auth/integrations` - Get all integrations
- `GET /api/auth/integrations/:integrationId` - Get integration by ID
- `GET /api/auth/status` - Get integration status

### Collections
- `GET /api/collections` - List all collections/entities
- `GET /api/collections/:collectionName` - Fetch collection data

### Organizations (Requires GitHub Authentication)
- `GET /api/organizations` - Get all organizations (with pagination and search)
- `GET /api/organizations/:organizationId` - Get organization by ID
- `GET /api/organizations/github/:githubId` - Get organization by GitHub ID
- `POST /api/organizations/sync` - Sync organizations from GitHub

### Repositories (Requires GitHub Authentication)
- `GET /api/repositories` - Get all repositories (with pagination, search, and organization filter)
- `GET /api/repositories/:repositoryId` - Get repository by ID
- `GET /api/repositories/github/:githubId` - Get repository by GitHub ID
- `GET /api/repositories/:repositoryId/stats` - Get repository statistics
- `POST /api/repositories/sync` - Sync repositories from GitHub
- `GET /api/repositories/test/:repositoryId` - Test repository status

### Commits (Requires GitHub Authentication)
- `GET /api/commits` - Get all commits (with pagination, repository filter, and author filter)
- `GET /api/commits/:commitId` - Get commit by ID
- `GET /api/commits/sha/:sha` - Get commit by SHA
- `POST /api/commits/sync/:repositoryId` - Sync commits from GitHub for a repository
- `GET /api/commits/stats/:repositoryId` - Get commit statistics for a repository

### Pull Requests (Requires GitHub Authentication)
- `GET /api/pull-requests` - Get all pull requests (with pagination and filters)
- `GET /api/pull-requests/:pullRequestId` - Get pull request by ID
- `GET /api/pull-requests/github/:githubId` - Get pull request by GitHub ID
- `POST /api/pull-requests/sync/:repositoryId` - Sync pull requests from GitHub
- `GET /api/pull-requests/sync-status` - Check pull request sync status

### Issues (Requires GitHub Authentication)
- `GET /api/issues` - Get all issues (with pagination and filters)
- `GET /api/issues/:issueId` - Get issue by ID
- `GET /api/issues/github/:githubId` - Get issue by GitHub ID
- `POST /api/issues/sync/:repositoryId` - Sync issues from GitHub
- `GET /api/issues/sync-status` - Check issue sync status
- `GET /api/issues/:issueId/stats` - Get issue statistics

### Issue Changelogs (Requires GitHub Authentication)
- `GET /api/issue-changelogs` - Get all issue changelogs (with pagination and filters)
- `GET /api/issue-changelogs/:changelogId` - Get changelog by ID
- `GET /api/issue-changelogs/github/:githubId` - Get changelog by GitHub ID
- `POST /api/issue-changelogs/sync/:issueId` - Sync issue changelogs from GitHub

### GitHub Users (Requires GitHub Authentication)
- `GET /api/github-users` - Get all GitHub users (with pagination and filters)
- `GET /api/github-users/:userId` - Get GitHub user by ID
- `GET /api/github-users/github/:githubId` - Get GitHub user by GitHub ID

### Test Routes (Development Only)
- `GET /api/test/health` - Test health check
- `GET /api/test/integration` - Test integration
- `GET /api/test/github-data` - Test GitHub data
- `GET /api/test/models` - Test models

## Authentication Flow

### 1. GitHub OAuth Authentication
1. User clicks "Connect GitHub" button
2. Frontend calls `GET /api/auth/github`
3. Backend redirects to GitHub OAuth
4. User authorizes the application on GitHub
5. GitHub redirects back to `GET /api/auth/github/callback`
6. Backend creates session and stores integration details
7. User is redirected to success page

### 2. Protected API Access
- All GitHub data endpoints require authentication
- Session cookie is automatically sent with requests
- Backend validates session and user's GitHub integration
- Users can only access their own data

### 3. Data Synchronization
- Users can sync their GitHub data (organizations, repositories, commits, issues, pull requests)
- All sync operations use the authenticated user's GitHub token
- Data is filtered by user's integration ID
- Comprehensive error handling and logging for sync operations

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3000` |
| `MONGODB_URI` | MongoDB connection string | Required |
| `MONGODB_URI_TEST` | MongoDB test connection string | `mongodb://localhost:27017/test_database` |
| `JWT_SECRET` | JWT secret key | Required |
| `JWT_EXPIRES_IN` | JWT expiration time | `7d` |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID | Required |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth client secret | Required |
| `GITHUB_CALLBACK_URL` | GitHub OAuth callback URL | `http://localhost:3000/api/auth/github/callback` |
| `SESSION_SECRET` | Session secret key | Required |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` (15 minutes) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |
| `LOG_LEVEL` | Logging level | `info` |
| `BCRYPT_SALT_ROUNDS` | Password hashing rounds | `12` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:4200` |

## Scripts

- `npm start` - Start production server with clustering
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

## Deployment

### Vercel Deployment
The application is optimized for Vercel deployment with:
- `vercel-server.js` - Serverless-optimized server
- `vercel.json` - Vercel configuration
- Proper environment variable handling
- Graceful error handling for missing configurations

### Local Development
- Uses `server.js` with clustering for better performance
- Comprehensive logging to `logs/` directory
- Hot reload with nodemon

## Technology Stack

- **Runtime**: Node.js v22
- **Framework**: Express.js v4.18.2
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Passport.js with GitHub OAuth
- **Validation**: Joi
- **Logging**: Winston
- **Security**: Helmet, CORS, Rate Limiting
- **Code Quality**: ESLint
- **Deployment**: Vercel (serverless)

## Error Handling

- Global error handler with proper HTTP status codes
- Comprehensive logging with Winston
- Graceful handling of missing environment variables
- Proper MongoDB connection error handling
- Rate limiting and security middleware

## Security Features

- Helmet.js for security headers
- CORS configuration
- Rate limiting
- Session management
- Input validation with Joi
- Secure password handling
- GitHub OAuth integration 