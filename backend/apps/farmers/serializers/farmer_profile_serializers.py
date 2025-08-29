from rest_framework import serializers
from ..models import FarmerProfile
from apps.users.serializers.user_serializers import UserSerializer
from apps.api.base_serializers import BaseModelSerializer

class FarmerProfileSerializer(BaseModelSerializer):
    """Serializer for the FarmerProfile model."""
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        source='user',
        queryset=UserSerializer.Meta.model.objects.all(),
        write_only=True
    )
    
    class Meta(BaseModelSerializer.Meta):
        model = FarmerProfile
        fields = [
            'id', 'user', 'user_id', 'region', 'district', 'phone', 
            'farm_size_ha', 'crops_grown', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

class FarmerProfileCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating FarmerProfile instances."""
    class Meta:
        model = FarmerProfile
        fields = [
            'user', 'region', 'district', 'phone', 
            'farm_size_ha', 'crops_grown'
        ]
        
    def validate_crops_grown(self, value):
        """Ensure crops_grown is a list of strings."""
        if not isinstance(value, list):
            raise serializers.ValidationError("crops_grown must be a list.")
        return [str(crop).strip() for crop in value if str(crop).strip()]
