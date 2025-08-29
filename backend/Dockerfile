# Base image
FROM python:3.10-slim-bullseye as base

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV PYTHONFAULTHANDLER=1
ENV PIP_NO_CACHE_DIR=off \
    PIP_DISABLE_PIP_VERSION_CHECK=on \
    PIP_DEFAULT_TIMEOUT=100 \
    POETRY_VERSION=1.6.1

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    gettext \
    && rm -rf /var/lib/apt/lists/*

# Install Poetry
RUN pip install "poetry==$POETRY_VERSION"

# Set work directory
WORKDIR /app

# Copy project files
COPY pyproject.toml poetry.lock* ./

# Install project dependencies
RUN poetry config virtualenvs.create false \
    && poetry install --no-interaction --no-ansi --no-root $(test "$DJANGO_ENV" == production && echo "--no-dev")

# Copy project
COPY . .

# Collect static files
RUN if [ "$DJANGO_ENV" = "production" ]; then \
    python manage.py collectstatic --noinput; \
    fi

# Development stage
FROM base as development

# Install development dependencies
RUN poetry install --no-interaction --no-ansi

# Run the application
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

# Production stage
FROM base as production

# Set environment variables for production
ENV DJANGO_SETTINGS_MODULE=config.settings.production

# Install Gunicorn
RUN pip install gunicorn

# Create a non-root user
RUN useradd -m smartfarm
RUN chown -R smartfarm:smartfarm /app
USER smartfarm

# Run Gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "4", "--worker-class", "gthread", "--threads", "2", "config.wsgi:application"]

# Test stage
FROM base as test

# Install test dependencies
RUN poetry install --no-interaction --no-ansi

# Run tests
CMD ["pytest", "-v", "--cov=.", "--cov-report=xml"]
