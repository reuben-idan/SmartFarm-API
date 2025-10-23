import time
import logging
from django.utils.deprecation import MiddlewareMixin
from django.http import JsonResponse
from rest_framework import status

logger = logging.getLogger(__name__)


class APIResponseMiddleware(MiddlewareMixin):
    """
    Middleware to ensure consistent API responses and add performance metrics
    """
    
    def process_request(self, request):
        request.start_time = time.time()
        return None
    
    def process_response(self, request, response):
        # Add CORS headers for frontend integration
        if hasattr(request, 'start_time'):
            duration = time.time() - request.start_time
            response['X-Response-Time'] = f"{duration:.3f}s"
        
        # Add API version header
        response['X-API-Version'] = '1.0.0'
        
        return response


class LoadingStateMiddleware(MiddlewareMixin):
    """
    Middleware to handle loading states for frontend
    """
    
    def process_request(self, request):
        # Add loading indicator for long-running requests
        if request.path.startswith('/api/'):
            request.META['HTTP_X_LOADING'] = 'true'
        return None


class ValidationMiddleware(MiddlewareMixin):
    """
    Enhanced validation middleware for better error feedback
    """
    
    def process_exception(self, request, exception):
        if request.path.startswith('/api/'):
            logger.error(f"API Exception: {exception} for {request.path}")
            
            # Handle common validation errors
            if isinstance(exception, ValueError):
                return JsonResponse({
                    'success': False,
                    'message': 'Invalid data provided',
                    'error': {
                        'code': status.HTTP_400_BAD_REQUEST,
                        'message': str(exception),
                        'details': {}
                    },
                    'data': None
                }, status=status.HTTP_400_BAD_REQUEST)
        
        return None