from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from ..models import FarmerProfile, FarmType
from apps.users.serializers.user_serializers import UserSerializer, UserListSerializer
from apps.api.base_serializers import BaseModelSerializer
from rest_framework.validators import UniqueTogetherValidator

class FarmTypeSerializer(serializers.ModelSerializer):
    """Serializer for the FarmType model."""
    class Meta:
        model = FarmType
        fields = ['id', 'name', 'description', 'is_active']
        read_only_fields = ['id']

class FarmerProfileListSerializer(BaseModelSerializer):
    """Lightweight serializer for listing farmer profiles."""
    user = UserListSerializer(read_only=True)
    farm_type = FarmTypeSerializer(read_only=True)
    
    class Meta(BaseModelSerializer.Meta):
        model = FarmerProfile
        fields = [
            'id', 'user', 'region', 'district', 'ward', 'village',
            'phone', 'farm_name', 'farm_type', 'farm_size_ha',
            'is_verified', 'is_lead_farmer', 'created_at'
        ]
        read_only_fields = fields

class FarmerProfileDetailSerializer(BaseModelSerializer):
    """Detailed serializer for individual farmer profiles."""
    user = UserSerializer(read_only=True)
    farm_type = FarmTypeSerializer(read_only=True)
    lead_farmer = serializers.SerializerMethodField()
    full_address = serializers.SerializerMethodField()
    age = serializers.SerializerMethodField()
    
    class Meta(BaseModelSerializer.Meta):
        model = FarmerProfile
        fields = [
            # Basic Info
            'id', 'user', 'gender', 'date_of_birth', 'id_number',
            
            # Contact Info
            'phone', 'alternate_phone',
            
            # Location
            'country', 'region', 'district', 'ward', 'village', 'address',
            'gps_coordinates', 'full_address',
            
            # Farm Info
            'farm_name', 'farm_type', 'farm_size_ha', 'crops_grown',
            'years_farming', 'is_lead_farmer', 'lead_farmer',
            
            # Verification
            'is_verified', 'verified_at', 'verification_notes',
            
            # Financial
            'has_bank_account', 'bank_name', 'account_number',
            
            # Metadata
            'created_at', 'updated_at', 'created_by', 'updated_by', 'age'
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'verified_at',
            'created_by', 'updated_by', 'age', 'full_address'
        ]
    
    def get_lead_farmer(self, obj):
        if not obj.lead_farmer:
            return None
        return {
            'id': obj.lead_farmer.id,
            'name': str(obj.lead_farmer.user.get_full_name() or obj.lead_farmer.user.username)
        }
    
    def get_full_address(self, obj):
        return obj.full_address
    
    def get_age(self, obj):
        return obj.age

class FarmerProfileCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating FarmerProfile instances."""
    user_id = serializers.PrimaryKeyRelatedField(
        source='user',
        queryset=UserSerializer.Meta.model.objects.all(),
        required=False
    )
    farm_type_id = serializers.PrimaryKeyRelatedField(
        source='farm_type',
        queryset=FarmType.objects.all(),
        required=False,
        allow_null=True
    )
    lead_farmer_id = serializers.PrimaryKeyRelatedField(
        source='lead_farmer',
        queryset=FarmerProfile.objects.all(),
        required=False,
        allow_null=True
    )
    
    class Meta:
        model = FarmerProfile
        fields = [
            # Basic Info
            'user_id', 'gender', 'date_of_birth', 'id_number',
            
            # Contact Info
            'phone', 'alternate_phone',
            
            # Location
            'country', 'region', 'district', 'ward', 'village', 'address',
            'gps_coordinates',
            
            # Farm Info
            'farm_name', 'farm_type_id', 'farm_size_ha', 'crops_grown',
            'years_farming', 'is_lead_farmer', 'lead_farmer_id',
            
            # Verification
            'is_verified', 'verification_notes',
            
            # Financial
            'has_bank_account', 'bank_name', 'account_number'
        ]
        validators = [
            UniqueTogetherValidator(
                queryset=FarmerProfile.objects.all(),
                fields=['user'],
                message=_('A profile already exists for this user.')
            )
        ]
    
    def validate(self, attrs):
        # Ensure lead_farmer is a lead farmer if specified
        lead_farmer = attrs.get('lead_farmer')
        if lead_farmer and not lead_farmer.is_lead_farmer:
            raise serializers.ValidationError({
                'lead_farmer': _('The specified farmer is not a lead farmer.')
            })
            
        # Ensure farm_size_ha is positive
        if 'farm_size_ha' in attrs and attrs['farm_size_ha'] <= 0:
            raise serializers.ValidationError({
                'farm_size_ha': _('Farm size must be greater than zero.')
            })
            
        return attrs
    
    def validate_crops_grown(self, value):
        """Ensure crops_grown is a list of strings and clean them."""
        if not isinstance(value, list):
            raise serializers.ValidationError(_('crops_grown must be a list.'))
            
        # Clean and validate each crop name
        cleaned_crops = []
        for crop in value:
            if not isinstance(crop, (str, int, float)):
                raise serializers.ValidationError(_(
                    'Each crop must be a string, number, or boolean.'
                ))
            crop_str = str(crop).strip()
            if crop_str:  # Only add non-empty strings
                cleaned_crops.append(crop_str)
                
        return cleaned_crops
    
    def create(self, validated_data):
        # Set created_by and updated_by from request user if available
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['created_by'] = request.user
            validated_data['updated_by'] = request.user
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        # Set updated_by from request user if available
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['updated_by'] = request.user
            
        # Handle verification timestamp
        if 'is_verified' in validated_data and validated_data['is_verified']:
            validated_data['verified_at'] = instance.verified_at or timezone.now()
            
        return super().update(instance, validated_data)
