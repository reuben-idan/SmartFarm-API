# SmartFarm Platform

A secure, scalable agricultural management platform built with modern web technologies to optimize farm operations and data management.

## Project Status

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/fastapi-0.109.0-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/react-18-61dafb.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-5.0-3178c6.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/vite-4.0+-646CFF.svg)](https://vitejs.dev/)
[![Vercel](https://img.shields.io/badge/deployed%20on-vercel-black.svg)](https://vercel.com)

## Table of Contents

- [Key Features](#key-features)
- [Security Considerations](#security-considerations)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
  - [Prerequisites](#prerequisites)
  - [Local Development](#local-development)
  - [Environment Variables](#environment-variables)
- [Architecture](#architecture)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Key Features

- **Farm Management**: Track crops, livestock, and equipment
- **Real-time Monitoring**: WebSocket integration for live data
- **Data Analytics**: Visualize farm performance metrics
- **Role-based Access Control**: Secure multi-user access
- **Responsive Design**: Mobile-first approach for field use

## Security Considerations

- **Authentication**: JWT-based authentication with refresh tokens
- **Data Protection**: Environment variables for sensitive data
- **CORS**: Strict origin validation
- **Dependencies**: Regular security updates and dependency scanning
- **HTTPS**: Enforced for all production deployments

## Tech Stack

### Backend
- **Framework**: FastAPI 0.109.0+
- **Database**: PostgreSQL 13+
- **Cache**: Redis 6+
- **Authentication**: JWT, OAuth2
- **API Documentation**: OpenAPI/Swagger

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 4.0+
- **State Management**: React Query
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI, Headless UI

## Quick Start

### Prerequisites

- Python 3.10+ (with pip)
- Node.js 18+ (with npm)
- PostgreSQL 13+
- Redis 6+
- Git 2.30+

### Environment Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/smartfarm-api.git
   cd smartfarm-api
   ```

2. **Set up Python virtual environment**
   ```bash
   # On Windows
   python -m venv venv
   .\venv\Scripts\activate
   
   # On macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install Python dependencies**
   ```bash
   pip install -r backend/requirements/development.txt
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit the `.env` file with your configuration:
   ```env
   # Django
   DEBUG=True
   SECRET_KEY=your-secret-key-here
   DJANGO_ENV=development
   
   # Database
   DB_NAME=smartfarm
   DB_USER=postgres
   DB_PASSWORD=postgres
   DB_HOST=localhost
   DB_PORT=5432
   
   # CORS
   CORS_ALLOWED_ORIGINS=http://localhost:3000
   
   # JWT
   JWT_SECRET_KEY=your-jwt-secret-key-here
   ACCESS_TOKEN_LIFETIME=3600
   REFRESH_TOKEN_LIFETIME=86400
   ```
   cd frontend
   npm ci
   ```

5. **Configure environment variables** (see below)

### Environment Variables

Create `.env` files in both root and frontend directories:

**Backend (root/.env)**
```env
# Required
DATABASE_URL=postgresql://user:password@localhost:5432/smartfarm
SECRET_KEY=generate-a-secure-key

# Optional (with defaults)
DEBUG=True
LOG_LEVEL=INFO
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

**Frontend (frontend/.env)**
```env
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
```

## Architecture

### Backend Structure
```bash
backend/
├── app/                 # Main application package
│   ├── api/             # API endpoints
│   ├── core/            # Core functionality
│   ├── models/          # Database models
│   └── services/        # Business logic
├── tests/               # Test suite
└── main.py              # Application entry point
```

### Frontend Structure
```bash
frontend/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/           # Page components
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility functions
│   └── App.tsx          # Main application component
└── vite.config.ts       # Build configuration
```

## API Documentation

Interactive API documentation is available at `/docs` when running the development server:

- **OpenAPI Specification**: `/openapi.json`
- **Swagger UI**: Interactive API explorer
- **ReDoc**: Alternative documentation viewer
- **Authentication**: JWT token support
- **Example Requests**: Test endpoints directly from the docs

## Testing

### Backend Tests
```bash
# Run all tests
pytest

# Run with coverage report
pytest --cov=app --cov-report=html
```

### Frontend Tests
```bash
cd frontend

# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

## Deployment

### Production Setup

1. **Backend Requirements**
   - PostgreSQL 13+
   - Redis 6+
   - Python 3.10+
   - Gunicorn/UVicorn
   - Nginx (recommended)

2. **Frontend Deployment**
   ```bash
   cd frontend
   npm run build
   vercel --prod
   ```

### CI/CD

- GitHub Actions for automated testing
- Vercel for frontend deployments
- Docker support included

## Security

### Authentication & Authorization
- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- OAuth2 support for third-party integrations
- Password hashing with bcrypt

### Data Protection
- Environment variables for sensitive data
- Input validation and sanitization
- CORS with strict origin validation
- Rate limiting and request throttling

### Infrastructure
- HTTPS enforcement
- Security headers (CSP, HSTS, XSS Protection)
- Regular security audits and dependency updates
- Database connection pooling and query optimization

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository and create your feature branch
2. Set up the development environment (see [Quick Start](#quick-start))
3. Make your changes and write tests
4. Ensure all tests pass and code is properly formatted
5. Submit a pull request with a clear description of changes

### Code Style
- Follow PEP 8 for Python code
- Use TypeScript for all frontend code
- Write meaningful commit messages
- Document new features and endpoints

### Testing
- Write unit tests for new features
- Maintain test coverage above 90%
- Update documentation when adding new features

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue in the [GitHub repository](https://github.com/yourusername/smartfarm-api/issues).

## Key Features

### Core Functionality
- **Farm Management**: Track crops, livestock, and equipment
- **Real-time Monitoring**: WebSocket integration for live data
- **Data Analytics**: Visualize farm performance metrics
- **Role-based Access Control**: Secure multi-user access
- **Responsive Design**: Mobile-first approach for field use

### Interactive Documentation

- **Swagger UI**: [/api/docs/](http://localhost:8000/api/docs/)
- **ReDoc**: [/api/redoc/](http://localhost:8000/api/redoc/)
- **Schema**: [/api/schema/](http://localhost:8000/api/schema/)

### Authentication

All API endpoints (except public ones) require JWT authentication. Include the token in the `Authorization` header:

```http
Authorization: Bearer <your_access_token>
```

### Example API Requests

#### Get Access Token

```bash
curl -X POST http://localhost:8000/api/auth/token/ \
  -H "Content-Type: application/json" \
  -d '{"username": "your_username", "password": "your_password"}'
```

#### Refresh Access Token

```bash
curl -X POST http://localhost:8000/api/auth/token/refresh/ \
  -H "Content-Type: application/json" \
  -d '{"refresh": "your_refresh_token"}'
```

#### Get Current User Profile

```bash
curl -X GET http://localhost:8000/api/v1/users/me/ \
  -H "Authorization: Bearer your_access_token"
```

#### Get All Crops (Public Endpoint)

```bash
curl -X GET http://localhost:8000/api/v1/crops/
```

#### Filter Crops by Type
### Prerequisites
- Python 3.9+
- Node.js 18+
- PostgreSQL 13+
- Redis 6+

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/reuben-idan/SmartFarm-API.git
   cd SmartFarm-API
   ```

2. **Set up backend**
   ```bash
   # Create and activate virtual environment
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   
   # Install dependencies
   pip install -r requirements.txt
   
   # Set up environment variables
   cp .env.example .env
   # Edit .env with your configuration
   
   # Run migrations
   python manage.py migrate
   
   # Create superuser
   python manage.py createsuperuser
   ```

3. **Set up frontend**
   ```bash
   cd frontend
   npm install
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Run the application**
   ```bash
   # In one terminal (backend)
   python manage.py runserver
   
   # In another terminal (frontend)
   cd frontend
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - API: http://localhost:8000
   - Admin: http://localhost:8000/admin
   ```bash
   # Make the script executable
   chmod +x scripts/demo.sh
   
   # Run the demo script
   ./scripts/demo.sh
   ```
   This script sets up a complete demo environment with sample data.

## Yield Forecast (Mock)

Endpoint: `GET /api/yield/forecast/`

Query params:

- `crop` (str|int, required) — crop name (case-insensitive) or ID
- `region` (str, required) — must be supported (e.g., Nairobi, Mombasa, Kisumu, Nakuru)
- `season` (str, required) — one of `major`, `minor`, `all`
- `hectares` (decimal, required) — must be >= 0.01

Deterministic formula:

```
forecast_yield = base_yield_by_crop * regional_multiplier * season_factor * hectares
```

Factors are configured in `smartfarm/settings.py`:

- `YIELD_BASE_YIELDS` (t/ha)
- `YIELD_REGION_MULTIPLIERS`
- `YIELD_SEASON_FACTORS`

Response fields:

- `crop`, `region`, `season`, `hectares`, `forecast_yield`, `factors`

Example:

```bash
curl "http://localhost:8000/api/yield/forecast/?crop=Maize&region=Nairobi&season=major&hectares=2.50"
```

## Environment Variables

The following environment variables need to be set in your `.env` file:

```
DEBUG=True
SECRET_KEY=your-secret-key
ALLOWED_HOSTS=localhost,127.0.0.1
DB_NAME=smartfarm
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
JWT_ACCESS_TOKEN_LIFETIME=300
JWT_REFRESH_TOKEN_LIFETIME=86400
```

## Development

### Prerequisites

- Python 3.9+
- pip
- PostgreSQL (for local development)

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/reuben-idan/SmartFarm-API.git
   cd SmartFarm-API
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. Install development dependencies:
   ```bash
   pip install -r requirements.txt
   pip install black isort flake8 pytest-cov
   ```

### Code Style

This project uses:
- **Black** for code formatting
- **isort** for import sorting
- **flake8** for linting

Run these commands before committing:
```bash
black .
isort .
flake8
```

### Testing

Run tests with coverage:
```bash
pytest --cov=./ --cov-report=term-missing
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Pull Request Requirements
- All tests must pass
- Code coverage must remain at 80% or higher
- Code must be formatted with Black and imports sorted with isort
- No flake8 warnings or errors

## Development

### Frontend Development

```bash
# Start the Vite development server
cd frontend
npm run dev
```

The frontend will be available at http://localhost:3000 and will proxy API requests to http://localhost:8000

### Backend Development

```bash
# Start the Django development server
python manage.py runserver
```

### Running Tests

```bash
# Run backend tests
python manage.py test

# Run frontend tests
cd frontend
npm test
```

## Project Structure

```
smartfarm-api/
├── frontend/               # React frontend
│   ├── src/                # Source files
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── lib/            # Utility functions
│   │   └── styles/         # Global styles
│   ├── public/             # Static files
│   └── package.json        # Frontend dependencies
│
├── smartfarm/              # Django project settings
├── core/                   # Core app with shared functionality
├── users/                  # User management app
├── crops/                  # Crop management app
├── scripts/                # Utility scripts
└── requirements.txt        # Python dependencies
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Project Status

[![CI](https://github.com/reuben-idan/SmartFarm-API/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/reuben-idan/SmartFarm-API/actions/workflows/ci.yml)
[![Coverage Status](https://img.shields.io/codecov/c/github/reuben-idan/SmartFarm-API?style=flat-square)](https://codecov.io/gh/reuben-idan/SmartFarm-API)
[![Python Version](https://img.shields.io/badge/python-3.9+-blue.svg?style=flat-square)](https://www.python.org/downloads/)
[![Django Version](https://img.shields.io/badge/django-5.0-brightgreen.svg?style=flat-square)](https://www.djangoproject.com/)
[![Code style: black](https://img.shields.io/badge/code%20style-black-000000.svg?style=flat-square)](https://github.com/psf/black)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

## Support

For support, please open an issue in the [GitHub repository](https://github.com/reuben-idan/SmartFarm-API/issues).
