from decimal import Decimal, InvalidOperation
from rest_framework import serializers
from django.conf import settings

from apps.crops.models import Crop, Season


class YieldForecastQuerySerializer(serializers.Serializer):
    crop = serializers.CharField(help_text="Crop id or name")
    region = serializers.CharField()
    season = serializers.ChoiceField(choices=Season.choices)
    hectares = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=Decimal("0.01"))

    def validate_crop(self, value: str):
        # Try id first
        crop_obj = None
        if value.isdigit():
            crop_obj = Crop.objects.filter(id=int(value)).first()
        if crop_obj is None:
            crop_obj = Crop.objects.filter(name__iexact=value).first()
        if crop_obj is None:
            raise serializers.ValidationError("Crop not found by id or name")
        return crop_obj

    def validate_region(self, value: str):
        if not value.strip():
            raise serializers.ValidationError("Region cannot be empty")
        key = value.lower()
        if key not in getattr(settings, 'YIELD_REGION_MULTIPLIERS', {}):
            raise serializers.ValidationError("Region not supported for mock forecast")
        return value

    def validate(self, attrs):
        # Ensure base yield exists for crop name
        crop: Crop = attrs['crop']
        base_map = getattr(settings, 'YIELD_BASE_YIELDS', {})
        if crop.name.lower() not in base_map:
            raise serializers.ValidationError({
                'crop': 'Crop not supported for mock forecast'
            })
        return attrs


class YieldForecastResponseSerializer(serializers.Serializer):
    crop = serializers.CharField()
    region = serializers.CharField()
    season = serializers.CharField()
    hectares = serializers.DecimalField(max_digits=10, decimal_places=2)
    forecast_yield = serializers.DecimalField(max_digits=14, decimal_places=2)
    factors = serializers.JSONField()
