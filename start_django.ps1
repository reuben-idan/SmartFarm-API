# Set environment variables
$env:PYTHONPATH = (Get-Item -Path ".").FullName
$env:DJANGO_SETTINGS_MODULE = "smartfarm.settings.local"

# Activate virtual environment
. \.venv\Scripts\Activate.ps1

# Install requirements
Write-Host "Installing requirements..."
pip install -r requirements.txt

# Run migrations
Write-Host "Running migrations..."
python manage.py migrate

# Create admin user if it doesn't exist
Write-Host "Creating admin user if it doesn't exist..."
python -c "
import os; 
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'smartfarm.settings.local'); 
from django.contrib.auth import get_user_model; 
User = get_user_model(); 
User.objects.filter(username='admin').exists() or User.objects.create_superuser('admin', 'admin@example.com', 'admin')
"

# Start the server
Write-Host "Starting development server..."
Write-Host "================================"
python manage.py runserver 8001 --verbosity 3
