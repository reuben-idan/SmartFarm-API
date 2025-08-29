"""
API URL configuration for SmartFarm API.

This module contains the API URL patterns for the project.
"""

from django.urls import include, path
from rest_framework.routers import DefaultRouter
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)

# Create a router for API endpoints
router = DefaultRouter()

# API URL patterns
urlpatterns = [
    # API base URL
    path('', include(router.urls)),
    
    # API schema and documentation
    path('schema/', SpectacularAPIView.as_view(), name='schema'),
    path('docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    
    # Authentication and user management
    path('auth/', include('apps.users.urls', namespace='users')),
    
    # App-specific API endpoints
    # NOTE: include only existing urls modules; add others when available
    # path('crops/', include('apps.crops.urls', namespace='crops')),
    # path('farmers/', include('apps.farmers.urls', namespace='farmers')),
    path('prices/', include('apps.prices.api_urls', namespace='prices')),
    path('yields/', include('apps.yields.api_urls', namespace='yields')),
    path('recommendations/', include('apps.recommendations.api_urls', namespace='recommendations')),
    path('reports/', include('apps.reports.api_urls', namespace='reports')),
]
