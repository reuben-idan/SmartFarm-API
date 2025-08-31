# Authentication System

This document describes the JWT-based authentication system used in the SmartFarm API.

## Overview

The authentication system uses JSON Web Tokens (JWT) for stateless authentication. Tokens are issued upon successful login and must be included in the `Authorization` header for protected routes.

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```
# JWT Settings
SECRET_KEY=your-secret-key-here  # Generate with: openssl rand -hex 32
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Admin User (created on first run)
ADMIN_EMAIL=admin@example.com
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change-this-password
```

## Authentication Flow

1. **Login**
   - Endpoint: `POST /api/auth/token`
   - Request body: `username` and `password`
   - Response: JWT token and user data

2. **Accessing Protected Routes**
   - Include the token in the `Authorization` header:
     ```
     Authorization: Bearer <token>
     ```

## Available Endpoints

### Login

```
POST /api/auth/token
Content-Type: application/x-www-form-urlencoded

username=admin&password=your-password
```

**Response**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "username": "admin",
    "email": "admin@example.com",
    "is_admin": true
  }
}
```

### Get Current User

```
GET /api/auth/me
Authorization: Bearer <token>
```

### Example Protected Route

```
GET /api/protected
Authorization: Bearer <token>
```

## Error Responses

- **401 Unauthorized**: Invalid or missing token
- **403 Forbidden**: Insufficient permissions
- **422 Unprocessable Entity**: Validation error

## Testing

Run the test suite with:

```bash
pytest tests/test_auth.py -v
```

## Security Considerations

1. Always use HTTPS in production
2. Store the `SECRET_KEY` securely and never commit it to version control
3. Keep token expiration times short and implement refresh tokens if needed
4. Use strong passwords and password hashing
5. Implement rate limiting to prevent brute force attacks

## Extending the System

To add user roles or permissions:

1. Extend the user model with role/permission fields
2. Create middleware or dependency functions to check permissions
3. Update the token generation/validation to include role information
