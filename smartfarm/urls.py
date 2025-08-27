"""
URL configuration for smartfarm project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView
from core.views import HealthCheckView

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    
    # Health Check
    path('api/health/', HealthCheckView.as_view(), name='health-check'),
    
    # Authentication & Users
    path('api/auth/', include('users.urls')),
    
    # Suppliers
    path('api/suppliers/', include('suppliers.urls')),

    # Market Prices
    path('api/prices/', include('prices.urls')),

    # Recommendations
    path('api/recommendations/', include('recommendations.urls')),

    # Yield Forecasts
    path('api/yield/', include('yields.urls')),

    # Support Help Desk
    path('api/support/', include('support.urls')),

    # Core App
    path('api/v1/', include('core.urls')),
    
    # Serve React Frontend - This should be the last URL pattern
    re_path(r'^.*', TemplateView.as_view(template_name='index.html'))
]

# Serve media and static files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
else:
    # In production, serve static files through WhiteNoise
    urlpatterns += [
        re_path(r'^static/(?P<path>.*)$', 'django.views.static.serve', {'document_root': settings.STATIC_ROOT}),
    ]
