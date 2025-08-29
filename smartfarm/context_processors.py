""
Context processors for the SmartFarm project.
"""
from django.conf import settings

def site_info(request):
    """
    Add site information to the template context.
    """
    return {
        'site_name': getattr(settings, 'SITE_NAME', 'SmartFarm'),
        'site_logo_url': getattr(settings, 'SITE_LOGO_URL', ''),
        'frontend_url': getattr(settings, 'FRONTEND_URL', 'http://localhost:3000'),
    }
