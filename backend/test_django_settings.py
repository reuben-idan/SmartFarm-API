import os
import sys
import django

# Add the project directory to the Python path
project_root = os.path.dirname(os.path.abspath(__file__))
sys.path.append(project_root)

# Set the Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')

# Setup Django
try:
    django.setup()
    print("Django setup successful!")
    
    # Test database connection
    from django.db import connection
    connection.ensure_connection()
    print("Database connection successful!")
    
    # Test if we can import the User model
    from django.contrib.auth import get_user_model
    User = get_user_model()
    print(f"User model: {User.__name__}")
    
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
