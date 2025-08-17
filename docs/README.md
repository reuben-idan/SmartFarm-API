# SmartFarm API

## Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SmartFarm-API
   ```

2. **Set up a virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   - Copy `.env.example` to `.env`
   - Update the environment variables as needed

5. **Run migrations**
   ```bash
   make migrate
   ```

6. **Create a superuser**
   ```bash
   make createsuperuser
   ```

## Development

- **Run the development server**
  ```bash
  make run
  ```

- **Run tests**
  ```bash
  make test
  ```

- **Run linters**
  ```bash
  make lint
  ```

- **Format code**
  ```bash
  make format
  ```

## API Documentation

Once the development server is running, you can access:
- API Schema: http://localhost:8000/api/schema/
- Swagger UI: http://localhost:8000/api/schema/swagger-ui/
- ReDoc: http://localhost:8000/api/schema/redoc/

## Available Make Commands

- `make install` - Install dependencies
- `make run` - Run the development server
- `make migrate` - Run database migrations
- `make createsuperuser` - Create a superuser
- `make shell` - Open Django shell
- `make test` - Run tests
- `make lint` - Run linters
- `make format` - Format code
- `make check` - Run linters and tests
