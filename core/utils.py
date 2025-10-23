from typing import Dict, Any, Optional
from django.core.paginator import Paginator
from django.db.models import QuerySet
from rest_framework import status
from decimal import Decimal
import json


class APIUtils:
    """
    Utility functions for consistent API behavior and frontend integration
    """
    
    @staticmethod
    def paginate_queryset(queryset: QuerySet, page_number: int = 1, page_size: int = 10) -> Dict[str, Any]:
        """
        Paginate a queryset with consistent response format
        """
        paginator = Paginator(queryset, page_size)
        page = paginator.get_page(page_number)
        
        return {
            'results': list(page.object_list.values()),
            'pagination': {
                'current_page': page.number,
                'total_pages': paginator.num_pages,
                'total_items': paginator.count,
                'page_size': page_size,
                'has_next': page.has_next(),
                'has_previous': page.has_previous(),
                'next_page': page.next_page_number() if page.has_next() else None,
                'previous_page': page.previous_page_number() if page.has_previous() else None
            }
        }
    
    @staticmethod
    def validate_required_params(data: Dict[str, Any], required_fields: list) -> Optional[Dict[str, Any]]:
        """
        Validate required parameters and return error details if missing
        """
        missing_fields = []
        for field in required_fields:
            if field not in data or data[field] is None or data[field] == '':
                missing_fields.append(field)
        
        if missing_fields:
            return {
                'message': 'Missing required parameters',
                'details': {field: ['This field is required.'] for field in missing_fields}
            }
        
        return None
    
    @staticmethod
    def sanitize_decimal(value: Any) -> Optional[Decimal]:
        """
        Safely convert value to Decimal for financial calculations
        """
        if value is None:
            return None
        
        try:
            return Decimal(str(value))
        except (ValueError, TypeError):
            return None
    
    @staticmethod
    def format_response_data(data: Any) -> Any:
        """
        Format data for JSON serialization, handling Decimal and other types
        """
        if isinstance(data, Decimal):
            return float(data)
        elif isinstance(data, dict):
            return {key: APIUtils.format_response_data(value) for key, value in data.items()}
        elif isinstance(data, list):
            return [APIUtils.format_response_data(item) for item in data]
        else:
            return data
    
    @staticmethod
    def get_client_ip(request) -> str:
        """
        Get client IP address from request
        """
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
    
    @staticmethod
    def build_filter_params(query_params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Build Django ORM filter parameters from query parameters
        """
        filters = {}
        
        # Common filter mappings
        filter_mappings = {
            'search': 'name__icontains',
            'region': 'region__iexact',
            'crop_name': 'crop__name__iexact',
            'season': 'season',
            'soil_type': 'soil_type__iexact'
        }
        
        for param, orm_filter in filter_mappings.items():
            if param in query_params and query_params[param]:
                filters[orm_filter] = query_params[param]
        
        return filters


class FrontendIntegration:
    """
    Utilities specifically for frontend integration
    """
    
    @staticmethod
    def get_loading_states() -> Dict[str, str]:
        """
        Standard loading state messages for frontend
        """
        return {
            'loading': 'Loading...',
            'saving': 'Saving...',
            'deleting': 'Deleting...',
            'processing': 'Processing...',
            'generating': 'Generating forecast...',
            'authenticating': 'Authenticating...'
        }
    
    @staticmethod
    def get_error_messages() -> Dict[str, str]:
        """
        Standard error messages for frontend display
        """
        return {
            'network_error': 'Network error. Please check your connection.',
            'server_error': 'Server error. Please try again later.',
            'validation_error': 'Please check your input and try again.',
            'auth_error': 'Authentication failed. Please log in again.',
            'permission_error': 'You do not have permission to perform this action.',
            'not_found': 'The requested resource was not found.',
            'timeout': 'Request timed out. Please try again.'
        }
    
    @staticmethod
    def get_success_messages() -> Dict[str, str]:
        """
        Standard success messages for frontend display
        """
        return {
            'save_success': 'Changes saved successfully!',
            'delete_success': 'Item deleted successfully!',
            'create_success': 'Item created successfully!',
            'login_success': 'Welcome back!',
            'logout_success': 'You have been logged out.',
            'register_success': 'Account created successfully!',
            'update_success': 'Profile updated successfully!'
        }
    
    @staticmethod
    def format_validation_errors(errors: Dict[str, Any]) -> Dict[str, str]:
        """
        Format DRF validation errors for frontend consumption
        """
        formatted_errors = {}
        
        for field, error_list in errors.items():
            if isinstance(error_list, list) and error_list:
                formatted_errors[field] = error_list[0]
            else:
                formatted_errors[field] = str(error_list)
        
        return formatted_errors