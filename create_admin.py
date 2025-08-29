import os
import sys
import django

def main():
    # Add the project directory to the Python path
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend'))
    if project_root not in sys.path:
        sys.path.insert(0, project_root)
    
    # Set up Django
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
    
    try:
        django.setup()
        
        # Now we can import Django models
        from django.contrib.auth import get_user_model
        
        User = get_user_model()
        
        # Check if user already exists
        if not User.objects.filter(username='reuben_idan').exists():
            User.objects.create_superuser(
                username='reuben_idan',
                email='nobleadonis2@gmail.com',
                password='Hello.22'
            )
            print("Superuser created successfully!")
        else:
            print("Superuser already exists.")
            
    except Exception as e:
        print(f"Error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
