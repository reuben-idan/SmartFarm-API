from rest_framework import serializers
from .models import MarketPrice


class MarketPriceSerializer(serializers.ModelSerializer):
    crop_name = serializers.CharField(source='crop.name', read_only=True)

    class Meta:
        model = MarketPrice
        fields = ['id', 'crop', 'crop_name', 'region', 'price', 'date', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
