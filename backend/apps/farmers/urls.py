from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views.farmer_profile_views import FarmerProfileViewSet
from .views.farm_type_views import FarmTypeViewSet

app_name = 'farmers'

router = DefaultRouter()
router.register(r'profiles', FarmerProfileViewSet, basename='farmerprofile')
router.register(r'farm-types', FarmTypeViewSet, basename='farmtype')

# Additional endpoints for farmer profiles
farmer_profile_endpoints = [
    path('me/', FarmerProfileViewSet.as_view({'get': 'me'}), name='farmer-me'),
    path('stats/', FarmerProfileViewSet.as_view({'get': 'stats'}), name='farmer-stats'),
    path('<int:pk>/verify/', FarmerProfileViewSet.as_view({'post': 'verify'}), name='farmer-verify'),
    path('<int:pk>/reject/', FarmerProfileViewSet.as_view({'post': 'reject'}), name='farmer-reject'),
]

# Additional endpoints for farm types
farm_type_endpoints = [
    path('farm-types/active/', FarmTypeViewSet.as_view({'get': 'active'}), name='farmtype-active'),
]

urlpatterns = [
    path('', include(router.urls)),
    path('profile/', include(farmer_profile_endpoints)),
    path('', include(farm_type_endpoints)),
]
