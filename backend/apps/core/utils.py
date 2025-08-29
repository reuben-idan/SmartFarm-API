"""
Utility functions for the SmartFarm API.

This module contains various utility functions used throughout the application.
"""

import hashlib
import json
import logging
import random
import string
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Type, TypeVar, Union

import pytz
from django.conf import settings
from django.core.cache import cache
from django.core.exceptions import ValidationError
from django.core.serializers.json import DjangoJSONEncoder
from django.db import models
from django.utils import timezone

logger = logging.getLogger(__name__)

T = TypeVar('T', bound=models.Model)


def generate_random_string(length: int = 32) -> str:
    """Generate a random string of fixed length."""
    chars = string.ascii_letters + string.digits
    return ''.join(random.choice(chars) for _ in range(length))


def get_client_ip(request) -> str:
    """Get the client's IP address from the request."""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


def cache_with_timeout(key: str, timeout: int = 300) -> callable:
    ""
    Decorator to cache function results with a timeout.
    
    Args:
        key: The cache key format string (can use {args} and {kwargs} placeholders)
        timeout: Cache timeout in seconds
    """
    def decorator(func):
        def wrapper(*args, **kwargs):
            # Format the cache key with function arguments
            cache_key = key.format(
                args=args,
                kwargs=kwargs,
                **{f'arg{i}': arg for i, arg in enumerate(args)},
                **kwargs
            )
            
            # Try to get the result from cache
            result = cache.get(cache_key)
            if result is not None:
                return result
                
            # Call the function if not in cache
            result = func(*args, **kwargs)
            
            # Cache the result
            cache.set(cache_key, result, timeout)
            return result
            
        return wrapper
    return decorator


def parse_datetime(dt_str: str) -> Optional[datetime]:
    """Parse a datetime string in ISO 8601 format with timezone support."""
    if not dt_str:
        return None
        
    try:
        # Try parsing with timezone
        return datetime.fromisoformat(dt_str.replace('Z', '+00:00'))
    except (ValueError, TypeError):
        try:
            # Try parsing as a timestamp
            return datetime.fromtimestamp(float(dt_str), tz=timezone.utc)
        except (ValueError, TypeError):
            return None


def get_object_or_none(
    model: Type[T],
    use_cache: bool = False,
    cache_timeout: int = 300,
    **filters
) -> Optional[T]:
    """
    Get an object from the database or return None if it doesn't exist.
    
    Args:
        model: The model class to query
        use_cache: Whether to use cache for the query
        cache_timeout: Cache timeout in seconds
        **filters: Filters to apply to the query
        
    Returns:
        The model instance or None if not found
    """
    if not filters:
        raise ValueError("At least one filter must be provided")

    cache_key = None
    if use_cache:
        cache_key = f"{model._meta.model_name}_{'_'.join(f'{k}_{v}' for k, v in filters.items())}"
        cached = cache.get(cache_key)
        if cached is not None:
            return cached

    try:
        obj = model._default_manager.get(**filters)
        if use_cache and cache_key:
            cache.set(cache_key, obj, cache_timeout)
        return obj
    except (model.DoesNotExist, ValidationError):
        return None


def get_choices_display(choices: list, value: Any) -> str:
    """
    Get the display value for a choices field.
    
    Args:
        choices: A list of (value, display) tuples
        value: The value to find the display for
        
    Returns:
        The display value or the original value if not found
    """
    return dict(choices).get(value, value)


def format_duration(seconds: int) -> str:
    """Format a duration in seconds to a human-readable string."""
    if not isinstance(seconds, (int, float)):
        return ""
        
    minutes, seconds = divmod(int(seconds), 60)
    hours, minutes = divmod(minutes, 60)
    days, hours = divmod(hours, 24)
    
    parts = []
    if days > 0:
        parts.append(f"{days}d")
    if hours > 0 or days > 0:
        parts.append(f"{hours}h")
    if minutes > 0 or hours > 0 or days > 0:
        parts.append(f"{minutes}m")
    parts.append(f"{seconds}s")
    
    return " ".join(parts)
