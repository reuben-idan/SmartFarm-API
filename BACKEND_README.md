# SmartFarm API (FastAPI + Firebase)

A modern, fast, and secure backend for the SmartFarm platform built with FastAPI and Firebase Authentication.

## Features

- 🔐 **Firebase Authentication** - Email/Password and Google Sign-In
- ⚡ **FastAPI** - High performance, easy to learn, fast to code
- 🔒 **JWT Token Authentication** - Secure API endpoints
- 🌐 **CORS** - Cross-Origin Resource Sharing enabled
- 📝 **OpenAPI Documentation** - Interactive API docs at `/docs` and `/redoc`
- 🧪 **Testing** - Pytest with test coverage
- 🚀 **Production Ready** - Gunicorn with Uvicorn workers

## Prerequisites

- Python 3.11+
- Firebase Project with Authentication enabled
- Service Account Key JSON file from Firebase Console
- Node.js 18+ (for frontend development)

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/reuben-idan/SmartFarm-API.git
cd SmartFarm-API
```

### 2. Set Up Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your Firebase credentials and other settings.

### 3. Set Up Python Virtual Environment

```bash
# On Windows
python -m venv venv
.\venv\Scripts\activate

# On macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### 4. Install Dependencies

```bash
pip install -r requirements.txt
```

### 5. Set Up Firebase Admin SDK

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings > Service Accounts
4. Click "Generate New Private Key"
5. Save the JSON file as `serviceAccountKey.json` in the project root

### 6. Run the Application

#### Development Mode

```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

#### Production Mode

```bash
gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app --bind 0.0.0.0:8000
```

## API Documentation

- **Swagger UI**: `/docs`
- **ReDoc**: `/redoc`
- **OpenAPI Schema**: `/openapi.json`

## Project Structure

```
backend/
├── app/
│   ├── api/
│   │   ├── endpoints/
│   │   │   └── auth.py        # Authentication endpoints
│   │   └── deps.py            # Dependencies and security
│   ├── core/
│   │   └── firebase.py        # Firebase configuration
│   ├── models/                # Database models
│   ├── schemas/               # Pydantic models
│   └── main.py                # FastAPI application
├── tests/                     # Test files
├── .env                       # Environment variables
├── .env.example               # Example environment variables
├── requirements.txt           # Python dependencies
└── README.md                  # This file
```

## Authentication

### Login

1. Client signs in with Firebase Authentication
2. Firebase returns an ID token
3. Client sends the ID token in the `Authorization` header:
   ```
   Authorization: Bearer <ID_TOKEN>
   ```
4. Server verifies the token and grants access to protected routes

### Protected Routes

Use the `get_current_user` dependency to protect your routes:

```python
from fastapi import Depends
from app.api.deps import get_current_user

@app.get("/protected")
async def protected_route(user = Depends(get_current_user)):
    return {"message": "This is a protected route", "user_id": user["uid"]}
```

## Environment Variables

See `.env.example` for all available environment variables.

## Testing

Run tests with pytest:

```bash
pytest
```

## Deployment

### Render.com

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set the following environment variables:
   - `PYTHON_VERSION`: 3.11
   - `PORT`: 10000
   - `PYTHONUNBUFFERED`: 1
   - All variables from your `.env` file
4. Set the build command:
   ```
   pip install -r requirements.txt
   ```
5. Set the start command:
   ```
   gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app --bind 0.0.0.0:$PORT
   ```

## License

MIT
