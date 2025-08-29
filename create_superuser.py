import os
import django

# Set up the Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

# Now we can import Django models
from django.contrib.auth import get_user_model

try:
    User = get_user_model()
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
    print(f"Error creating superuser: {e}")
