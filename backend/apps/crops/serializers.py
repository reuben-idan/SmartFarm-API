from rest_framework import serializers
from .models import Crop, Season

class CropSerializer(serializers.ModelSerializer):
    """Serializer for the Crop model."""
    
    class Meta:
        model = Crop
        fields = [
            'id',
            'name',
            'season',
            'soil_type',
            'regions',
            'recommended_inputs',
            'maturity_days',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ('id', 'created_at', 'updated_at')
    
    def validate_season(self, value):
        """Validate that the season is one of the allowed choices."""
        return value.lower()
    
    def validate_regions(self, value):
        """Validate that regions is a list of non-empty strings."""
        if not isinstance(value, list):
            raise serializers.ValidationError("Regions must be a list.")
        return [r.strip() for r in value if r and r.strip()]
    
    def validate_recommended_inputs(self, value):
        """Validate that recommended_inputs is a dictionary."""
        if not isinstance(value, dict):
            raise serializers.ValidationError("Recommended inputs must be a JSON object.")
        return value


class CropListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing crops (for better performance)."""
    
    class Meta:
        model = Crop
        fields = ['id', 'name', 'season', 'regions', 'maturity_days']
        read_only_fields = fields
