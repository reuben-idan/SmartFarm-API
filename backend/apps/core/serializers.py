""
Core serializers for the SmartFarm API.
"""
from rest_framework import serializers
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

from .models import BaseModel, TimeStampedModel, SoftDeleteModel


class BaseModelSerializer(serializers.ModelSerializer):
    """
    Base serializer for all models that inherit from BaseModel.
    """
    id = serializers.UUIDField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
    is_deleted = serializers.BooleanField(read_only=True)
    deleted_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model = None
        fields = [
            'id',
            'created_at',
            'updated_at',
            'is_deleted',
            'deleted_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'is_deleted', 'deleted_at']

    def create(self, validated_data):
        """
        Create a new instance with the validated data.
        """
        # Add the current user as the creator if the model has a 'created_by' field
        request = self.context.get('request')
        if request and hasattr(self.Meta.model, 'created_by'):
            validated_data['created_by'] = request.user
            
        return super().create(validated_data)

    def update(self, instance, validated_data):
        """
        Update an existing instance with the validated data.
        """
        # Add the current user as the updater if the model has an 'updated_by' field
        request = self.context.get('request')
        if request and hasattr(instance, 'updated_by'):
            validated_data['updated_by'] = request_user
            
        return super().update(instance, validated_data)


class TimeStampedModelSerializer(serializers.ModelSerializer):
    """
    Serializer for models that inherit from TimeStampedModel.
    """
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model = TimeStampedModel
        fields = ['created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class SoftDeleteModelSerializer(serializers.ModelSerializer):
    """
    Serializer for models that inherit from SoftDeleteModel.
    """
    is_deleted = serializers.BooleanField(read_only=True)
    deleted_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model = SoftDeleteModel
        fields = ['is_deleted', 'deleted_at']
        read_only_fields = ['is_deleted', 'deleted_at']


def get_serializer(model_class, fields='__all__', read_only_fields=None, **kwargs):
    """
    Dynamically create a serializer for the given model class.
    
    Args:
        model_class: The model class to create a serializer for
        fields: The fields to include in the serializer
        read_only_fields: Fields that should be read-only
        **kwargs: Additional attributes to set on the Meta class
        
    Returns:
        A serializer class for the given model
    """
    if read_only_fields is None:
        read_only_fields = []
    
    # Determine the base serializer class
    if issubclass(model_class, BaseModel):
        base_serializer = BaseModelSerializer
    elif issubclass(model_class, TimeStampedModel):
        base_serializer = TimeStampedModelSerializer
    elif issubclass(model_class, SoftDeleteModel):
        base_serializer = SoftDeleteModelSerializer
    else:
        base_serializer = serializers.ModelSerializer
    
    # Create the Meta class
    meta_attrs = {
        'model': model_class,
        'fields': fields,
        'read_only_fields': read_only_fields,
        **kwargs
    }
    
    # Create the serializer class
    serializer_class = type(
        f'{model_class.__name__}Serializer',
        (base_serializer,),
        {'Meta': type('Meta', (), meta_attrs)}
    )
    
    return serializer_class
