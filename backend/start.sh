#!/bin/bash
# Exit on error
set -o errexit

# Install dependencies
pip install -r requirements.txt

# Run migrations if needed
# python manage.py migrate

# Start the FastAPI application
exec uvicorn app.main:app --host 0.0.0.0 --port $PORT
