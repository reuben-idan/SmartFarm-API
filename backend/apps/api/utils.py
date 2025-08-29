""
Utility functions for the SmartFarm API.
"""
from rest_framework.response import Response
from rest_framework import status

def create_response(data=None, message=None, status_code=status.HTTP_200_OK, **kwargs):
    """
    Create a standardized API response.
    
    Args:
        data: The data to include in the response.
        message: A message to include in the response.
        status_code: The HTTP status code for the response.
        **kwargs: Additional data to include in the response.
        
    Returns:
        A Response object with the standardized format.
    """
    response_data = {
        'success': status.is_success(status_code),
        'message': message,
        'data': data,
        **kwargs
    }
    
    # Remove None values
    response_data = {k: v for k, v in response_data.items() if v is not None}
    
    return Response(response_data, status=status_code)

def error_response(message, status_code=status.HTTP_400_BAD_REQUEST, errors=None):
    """
    Create a standardized error response.
    
    Args:
        message: The error message.
        status_code: The HTTP status code for the response.
        errors: A dictionary of field errors.
        
    Returns:
        A Response object with the error details.
    """
    response_data = {
        'success': False,
        'message': message,
    }
    
    if errors is not None:
        response_data['errors'] = errors
    
    return Response(response_data, status=status_code)
