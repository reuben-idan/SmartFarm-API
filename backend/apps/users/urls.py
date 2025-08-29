from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views.user_views import UserViewSet, UserProfileViewSet
from .views.auth_views import (
    CustomTokenObtainPairView,
    CustomTokenRefreshView,
    UserRegistrationView,
    LogoutView
)

app_name = 'users'

# Create a router for viewset routes
router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'profiles', UserProfileViewSet, basename='profile')

# Authentication URL patterns
auth_patterns = [
    path('login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('logout/', LogoutView.as_view(), name='logout'),
]

urlpatterns = [
    # Include ViewSet URLs
    path('', include(router.urls)),
    
    # Authentication URLs
    path('auth/', include((auth_patterns, 'authentication'))),
    
    # User Profile
    path('me/', UserViewSet.as_view({'get': 'me'}), name='me'),
    path('change-password/', 
         UserViewSet.as_view({'post': 'change_password'}), 
         name='change_password'),
]
