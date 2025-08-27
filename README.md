# SmartFarm API

A modern, scalable RESTful API for agricultural management systems, built with Django and Django REST Framework.

## Features

- **User Authentication**: JWT-based authentication with role-based access control
- **Farmer Profiles**: Detailed farmer information with regional data
- **Crop Management**: Comprehensive crop information with filtering and search
- **Role-Based Access**: Multiple user roles (farmer, agronomist, supplier, extension officer)
- **API Documentation**: Interactive API documentation using Swagger UI and ReDoc with JWT support

## Tech Stack

- **Backend**: Django 5.0
- **REST Framework**: Django REST Framework 3.15.1
- **Authentication**: JWT (djangorestframework-simplejwt)
- **Database**: PostgreSQL (production), SQLite (development)
- **API Documentation**: drf-spectacular with Swagger UI and ReDoc
- **Testing**: Django Test Framework

## API Documentation

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

```bash
curl -X GET "http://localhost:8000/api/v1/crops/?type=vegetable"
```

#### Create New Farmer (Admin Only)

```bash
curl -X POST http://localhost:8000/api/v1/farmers/ \
  -H "Authorization: Bearer your_access_token" \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com", "region": "North"}'
```

## Getting Started

### Prerequisites

- Python 3.9+
- PostgreSQL (for production)
- pip (Python package manager)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/reuben-idan/SmartFarm-API.git
   cd SmartFarm-API
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. Run migrations:
   ```bash
   python manage.py migrate
   ```

6. Create a superuser:
   ```bash
   python manage.py createsuperuser
   ```

7. Run the development server:
   ```bash
   python manage.py runserver
   ```

## API Endpoints

| Endpoint | Method | Description | Authentication Required |
|----------|--------|-------------|-------------------------|
| `/api/auth/register/` | POST | Register a new user | No |
| `/api/auth/login/` | POST | Get JWT tokens | No |
| `/api/auth/me/` | GET, PATCH | Get/Update user profile | Yes |
| `/api/farmers/` | GET, POST | List/Create farmer profiles | Yes |
| `/api/farmers/{id}/` | GET, PATCH, DELETE | Manage farmer profile | Owner/Staff |
| `/api/crops/` | GET, POST | List/Create crops | GET: No, POST: Staff |
| `/api/crops/{id}/` | GET, PATCH, DELETE | Manage crop | GET: No, Others: Staff |
| `/api/prices/` | GET | List market prices with filters and ordering | No |
| `/api/recommendations/` | GET | Get top 5 crop recommendations for a region | No |
| `/api/yield/forecast/` | GET | Deterministic mock yield forecast and persistence | No |

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer your.jwt.token.here
```

## Testing

Run the test suite with:

```bash
python manage.py test
```

## API Documentation

Interactive API documentation is available at:

- Swagger UI: `/api/docs/`
- ReDoc: `/api/redoc/`

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
