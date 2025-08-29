"""
Core services for the SmartFarm API.

This module contains shared business logic and utility functions.
"""
import logging
from typing import Any, Dict, List, Optional, Type, TypeVar, Union

from django.conf import settings
from django.core.cache import cache
from django.core.exceptions import ValidationError
from django.db import models, transaction
from django.utils import timezone

logger = logging.getLogger(__name__)

ModelType = TypeVar('ModelType', bound=models.Model)


def get_object_or_none(
    model: Type[ModelType],
    use_cache: bool = False,
    cache_timeout: int = 300,
    **filters
) -> Optional[ModelType]:
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


def create_or_update(
    model: Type[ModelType],
    data: Dict[str, Any],
    filters: Dict[str, Any],
    update_fields: Optional[List[str]] = None,
    commit: bool = True,
) -> ModelType:
    """
    Get or create an object with the given filters, updating it if it exists.
    
    Args:
        model: The model class to create/update
        data: The data to create/update the object with
        filters: Filters to find an existing object
        update_fields: Fields to update if the object exists
        commit: Whether to save the object to the database
        
    Returns:
        The created or updated model instance
    """
    instance, created = model._default_manager.get_or_create(
        defaults=data,
        **filters
    )
    
    if not created and data:
        update_fields = update_fields or list(data.keys())
        for field in update_fields:
            if field in data and field != 'id':
                setattr(instance, field, data[field])
        
        if commit:
            instance.save(update_fields=update_fields)
    
    return instance


def delete_old_records(
    model: Type[ModelType],
    days_old: int = 30,
    field_name: str = 'created_at'
) -> int:
    """
    Delete records older than the specified number of days.
    
    Args:
        model: The model class to delete records from
        days_old: Delete records older than this many days
        field_name: The field to use for age comparison
        
    Returns:
        The number of deleted records
    """
    cutoff_date = timezone.now() - timezone.timedelta(days=days_old)
    query = {f"{field_name}__lt": cutoff_date}
    
    if hasattr(model, 'is_deleted'):
        query['is_deleted'] = False
    
    with transaction.atomic():
        deleted_count, _ = model._default_manager.filter(**query).delete()
        
    logger.info(
        "Deleted %d %s records older than %s",
        deleted_count,
        model._meta.verbose_name_plural,
        cutoff_date.date()
    )
    
    return deleted_count


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
