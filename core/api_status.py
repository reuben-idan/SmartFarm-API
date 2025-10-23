from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from django.urls import reverse
from django.conf import settings
from core.exceptions import APIResponse
from crops.models import Crop
from prices.models import MarketPrice
from users.models import User
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)


class APIStatusView(APIView):
    """
    Comprehensive API status and information endpoint for frontend integration
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        try:
            # Get basic statistics
            stats = self._get_statistics()
            
            # Get endpoint information
            endpoints = self._get_endpoints_info()
            
            # Get configuration info
            config = self._get_configuration_info()
            
            status_data = {
                'api_info': {
                    'name': 'SmartFarm API',
                    'version': '1.0.0',
                    'description': 'A modern, scalable RESTful API for agricultural management systems',
                    'timestamp': timezone.now().isoformat(),
                    'environment': 'development' if settings.DEBUG else 'production'
                },
                'statistics': stats,
                'endpoints': endpoints,
                'configuration': config,
                'features': {
                    'authentication': 'JWT',
                    'pagination': 'Page-based',
                    'caching': 'Enabled',
                    'rate_limiting': 'Disabled',
                    'api_versioning': 'URL-based'
                }
            }
            
            return APIResponse.success(
                data=status_data,
                message="API status retrieved successfully"
            )
            
        except Exception as e:
            logger.error(f"Error retrieving API status: {e}")
            return APIResponse.error(
                message="Error retrieving API status",
                status_code=500
            )
    
    def _get_statistics(self):
        """Get basic database statistics"""
        try:
            return {
                'total_users': User.objects.count(),
                'total_crops': Crop.objects.count(),
                'total_market_prices': MarketPrice.objects.count(),
                'active_regions': list(Crop.objects.values_list('regions', flat=True).distinct()),
                'available_seasons': [choice[0] for choice in Crop.Season.choices]
            }
        except Exception as e:
            logger.warning(f"Error getting statistics: {e}")
            return {}
    
    def _get_endpoints_info(self):
        """Get information about available endpoints"""
        return {
            'authentication': {
                'register': '/api/auth/register/',
                'login': '/api/auth/login/',
                'refresh_token': '/api/auth/token/refresh/',
                'profile': '/api/auth/me/',
                'check_auth': '/api/auth/check-auth/'
            },
            'crops': {
                'list': '/api/crops/',
                'detail': '/api/crops/{id}/',
                'recommendations': '/api/recommendations/'
            },
            'market_data': {
                'prices': '/api/prices/',
                'price_analytics': '/api/prices/analytics/'
            },
            'forecasting': {
                'yield_forecast': '/api/yield/forecast/'
            },
            'support': {
                'tickets': '/api/support/',
                'ticket_detail': '/api/support/{id}/'
            },
            'system': {
                'health': '/api/health/',
                'status': '/api/status/',
                'docs': '/api/docs/',
                'schema': '/api/schema/'
            }
        }
    
    def _get_configuration_info(self):
        """Get API configuration information"""
        return {
            'pagination': {
                'default_page_size': getattr(settings, 'REST_FRAMEWORK', {}).get('PAGE_SIZE', 10),
                'max_page_size': 100
            },
            'authentication': {
                'access_token_lifetime_minutes': getattr(settings, 'SIMPLE_JWT', {}).get('ACCESS_TOKEN_LIFETIME', {}).total_seconds() / 60 if hasattr(getattr(settings, 'SIMPLE_JWT', {}).get('ACCESS_TOKEN_LIFETIME', {}), 'total_seconds') else 5,
                'refresh_token_lifetime_days': getattr(settings, 'SIMPLE_JWT', {}).get('REFRESH_TOKEN_LIFETIME', {}).days if hasattr(getattr(settings, 'SIMPLE_JWT', {}).get('REFRESH_TOKEN_LIFETIME', {}), 'days') else 1
            },
            'cors': {
                'allow_all_origins': getattr(settings, 'CORS_ALLOW_ALL_ORIGINS', False),
                'allow_credentials': getattr(settings, 'CORS_ALLOW_CREDENTIALS', False)
            },
            'yield_forecast': {
                'supported_crops': list(getattr(settings, 'YIELD_BASE_YIELDS', {}).keys()),
                'supported_regions': list(getattr(settings, 'YIELD_REGION_MULTIPLIERS', {}).keys()),
                'supported_seasons': list(getattr(settings, 'YIELD_SEASON_FACTORS', {}).keys())
            }
        }