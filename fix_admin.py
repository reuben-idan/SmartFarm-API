import os
import sys
import django

def setup_django():
    # Set up the Django environment
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
    
    # Add the project directory to the Python path
    project_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend'))
    if project_path not in sys.path:
        sys.path.append(project_path)
    
    # Initialize Django
    django.setup()

def create_superuser():
    from django.contrib.auth import get_user_model
    
    User = get_user_model()
    username = 'reuben_idan'
    email = 'nobleadonis2@gmail.com'
    password = 'Hello.22'
    
    try:
        # Check if user already exists
        if User.objects.filter(username=username).exists():
            user = User.objects.get(username=username)
            user.set_password(password)
            user.email = email
            user.is_staff = True
            user.is_superuser = True
            user.save()
            print(f"Updated existing superuser: {username}")
        else:
            # Create new superuser
            User.objects.create_superuser(username, email, password)
            print(f"Created new superuser: {username}")
            
        print(f"Email: {email}")
        print("Password: ********")
        return True
        
    except Exception as e:
        print(f"Error creating/updating superuser: {str(e)}")
        return False

if __name__ == "__main__":
    print("Setting up Django environment...")
    setup_django()
    
    print("Creating superuser...")
    if create_superuser():
        print("Superuser setup completed successfully!")
    else:
        print("Failed to set up superuser.")
        sys.exit(1)
