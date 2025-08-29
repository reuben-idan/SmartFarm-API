from django.urls import path, include
from rest_framework.routers import DefaultRouter
from ..views.user_views import UserViewSet, UserProfileViewSet, CustomTokenObtainPairView

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'profiles', UserProfileViewSet, basename='profile')

urlpatterns = [
    # Authentication endpoints
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    
    # Include router URLs
    path('', include(router.urls)),
]
