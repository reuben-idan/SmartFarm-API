"""
Base serializers for the SmartFarm API.

Provides common serialization logic that can be reused across the application.
"""
from rest_framework import serializers
from django.db import models

class BaseModelSerializer(serializers.ModelSerializer):
    """
    Base serializer that provides common functionality for all model serializers.
    """
    class Meta:
        model = None
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')
    
    def get_field_names(self, declared_fields, info):
        """
        Return the field names that should be used for the serializer.
        Excludes 'deleted_at' and 'is_deleted' fields by default.
        """
        fields = super().get_field_names(declared_fields, info)
        return [f for f in fields if f not in ['deleted_at', 'is_deleted']]

class DynamicFieldsModelSerializer(serializers.ModelSerializer):
    """
    A ModelSerializer that takes an additional `fields` argument that
    controls which fields should be displayed.
    """
    def __init__(self, *args, **kwargs):
        # Don't pass the 'fields' arg up to the superclass
        fields = kwargs.pop('fields', None)

        # Instantiate the superclass normally
        super().__init__(*args, **kwargs)

        if fields is not None:
            # Drop any fields that are not specified in the `fields` argument.
            allowed = set(fields)
            existing = set(self.fields.keys())
            for field_name in existing - allowed:
                self.fields.pop(field_name)

class NestedCreateMixin:
    """
    Mixin that allows for nested creation of related objects.
    """
    def create(self, validated_data):
        # Get the nested serializers
        nested_serializers = {}
        for field_name, field in self.fields.items():
            if isinstance(field, serializers.BaseSerializer) and field_name in validated_data:
                nested_serializers[field_name] = field
                validated_data.pop(field_name)
        
        # Create the main object
        instance = super().create(validated_data)
        
        # Create nested objects
        for field_name, serializer in nested_serializers.items():
            nested_data = serializer.validated_data
            if isinstance(nested_data, list):
                # Handle many-to-many relationships
                getattr(instance, field_name).set(nested_data)
            else:
                # Handle foreign key relationships
                setattr(instance, field_name, nested_data)
        
        return instance
