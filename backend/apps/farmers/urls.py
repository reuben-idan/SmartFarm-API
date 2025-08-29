from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views.farmer_profile_views import FarmerProfileViewSet

app_name = 'farmers'

router = DefaultRouter()
router.register(r'profiles', FarmerProfileViewSet, basename='farmerprofile')

urlpatterns = [
    path('', include(router.urls)),
    
    # Additional endpoints
    path('stats/', FarmerProfileViewSet.as_view({'get': 'stats'}), name='farmer-stats'),
]
