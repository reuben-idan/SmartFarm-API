"""
Core middleware for the SmartFarm application.
"""
import logging
import time
from django.utils.deprecation import MiddlewareMixin

logger = logging.getLogger(__name__)

class RequestLoggingMiddleware(MiddlewareMixin):
    """
    Middleware for logging HTTP requests and responses.
    """
    def process_request(self, request):
        """
        Store the start time when a request comes in.
        """
        request.start_time = time.time()
        return None

    def process_response(self, request, response):
        """
        Log the request and response details.
        """
        # Calculate request processing time
        total_time = time.time() - getattr(request, 'start_time', time.time())
        
        # Prepare log data
        log_data = {
            'method': request.method,
            'path': request.get_full_path(),
            'status_code': response.status_code,
            'response_time': f"{total_time:.2f}s",
            'user': getattr(request.user, 'email', 'anonymous'),
            'remote_addr': request.META.get('REMOTE_ADDR'),
            'user_agent': request.META.get('HTTP_USER_AGENT', ''),
            'query_params': dict(request.GET),
        }

        # Log the request
        logger.info(
            "%(method)s %(path)s %(status_code)s in %(response_time)s",
            {
                'method': log_data['method'],
                'path': log_data['path'],
                'status_code': log_data['status_code'],
                'response_time': log_data['response_time'],
            }
        )

        # Log detailed info for debugging
        if response.status_code >= 400:
            logger.debug("Request details: %s", log_data)

        return response

    def process_exception(self, request, exception):
        """
        Log any unhandled exceptions.
        """
        logger.exception(
            "Unhandled exception in request: %s %s",
            request.method,
            request.get_full_path(),
            exc_info=exception
        )
        return None
