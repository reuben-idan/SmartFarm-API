"""
Signal handlers for the core app.

This module contains signal handlers for the core app that handle common
signals like pre_save, post_save, pre_delete, and post_delete.
"""
import logging

from django.db.models.signals import pre_save, post_save, pre_delete, post_delete
from django.dispatch import receiver
from django.utils import timezone

from .models import BaseModel

logger = logging.getLogger(__name__)

@receiver(pre_save)
def update_timestamps(sender, instance, **kwargs):
    """
    Update created_at and updated_at timestamps on save.
    """
    if not isinstance(instance, BaseModel):
        return
        
    now = timezone.now()
    
    # Set created_at on first save
    if not instance.pk:
        if hasattr(instance, 'created_at') and not instance.created_at:
            instance.created_at = now
    
    # Always update updated_at
    if hasattr(instance, 'updated_at'):
        instance.updated_at = now

@receiver(post_save)
def log_creation(sender, instance, created, **kwargs):
    """
    Log when a model instance is created or updated.
    """
    if not isinstance(instance, BaseModel):
        return
        
    action = 'created' if created else 'updated'
    logger.info(
        '%s %s %s', 
        instance._meta.verbose_name.title(), 
        str(instance), 
        action
    )

@receiver(pre_delete)
def log_deletion(sender, instance, **kwargs):
    """
    Log when a model instance is about to be deleted.
    """
    if not isinstance(instance, BaseModel):
        return
        
    logger.info(
        '%s %s is being deleted', 
        instance._meta.verbose_name.title(), 
        str(instance)
    )

@receiver(post_delete)
def cleanup_related(sender, instance, **kwargs):
    """
    Clean up related objects after deletion.
    """
    if not hasattr(instance, 'cleanup_related'):
        return
        
    try:
        instance.cleanup_related()
    except Exception as e:
        logger.error(
            'Error cleaning up related objects for %s %s: %s',
            instance._meta.verbose_name,
            instance.pk,
            str(e),
            exc_info=True
        )
