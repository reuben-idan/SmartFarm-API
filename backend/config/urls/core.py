""
Core URL configuration for SmartFarm API.

This module contains the main URL patterns for the project.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView

# Import API URLs
from .api import urlpatterns as api_urlpatterns

# Admin site configuration
admin.site.site_header = 'SmartFarm API Admin'
admin.site.site_title = 'SmartFarm API Administration'
admin.site.index_title = 'Welcome to SmartFarm API Administration'

# URL patterns
urlpatterns = [
    # Admin interface
    path('admin/', admin.site.urls),
    
    # API endpoints
    path('api/', include(api_urlpatterns)),
    
    # Health check endpoint (enable when django-health-check is installed)
    # path('health/', include('health_check.urls')),
    
    # Frontend catch-all (served only if template exists; frontend dev uses Vite)
    # path('', TemplateView.as_view(template_name='index.html'), name='home'),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    
    # Debug toolbar
    import debug_toolbar
    urlpatterns = [
        path('__debug__/', include(debug_toolbar.urls)),
    ] + urlpatterns
