# SmartFarm Authentication System

This document provides an overview of the authentication system implemented in the SmartFarm API.

## Features

- User registration with email verification
- JWT-based authentication
- Role-based access control
- Password reset functionality
- User profile management
- Admin user management

## Setup

### Prerequisites

- Python 3.8+
- Django 4.2+
- Django REST Framework
- djangorestframework-simplejwt
- PostgreSQL (recommended for production)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/SmartFarm-API.git
   cd SmartFarm-API
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit the `.env` file with your configuration.

5. Run migrations:
   ```bash
   python manage.py migrate
   ```

6. Create default user groups and permissions:
   ```bash
   python manage.py create_default_groups
   ```

7. Create a superuser:
   ```bash
   python manage.py createsuperuser
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register/` - Register a new user
- `POST /api/auth/login/` - Login and get JWT tokens
- `POST /api/auth/token/refresh/` - Refresh access token
- `GET /api/auth/verify-email/<uidb64>/<token>/` - Verify email address
- `POST /api/auth/password/reset/` - Request password reset
- `POST /api/auth/password/reset/confirm/` - Confirm password reset
- `POST /api/auth/password/change/` - Change password (authenticated)

### User Management

- `GET /api/users/me/` - Get current user profile
- `PUT /api/users/me/` - Update current user profile
- `GET /api/users/` - List all users (admin only)
- `GET /api/users/{id}/` - Get user details (admin only)
- `PUT /api/users/{id}/` - Update user (admin only)
- `DELETE /api/users/{id}/` - Delete user (admin only)

## Testing

Run the authentication tests:

```bash
python run_auth_tests.py
```

## Email Configuration

For development, emails are printed to the console. For production, configure these environment variables:

```
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.your-email-provider.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@example.com
EMAIL_HOST_PASSWORD=your-email-password
DEFAULT_FROM_EMAIL=your-email@example.com
```

## Security Considerations

- All passwords are hashed using PBKDF2 with a SHA256 hash
- JWT tokens have a short expiration time (1 hour for access, 1 day for refresh)
- Password reset tokens are single-use and expire after 1 hour
- Email verification is required before account activation
- CSRF protection is enabled for all authenticated requests

## Deployment

For production deployment:

1. Set `DEBUG=False` in your environment variables
2. Configure a production database (PostgreSQL recommended)
3. Set up a proper email backend
4. Use a production-ready WSGI server (e.g., Gunicorn with Nginx)
5. Set up SSL/TLS for secure connections
6. Configure proper CORS settings

## Troubleshooting

- **Email not sending**: Check your email configuration and server logs
- **Token issues**: Verify token expiration and secret key configuration
- **Permission denied**: Ensure the user has the correct role and permissions
- **Database errors**: Run migrations and check database connection settings

## License

This project is licensed under the MIT License - see the LICENSE file for details.
