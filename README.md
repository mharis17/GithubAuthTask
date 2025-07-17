# Upwork Task Backend

A professional Node.js Express MongoDB backend with GitHub OAuth authentication and data synchronization.

## Features

- **Node.js v22** - Latest LTS version with ES modules
- **Express.js v5** - Latest Express with improved performance
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
- **GitHub Data Synchronization** - Sync organizations, repositories, and commits

## Project Structure

```
upwork-task-backend/
├── config/
│   └── database.js          # Database connection configuration
├── utils/                   # Application-wide utilities
│   ├── logger.js            # Winston logger configuration
│   ├── asyncHandler.js      # Async error wrapper
│   ├── responseHandler.js   # Response formatting utilities
│   └── database.js          # Database utilities
├── src/
│   ├── controllers/
│   │   ├── integrationController.js # GitHub integration controller
│   │   ├── organizationController.js # Organization controller
│   │   ├── repositoryController.js   # Repository controller
│   │   └── commitController.js       # Commit controller
│   ├── helpers/             # Business logic helpers
│   │   ├── authHelper.js    # Authentication helpers
│   │   ├── formatHelper.js  # Data formatting helpers
│   │   └── validationHelper.js # Custom validation helpers
│   ├── middleware/
│   │   ├── errorHandler.js   # Global error handler
│   │   ├── requestLogger.js  # Request logging middleware
│   │   ├── validate.js       # Joi validation middleware
│   │   └── auth.js           # Authentication middleware
│   ├── models/
│   │   ├── GitHubUser.js     # GitHub user model
│   │   ├── Integration.js    # GitHub integration model
│   │   ├── Organization.js   # GitHub organization model
│   │   ├── Repository.js     # GitHub repository model
│   │   └── Commit.js         # GitHub commit model
│   ├── routes/
│   │   ├── index.js          # Main routes
│   │   ├── integrationRoutes.js # GitHub integration routes
│   │   ├── organizationRoutes.js # Organization routes
│   │   ├── repositoryRoutes.js   # Repository routes
│   │   └── commitRoutes.js       # Commit routes
│   ├── services/
│   │   ├── integrationService.js # GitHub integration service
│   │   ├── organizationService.js # Organization service
│   │   ├── repositoryService.js   # Repository service
│   │   └── commitService.js       # Commit service
│   └── validations/
│       ├── integrationValidation.js # Integration validation schemas
│       ├── organizationValidation.js # Organization validation schemas
│       ├── repositoryValidation.js   # Repository validation schemas
│       └── commitValidation.js       # Commit validation schemas
├── app.js                   # Express application setup
├── server.js                # Server with cluster support
├── package.json             # Dependencies and scripts
└── README.md               # Project documentation
```

## Prerequisites

- **Node.js v22** (>= 22.0.0) - Latest LTS version
- **MongoDB** (>= 4.0.0)
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

### GitHub Authentication
- `GET /api/auth/github` - Initiate GitHub OAuth
- `GET /api/auth/github/callback` - GitHub OAuth callback
- `GET /api/auth/integrations` - Get all integrations
- `GET /api/auth/integrations/:integrationId` - Get integration by ID

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

### Commits (Requires GitHub Authentication)
- `GET /api/commits` - Get all commits (with pagination, repository filter, and author filter)
- `GET /api/commits/:commitId` - Get commit by ID
- `GET /api/commits/sha/:sha` - Get commit by SHA
- `POST /api/commits/sync/:repositoryId` - Sync commits from GitHub for a repository
- `GET /api/commits/stats/:repositoryId` - Get commit statistics for a repository

### Health Check
- `GET /health` - Application health status

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
- Users can sync their GitHub data (organizations, repositories, commits)
- All sync operations use the authenticated user's GitHub token
- Data is filtered by user's integration ID

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3000` |
| `MONGODB_URI` | MongoDB connection string | Required |
| `JWT_SECRET` | JWT secret key | Required |
| `JWT_EXPIRES_IN` | JWT expiration time | `7d` |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID | Required |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth client secret | Required |
| `GITHUB_CALLBACK_URL` | GitHub OAuth callback URL | `http://localhost:3000/api/auth/github/callback` |
| `SESSION_SECRET` | Session secret key | Required |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` (15 minutes) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |
| `LOG_LEVEL` | Logging level | `info` |

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

## Technology Stack

- **Node.js v22** - Latest LTS with ES modules
- **Express.js v5** - Latest Express with improved performance
- **MongoDB** - NoSQL database
- **Mongoose v8** - MongoDB ODM
- **Joi** - Request validation
- **Winston** - Logging
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Passport.js** - Authentication middleware
- **GitHub OAuth** - Third-party authentication

## Security Features

- **GitHub OAuth Authentication** - Secure third-party authentication
- **Session Management** - Secure session handling
- **Resource Ownership** - Users can only access their own data
- **Rate Limiting** - Prevents abuse with configurable limits
- **CORS** - Cross-origin resource sharing protection
- **Helmet** - Security headers
- **Input Validation** - Joi validation for all inputs
- **Error Handling** - Comprehensive error handling without exposing internals

## Logging

The application uses Winston for logging with the following features:
- File-based logging (error.log, combined.log)
- Console logging in development
- Structured JSON logging
- Request/response logging
- Error stack traces
- Authentication event logging

## Database

- **MongoDB** with Mongoose ODM
- **Validation** at schema level
- **GitHub User Model** - Stores GitHub user information
- **Integration Model** - Manages GitHub OAuth integrations
- **Data Models** - Organizations, repositories, commits, etc.
- **User data isolation** - Each user's data is separated by integration ID

## Error Handling

- Global error handler middleware
- Proper HTTP status codes
- Structured error responses
- Error logging with context
- Development vs production error details

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run linting: `npm run lint`
6. Submit a pull request

## License

MIT License - see LICENSE file for details 