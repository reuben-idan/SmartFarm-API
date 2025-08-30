import os
import django

def create_test_user():
    """Create a test user if it doesn't exist."""
    from django.contrib.auth import get_user_model
    
    User = get_user_model()
    
    # Create test user if it doesn't exist
    if not User.objects.filter(email='test@example.com').exists():
        user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User',
            is_active=True
        )
        print(f"Created test user: {user.email}")
    else:
        print("Test user already exists")

if __name__ == '__main__':
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.local')
    django.setup()
    create_test_user()
