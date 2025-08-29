from rest_framework import serializers
from ..models import YieldForecast, YieldMethod, Season
from apps.crops.serializers.crop_serializers import CropSerializer
from apps.api.base_serializers import BaseModelSerializer

class YieldForecastSerializer(BaseModelSerializer):
    """Serializer for the YieldForecast model."""
    crop = CropSerializer(read_only=True)
    crop_id = serializers.PrimaryKeyRelatedField(
        source='crop',
        queryset=YieldForecast._meta.get_field('crop').related_model.objects.all(),
        write_only=True,
        required=False,
        allow_null=True
    )
    season_display = serializers.CharField(source='get_season_display', read_only=True)
    method_display = serializers.CharField(source='get_method_display', read_only=True)
    
    class Meta(BaseModelSerializer.Meta):
        model = YieldForecast
        fields = [
            'id', 'crop', 'crop_id', 'crop_name', 'region', 'season', 'season_display',
            'hectares', 'forecast_yield', 'yield_per_ha', 'factors', 'method', 'method_display',
            'created_at'
        ]
        read_only_fields = ['created_at', 'yield_per_ha']

    def validate(self, data):
        """
        Validate the yield forecast data.
        """
        # Ensure either crop or crop_name is provided
        if not data.get('crop') and not data.get('crop_name'):
            raise serializers.ValidationError({
                'crop': 'Either crop or crop_name must be provided.'
            })
            
        # Set crop_name from crop if not provided
        if not data.get('crop_name') and data.get('crop'):
            data['crop_name'] = data['crop'].name
            
        # Ensure hectares is positive
        if 'hectares' in data and data['hectares'] <= 0:
            raise serializers.ValidationError({
                'hectares': 'Hectares must be greater than zero.'
            })
            
        # Ensure forecast_yield is non-negative
        if 'forecast_yield' in data and data['forecast_yield'] < 0:
            raise serializers.ValidationError({
                'forecast_yield': 'Forecast yield cannot be negative.'
            })
            
        # Validate season
        if 'season' in data and data['season'] not in dict(Season.choices):
            raise serializers.ValidationError({
                'season': f'Invalid season. Must be one of: {dict(Season.choices)}'
            })
            
        # Validate method
        if 'method' in data and data['method'] not in dict(YieldMethod.choices):
            raise serializers.ValidationError({
                'method': f'Invalid method. Must be one of: {dict(YieldMethod.choices)}'
            })
            
        return data

class YieldForecastCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating YieldForecast instances."""
    class Meta:
        model = YieldForecast
        fields = [
            'crop', 'crop_name', 'region', 'season', 'hectares', 
            'forecast_yield', 'factors', 'method'
        ]
        
    def validate_factors(self, value):
        """Ensure factors is a dictionary."""
        if not isinstance(value, dict):
            raise serializers.ValidationError("Factors must be a JSON object.")
        return value

class YieldStatsSerializer(serializers.Serializer):
    """Serializer for yield statistics."""
    region = serializers.CharField()
    season = serializers.CharField()
    crop_name = serializers.CharField()
    total_hectares = serializers.DecimalField(max_digits=14, decimal_places=2)
    total_yield = serializers.DecimalField(max_digits=14, decimal_places=2)
    average_yield_per_ha = serializers.DecimalField(max_digits=14, decimal_places=2)
    forecast_count = serializers.IntegerField()
