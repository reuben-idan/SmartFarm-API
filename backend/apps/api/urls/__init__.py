from django.urls import path, include

# Import app-specific URL configurations
from . import user_urls

app_name = 'api'

urlpatterns = [
    # User authentication and profiles
    path('auth/', include((user_urls, 'users'), namespace='users')),
]
