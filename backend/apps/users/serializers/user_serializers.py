from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from apps.api.base_serializers import BaseModelSerializer

User = get_user_model()

class UserSerializer(BaseModelSerializer):
    """Serializer for the User model."""
    class Meta(BaseModelSerializer.Meta):
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'is_active',
            'is_staff', 'is_superuser', 'date_joined', 'last_login'
        ]
        read_only_fields = ['id', 'is_active', 'is_staff', 'is_superuser', 'date_joined', 'last_login']
        extra_kwargs = {
            'password': {'write_only': True}
        }

class UserCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a new user."""
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )
    password2 = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )

    class Meta:
        model = User
        fields = ['email', 'first_name', 'last_name', 'password', 'password2']
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True}
        }

    def validate(self, attrs):
        if attrs['password'] != attrs.pop('password2'):
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        
        try:
            validate_password(attrs['password'])
        except DjangoValidationError as e:
            raise serializers.ValidationError({'password': list(e.messages)})
            
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2', None)
        user = User.objects.create_user(**validated_data)
        return user

class UserProfileSerializer(BaseModelSerializer):
    """Serializer for the UserProfile model."""
    user = UserSerializer(read_only=True)
    
    class Meta(BaseModelSerializer.Meta):
        model = User.profile.related.related_model  # Get the UserProfile model
        fields = [
            'id', 'user', 'bio', 'gender', 'date_of_birth', 'address', 
            'city', 'state', 'country', 'postal_code', 'profile_picture',
            'website', 'twitter', 'facebook', 'linkedin', 'receive_newsletter',
            'email_notifications', 'created_at', 'updated_at'
        ]
        read_only_fields = ['user']

class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for password change endpoint."""
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

    def validate_new_password(self, value):
        validate_password(value)
        return value
