from rest_framework import serializers
from .models import Crop


class CropSerializer(serializers.ModelSerializer):
    class Meta:
        model = Crop
        fields = ['id', 'name', 'season', 'soil_type', 'regions', 'recommended_inputs', 'maturity_days', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']