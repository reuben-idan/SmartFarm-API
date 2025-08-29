"""
Setup script for the SmartFarm API project.
This script initializes the database and creates a superuser.
"""
import os
import sys
import django
from django.core.management import call_command

def setup_database():
    """Set up the database and create a superuser."""
    # Set up Django environment
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
    django.setup()
    
    print("\nSetting up the database...")
    
    # Run migrations
    print("Running migrations...")
    call_command('makemigrations')
    call_command('migrate')
    
    # Create superuser if it doesn't exist
    from django.contrib.auth import get_user_model
    User = get_user_model()
    
    if not User.objects.filter(is_superuser=True).exists():
        print("\nCreating superuser...")
        call_command('createsuperuser')
    else:
        print("\nSuperuser already exists.")
    
    print("\nSetup complete!")

if __name__ == "__main__":
    print("SmartFarm API - Database Setup")
    print("==============================")
    
    # Ensure the user has created a .env file
    if not os.path.exists('.env'):
        print("\nError: .env file not found.")
        print("Please copy .env.example to .env and update the values.")
        sys.exit(1)
    
    setup_database()
