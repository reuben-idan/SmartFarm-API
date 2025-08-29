from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView, TokenObtainPairView

from .views.user_views import UserViewSet, UserProfileViewSet
from . import views

app_name = 'users'

# Create a router for viewset routes
router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'profiles', UserProfileViewSet, basename='profile')

urlpatterns = [
    # Include ViewSet URLs
    path('', include(router.urls)),
    
    # Authentication
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # User Profile
    path('me/', UserViewSet.as_view({'get': 'me'}), name='me'),
    path('change-password/', 
         UserViewSet.as_view({'post': 'change_password'}), 
         name='change_password'),
]
