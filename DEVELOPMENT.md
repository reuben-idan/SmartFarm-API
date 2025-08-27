# SmartFarm Development Guide

This guide will help you set up the SmartFarm application for local development.

## Prerequisites

- Python 3.9+
- Node.js 18+
- npm 9+
- SQLite (or PostgreSQL for production)

## Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/SmartFarm-API.git
   cd SmartFarm-API
   ```

2. **Create and activate a virtual environment**
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
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   Create a `.env` file in the project root:
   ```env
   DEBUG=True
   SECRET_KEY=your-secret-key
   ALLOWED_HOSTS=localhost,127.0.0.1
   ```

5. **Run database migrations**
   ```bash
   python manage.py migrate
   ```

6. **Create a superuser**
   ```bash
   python manage.py createsuperuser
   ```

7. **Start the development server**
   ```bash
   python manage.py runserver
   ```

## Frontend Setup

1. **Navigate to the frontend directory**
   ```bash
   cd frontend
   ```

2. **Install Node.js dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Copy the example environment file and update as needed:
   ```bash
   cp .env.example .env
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```
   The frontend will be available at http://localhost:3000

## Development Workflow

- **Backend API**: http://localhost:8000
- **Frontend**: http://localhost:3000
- **Admin Interface**: http://localhost:8000/admin
- **API Documentation**: http://localhost:8000/api/docs/

## Running Tests

### Backend Tests
```bash
python manage.py test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Production Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment instructions.

## Contributing

1. Create a new branch for your feature or bugfix
2. Make your changes and write tests
3. Run the test suite
4. Submit a pull request

## License

MIT
