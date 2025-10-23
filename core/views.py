from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.db import connection
from django.core.cache import cache
from django.utils import timezone
from core.exceptions import APIResponse
import logging

logger = logging.getLogger(__name__)


class HealthCheckView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        try:
            # Check database connectivity
            db_status = 'ok'
            try:
                with connection.cursor() as cursor:
                    cursor.execute("SELECT 1")
            except Exception as e:
                db_status = 'error'
                logger.error(f"Database health check failed: {e}")
            
            # Check cache connectivity
            cache_status = 'ok'
            try:
                cache.set('health_check', 'test', 10)
                cache.get('health_check')
            except Exception as e:
                cache_status = 'error'
                logger.error(f"Cache health check failed: {e}")
            
            overall_status = 'ok' if db_status == 'ok' and cache_status == 'ok' else 'degraded'
            
            health_data = {
                'status': overall_status,
                'service': 'SmartFarm API',
                'version': '1.0.0',
                'timestamp': timezone.now().isoformat(),
                'checks': {
                    'database': db_status,
                    'cache': cache_status
                },
                'uptime': 'healthy'
            }
            
            return APIResponse.success(
                data=health_data,
                message="Health check completed"
            )
            
        except Exception as e:
            logger.error(f"Health check error: {e}")
            return APIResponse.error(
                message="Health check failed",
                status_code=503
            )
