# Backend Setup Guide

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Database Configuration
MONGO_URI=mongodb://127.0.0.1:27017/urban

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here

# Server Configuration
PORT=5001
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Optional: Logging
LOG_LEVEL=info
```

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   ```

3. Seed the database:
   ```bash
   npm run seed
   ```

## Security Features

- **Helmet**: Security headers
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS**: Configured for frontend origin
- **Input Validation**: All inputs are validated and sanitized
- **Error Handling**: Comprehensive error handling without exposing sensitive data

## API Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get user profile
- `GET /api/issues` - List issues
- `POST /api/issues` - Create issue
- `GET /api/issues/:id` - Get issue details
- `POST /api/issues/:id/comments` - Add comment
- `PATCH /api/issues/:id/status` - Update issue status
