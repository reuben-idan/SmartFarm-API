from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import authenticate
from django.db import transaction
import logging

from core.exceptions import APIResponse
from .serializers import (
    UserSerializer,
    UserRegisterSerializer,
    CustomTokenObtainPairSerializer
)
from .models import User

logger = logging.getLogger(__name__)


class UserRegisterView(generics.CreateAPIView):
    """
    Register a new user with the specified role.
    """
    queryset = User.objects.all()
    serializer_class = UserRegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        try:
            with transaction.atomic():
                serializer = self.get_serializer(data=request.data)
                if not serializer.is_valid():
                    return APIResponse.error(
                        message="Registration failed due to validation errors",
                        details=serializer.errors,
                        status_code=status.HTTP_400_BAD_REQUEST
                    )
                
                user = serializer.save()
                
                # Get the token for the newly created user
                try:
                    token_serializer = CustomTokenObtainPairSerializer(data={
                        'username': user.username,
                        'password': request.data['password']
                    })
                    token_serializer.is_valid(raise_exception=True)
                    tokens = token_serializer.validated_data
                except Exception as e:
                    logger.error(f"Token generation failed for user {user.username}: {e}")
                    return APIResponse.error(
                        message="User created but token generation failed",
                        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )
                
                user_data = UserSerializer(user).data
                
                return APIResponse.success(
                    data={
                        'user': user_data,
                        'tokens': tokens,
                        'message': 'Registration successful'
                    },
                    message=f"Welcome {user.first_name}! Your account has been created successfully.",
                    status_code=status.HTTP_201_CREATED
                )
                
        except Exception as e:
            logger.error(f"Registration error: {e}")
            return APIResponse.error(
                message="An error occurred during registration",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Custom token obtain view that includes user data in the response.
    """
    serializer_class = CustomTokenObtainPairSerializer
    
    def post(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            if not serializer.is_valid():
                return APIResponse.error(
                    message="Invalid credentials provided",
                    details=serializer.errors,
                    status_code=status.HTTP_401_UNAUTHORIZED
                )
            
            tokens = serializer.validated_data
            user_data = tokens.pop('user', None)
            
            return APIResponse.success(
                data={
                    'user': user_data,
                    'tokens': tokens,
                    'login_time': serializer.validated_data.get('login_time')
                },
                message=f"Welcome back, {user_data.get('first_name', 'User')}!"
            )
            
        except Exception as e:
            logger.error(f"Login error: {e}")
            return APIResponse.error(
                message="An error occurred during login",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    Get or update the authenticated user's profile.
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user
    
    def retrieve(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance)
            return APIResponse.success(
                data=serializer.data,
                message="Profile retrieved successfully"
            )
        except Exception as e:
            logger.error(f"Profile retrieval error: {e}")
            return APIResponse.error(
                message="Error retrieving profile",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def update(self, request, *args, **kwargs):
        try:
            partial = kwargs.pop('partial', False)
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data, partial=partial)
            
            if not serializer.is_valid():
                return APIResponse.error(
                    message="Profile update failed due to validation errors",
                    details=serializer.errors,
                    status_code=status.HTTP_400_BAD_REQUEST
                )
            
            self.perform_update(serializer)
            
            return APIResponse.success(
                data=serializer.data,
                message="Profile updated successfully"
            )
            
        except Exception as e:
            logger.error(f"Profile update error: {e}")
            return APIResponse.error(
                message="Error updating profile",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CheckAuthView(APIView):
    """
    Check if the user is authenticated and return their data.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        try:
            serializer = UserSerializer(request.user)
            return APIResponse.success(
                data={
                    'user': serializer.data,
                    'authenticated': True,
                    'session_valid': True
                },
                message="Authentication verified"
            )
        except Exception as e:
            logger.error(f"Auth check error: {e}")
            return APIResponse.error(
                message="Error verifying authentication",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
