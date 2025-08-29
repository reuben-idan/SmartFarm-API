import logging
from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.models import Group
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.utils.translation import gettext_lazy as _
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken

from .models import UserProfile

User = get_user_model()
logger = logging.getLogger(__name__)

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for user data including profile information.
    """
    role = serializers.SerializerMethodField()
    profile = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name', 
            'phone', 'role', 'is_active', 'is_verified', 'date_joined',
            'last_login', 'profile'
        )
        read_only_fields = ('id', 'is_active', 'is_verified', 'date_joined', 'last_login')
    
    def get_role(self, obj):
        """Get the user's role from their groups."""
        if obj.is_superuser:
            return 'admin'
        return obj.groups.first().name if obj.groups.exists() else None
    
    def get_profile(self, obj):
        """Get the user's profile data."""
        try:
            profile = obj.profile
            return {
                'bio': profile.bio,
                'gender': profile.get_gender_display(),
                'date_of_birth': profile.date_of_birth,
                'address': profile.address,
                'city': profile.city,
                'state': profile.state,
                'country': profile.country,
                'postal_code': profile.postal_code,
                'profile_picture': self.context.get('request').build_absolute_uri(profile.profile_picture.url) if profile.profile_picture else None,
                'website': profile.website,
                'twitter': profile.twitter,
                'facebook': profile.facebook,
                'linkedin': profile.linkedin
            }
        except UserProfile.DoesNotExist:
            return None


class UserRegisterSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration with role assignment and profile creation.
    """
    password = serializers.CharField(
        write_only=True, 
        required=True, 
        style={'input_type': 'password'},
        validators=[validate_password]
    )
    password2 = serializers.CharField(
        write_only=True, 
        required=True, 
        style={'input_type': 'password'}
    )
    role = serializers.ChoiceField(
        choices=[
            ('farmer', 'Farmer'),
            ('agronomist', 'Agronomist'),
            ('supplier', 'Supplier'),
            ('extension_officer', 'Extension Officer'),
        ],
        required=True,
        write_only=True
    )

    class Meta:
        model = User
        fields = (
            'username', 'email', 'password', 'password2', 
            'first_name', 'last_name', 'phone', 'role'
        )
        extra_kwargs = {
            'first_name': {'required': True, 'allow_blank': False},
            'last_name': {'required': True, 'allow_blank': False},
            'email': {'required': True, 'allow_blank': False},
            'phone': {'required': False, 'allow_blank': True, 'allow_null': True},
        }

    def validate(self, attrs):
        """Validate that the two password fields match."""
        if attrs['password'] != attrs.pop('password2'):
            raise serializers.ValidationError({"password": _("Password fields didn't match.")})
        
        # Validate password against password validators
        try:
            validate_password(attrs['password'], self.instance)
        except DjangoValidationError as e:
            raise serializers.ValidationError({'password': list(e.messages)})
            
        return attrs

    def create(self, validated_data):
        role = validated_data.pop('role')
        password = validated_data.pop('password')
        
        # Create user
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            phone=validated_data.get('phone'),
            password=password,
            is_active=False  # User needs to verify email first
        )
        
        # Assign role to user
        try:
            group = Group.objects.get(name=role)
            user.groups.add(group)
        except Group.DoesNotExist:
            logger.warning(f'Group {role} does not exist. Creating it now.')
            group = Group.objects.create(name=role)
            user.groups.add(group)
        
        # Create user profile
        UserProfile.objects.create(user=user)
        
        # Send verification email (implement this in signals or view)
        # send_verification_email(user)
        
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for user profile information.
    """
    email = serializers.EmailField(source='user.email', read_only=True)
    first_name = serializers.CharField(source='user.first_name')
    last_name = serializers.CharField(source='user.last_name')
    phone = serializers.CharField(source='user.phone', required=False, allow_blank=True, allow_null=True)
    
    class Meta:
        model = UserProfile
        fields = [
            'email', 'first_name', 'last_name', 'phone',
            'bio', 'gender', 'date_of_birth', 'address',
            'city', 'state', 'country', 'postal_code',
            'profile_picture', 'website', 'twitter',
            'facebook', 'linkedin', 'receive_newsletter',
            'email_notifications'
        ]
        extra_kwargs = {
            'profile_picture': {'required': False, 'allow_null': True},
            'bio': {'required': False, 'allow_blank': True},
            'website': {'required': False, 'allow_blank': True},
            'twitter': {'required': False, 'allow_blank': True},
            'facebook': {'required': False, 'allow_blank': True},
            'linkedin': {'required': False, 'allow_blank': True},
        }
    
    def update(self, instance, validated_data):
        # Update user fields
        user_data = validated_data.pop('user', {})
        user = instance.user
        
        for attr, value in user_data.items():
            setattr(user, attr, value)
        user.save()
        
        # Update profile fields
        return super().update(instance, validated_data)


class ChangePasswordSerializer(serializers.Serializer):
    """
    Serializer for password change endpoint.
    """
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(
        required=True, 
        write_only=True,
        validators=[validate_password]
    )
    new_password2 = serializers.CharField(required=True, write_only=True)

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError(_("Your old password was entered incorrectly."))
        return value

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password2']:
            raise serializers.ValidationError({"new_password2": _("The two password fields didn't match.")})
        return attrs

    def save(self, **kwargs):
        password = self.validated_data['new_password']
        user = self.context['request'].user
        user.set_password(password)
        user.save()
        return user


class PasswordResetRequestSerializer(serializers.Serializer):
    """
    Serializer for requesting a password reset.
    """
    email = serializers.EmailField(required=True)
    
    def validate_email(self, value):
        try:
            User.objects.get(email=value)
        except User.DoesNotExist:
            logger.warning(f'Password reset requested for non-existent email: {value}')
            # Don't reveal that the user doesn't exist for security reasons
            return value
        return value


class PasswordResetConfirmSerializer(serializers.Serializer):
    """
    Serializer for confirming a password reset.
    """
    token = serializers.CharField(required=True)
    uid = serializers.CharField(required=True)
    new_password = serializers.CharField(
        required=True, 
        write_only=True,
        validators=[validate_password]
    )
    new_password2 = serializers.CharField(required=True, write_only=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password2']:
            raise serializers.ValidationError({"new_password2": _("The two password fields didn't match.")})
        return attrs


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom token serializer that includes additional user information.
    """
    def validate(self, attrs):
        # Authenticate user
        user = authenticate(
            request=self.context.get('request'),
            username=attrs.get(self.username_field),
            password=attrs.get('password')
        )
        
        if not user:
            raise serializers.ValidationError({
                'non_field_errors': [
                    _('Unable to log in with provided credentials.')
                ]
            }, code='authorization')
        
        if not user.is_active:
            raise serializers.ValidationError({
                'non_field_errors': [
                    _('This account is not active. Please verify your email first.')
                ]
            }, code='inactive_account')
        
        # Generate tokens
        refresh = self.get_token(user)
        
        # Update last login
        user.save(update_fields=['last_login'])
        
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user, context={'request': self.context.get('request')}).data
        }
