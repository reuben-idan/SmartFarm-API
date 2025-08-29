"""
API module for SmartFarm application.

This module provides base classes and utilities for building RESTful APIs.
"""

# Import base classes to make them easily importable
from .base_views import BaseModelViewSet
from .base_serializers import BaseModelSerializer

__all__ = [
    'BaseModelViewSet',
    'BaseModelSerializer',
]
