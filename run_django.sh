#!/bin/bash

# Set environment variables
export PYTHONPATH=$(pwd)
export DJANGO_SETTINGS_MODULE=smartfarm.settings.local

# Activate virtual environment
source .venv/Scripts/activate

# Install requirements
echo "Installing requirements..."
pip install -r requirements.txt

# Run migrations
echo "Running migrations..."
python manage.py migrate

# Create admin user if it doesn't exist
echo "Creating admin user if it doesn't exist..."
python -c "\
import os; \
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'smartfarm.settings.local'); \
from django.contrib.auth import get_user_model; \
User = get_user_model(); \
User.objects.filter(username='admin').exists() or User.objects.create_superuser('admin', 'admin@example.com', 'admin')"

# Start the server
echo "Starting development server..."
echo "================================"
python manage.py runserver 8001 --verbosity 3
