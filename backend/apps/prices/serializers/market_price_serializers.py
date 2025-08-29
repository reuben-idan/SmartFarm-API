from rest_framework import serializers
from ..models import MarketPrice
from apps.crops.models import Crop
from apps.api.base_serializers import BaseModelSerializer

class MarketPriceSerializer(BaseModelSerializer):
    """Serializer for the MarketPrice model."""
    crop_name = serializers.CharField(source='crop.name', read_only=True)
    
    class Meta(BaseModelSerializer.Meta):
        model = MarketPrice
        fields = [
            'id', 'crop', 'crop_name', 'region', 'price', 'date',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

class MarketPriceCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating MarketPrice instances."""
    class Meta:
        model = MarketPrice
        fields = ['crop', 'region', 'price', 'date']
        
    def validate(self, data):
        """
        Validate the market price data.
        """
        # Ensure the crop exists
        if not data.get('crop'):
            raise serializers.ValidationError({"crop": "This field is required."})
            
        # Ensure price is positive
        if 'price' in data and data['price'] <= 0:
            raise serializers.ValidationError({"price": "Price must be greater than zero."})
            
        return data

class MarketPriceTrendSerializer(serializers.Serializer):
    """Serializer for market price trends."""
    date = serializers.DateField()
    average_price = serializers.DecimalField(max_digits=10, decimal_places=2)
    min_price = serializers.DecimalField(max_digits=10, decimal_places=2)
    max_price = serializers.DecimalField(max_digits=10, decimal_places=2)
    count = serializers.IntegerField()
