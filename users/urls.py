from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from . import views

app_name = 'users'

# Create a router for viewset routes
router = DefaultRouter()
router.register(r'users', views.UserViewSet, basename='user')

urlpatterns = [
    # Include ViewSet URLs
    path('', include(router.urls)),
    
    # Authentication
    path('register/', views.UserRegisterView.as_view(), name='register'),
    path('verify-email/<str:uidb64>/<str:token>/', 
         views.VerifyEmailView.as_view(), 
         name='verify_email'),
    path('login/', views.CustomTokenObtainPairView.as_view(), name='login'),
    path('token/refresh/', views.CustomTokenRefreshView.as_view(), name='token_refresh'),
    
    # Password Management
    path('password/change/', 
         views.ChangePasswordView.as_view(), 
         name='change_password'),
    path('password/reset/', 
         views.PasswordResetRequestView.as_view(), 
         name='password_reset_request'),
    path('password/reset/confirm/', 
         views.PasswordResetConfirmView.as_view(), 
         name='password_reset_confirm'),
    
    # User Profile
    path('profile/', views.ProfileViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'patch': 'partial_update'
    }), name='profile'),
    
    # Auth Check
    path('check-auth/', views.CheckAuthView.as_view(), name='check_auth'),
]
