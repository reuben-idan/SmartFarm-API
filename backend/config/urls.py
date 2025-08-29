"""SmartFarm URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

# Schema View for API documentation
schema_view = get_schema_view(
   openapi.Info(
      title="SmartFarm API",
      default_version='v1',
      description="API documentation for SmartFarm application",
      terms_of_service="https://www.smartfarm.com/terms/",
      contact=openapi.Contact(email="contact@smartfarm.com"),
      license=openapi.License(name="MIT License"),
   ),
   public=True,
   permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # API Documentation
    path('api/docs/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('api/redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    
    # API v1
    path('api/v1/', include([
        # Authentication
        path('auth/', include('apps.users.urls')),
        
        # Apps
        path('farmers/', include('apps.farmers.urls')),
        path('crops/', include('apps.crops.urls')),
        path('prices/', include('apps.prices.urls')),
        path('recommendations/', include('apps.recommendations.urls')),
        path('yields/', include('apps.yields.urls')),
    ])),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
