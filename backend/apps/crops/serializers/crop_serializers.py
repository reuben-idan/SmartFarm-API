from rest_framework import serializers
from ..models import Crop
from apps.api.base_serializers import BaseModelSerializer

class CropSerializer(BaseModelSerializer):
    """Serializer for the Crop model."""
    
    class Meta(BaseModelSerializer.Meta):
        model = Crop
        fields = [
            'id', 'name', 'season', 'soil_type', 'regions', 
            'recommended_inputs', 'maturity_days', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

class CropCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating Crop instances."""
    class Meta:
        model = Crop
        fields = [
            'name', 'season', 'soil_type', 'regions', 
            'recommended_inputs', 'maturity_days'
        ]
        
    def validate_regions(self, value):
        """Ensure regions is a list of non-empty strings."""
        if not isinstance(value, list):
            raise serializers.ValidationError("Regions must be a list.")
        return [str(region).strip() for region in value if str(region).strip()]
    
    def validate_recommended_inputs(self, value):
        """Ensure recommended_inputs is a dictionary."""
        if not isinstance(value, dict):
            raise serializers.ValidationError("Recommended inputs must be a JSON object.")
        return value
