# Upwork Task Backend

A professional Node.js Express MongoDB backend with proper structure, error handling, and security features.

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
│   │   └── userController.js # User controller functions
│   ├── helpers/             # Business logic helpers
│   │   ├── authHelper.js    # Authentication helpers
│   │   ├── formatHelper.js  # Data formatting helpers
│   │   └── validationHelper.js # Custom validation helpers
│   ├── middleware/
│   │   ├── errorHandler.js   # Global error handler
│   │   ├── requestLogger.js  # Request logging middleware
│   │   └── validate.js       # Joi validation middleware
│   ├── models/
│   │   └── User.js          # User model
│   ├── routes/
│   │   ├── index.js         # Main routes
│   │   └── userRoutes.js    # User routes
│   ├── services/
│   │   └── userService.js   # User business logic functions
│   └── validations/
│       └── userValidation.js # Joi validation schemas
├── app.js                   # Express application setup
├── server.js                # Server with cluster support
├── package.json             # Dependencies and scripts
└── README.md               # Project documentation
```

## Prerequisites

- **Node.js v22** (>= 22.0.0) - Latest LTS version
- **MongoDB** (>= 4.0.0)
- **npm** or **yarn**

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

### Users
- `POST /api/users/register` - Create a new user
- `GET /api/users` - Get all users (with pagination)
- `GET /api/users/:userId` - Get user by ID
- `PUT /api/users/:userId` - Update user
- `DELETE /api/users/:userId` - Delete user
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update current user profile

### Health Check
- `GET /health` - Application health status

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3000` |
| `MONGODB_URI` | MongoDB connection string | Required |
| `JWT_SECRET` | JWT secret key | Required |
| `JWT_EXPIRES_IN` | JWT expiration time | `7d` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` (15 minutes) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |
| `LOG_LEVEL` | Logging level | `info` |
| `BCRYPT_SALT_ROUNDS` | Password hashing rounds | `12` |

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
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication

## Security Features

- **Password Hashing** - bcrypt with configurable salt rounds
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

## Database

- **MongoDB** with Mongoose ODM
- **Validation** at schema level
- **Middleware** for password hashing
- **Simple and clean** schema design

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