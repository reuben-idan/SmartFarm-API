from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views.crop_views import CropViewSet

# Create a router for our viewsets
router = DefaultRouter()
router.register(r'crops', CropViewSet, basename='crop')

app_name = 'crops'

urlpatterns = [
    # Include the router URLs
    path('', include(router.urls)),
    
    # Additional endpoints
    path('seasons/', CropViewSet.as_view({'get': 'seasons'}), name='crop-seasons'),
]
