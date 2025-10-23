from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from django.http import Http404
from django.core.exceptions import ValidationError
import logging

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Custom exception handler for consistent API error responses
    """
    response = exception_handler(exc, context)
    
    if response is not None:
        custom_response_data = {
            'success': False,
            'error': {
                'code': response.status_code,
                'message': 'An error occurred',
                'details': {}
            },
            'data': None
        }
        
        if hasattr(exc, 'detail'):
            if isinstance(exc.detail, dict):
                custom_response_data['error']['details'] = exc.detail
                # Get first error message as main message
                first_field = next(iter(exc.detail))
                first_error = exc.detail[first_field]
                if isinstance(first_error, list) and first_error:
                    custom_response_data['error']['message'] = str(first_error[0])
                else:
                    custom_response_data['error']['message'] = str(first_error)
            else:
                custom_response_data['error']['message'] = str(exc.detail)
        
        # Log error for debugging
        logger.error(f"API Error: {exc} - Context: {context}")
        
        response.data = custom_response_data
    
    return response


class APIResponse:
    """
    Standardized API response wrapper for consistent frontend integration
    """
    
    @staticmethod
    def success(data=None, message="Success", status_code=status.HTTP_200_OK):
        return Response({
            'success': True,
            'message': message,
            'data': data,
            'error': None
        }, status=status_code)
    
    @staticmethod
    def error(message="An error occurred", details=None, status_code=status.HTTP_400_BAD_REQUEST):
        return Response({
            'success': False,
            'message': message,
            'data': None,
            'error': {
                'code': status_code,
                'message': message,
                'details': details or {}
            }
        }, status=status_code)
    
    @staticmethod
    def paginated_success(data, count, next_url=None, previous_url=None, message="Success"):
        return Response({
            'success': True,
            'message': message,
            'data': {
                'results': data,
                'count': count,
                'next': next_url,
                'previous': previous_url
            },
            'error': None
        })