import logging
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from rest_framework import viewsets, mixins
from django.template.loader import render_to_string
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from rest_framework import generics, status, permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .models import User, UserProfile
from .serializers import (
    UserSerializer,
    UserRegisterSerializer,
    CustomTokenObtainPairSerializer,
    UserProfileSerializer,
    ChangePasswordSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
)

logger = logging.getLogger(__name__)
User = get_user_model()

class UserRegisterView(generics.CreateAPIView):
    """
    Register a new user with the specified role.
    
    This view creates a new user account with the provided information and assigns
    the specified role to the user. The account will be inactive until email verification.
    """
    queryset = User.objects.all()
    serializer_class = UserRegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            user = serializer.save()
            
            # Send verification email
            self._send_verification_email(user)
            
            # Return success response without logging in the user
            headers = self.get_success_headers(serializer.data)
            return Response(
                {
                    'detail': _(
                        'Registration successful! Please check your email to verify your account.'
                    )
                },
                status=status.HTTP_201_CREATED,
                headers=headers
            )
            
        except Exception as e:
            logger.error(f'Error during user registration: {str(e)}')
            return Response(
                {'detail': _('An error occurred during registration.')},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _send_verification_email(self, user):
        """Send verification email to the user."""
        try:
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            
            verification_url = f"{settings.FRONTEND_URL}/verify-email/{uid}/{token}/"
            
            subject = 'Verify Your Email Address'
            message = render_to_string('emails/verify_email.html', {
                'user': user,
                'verification_url': verification_url,
            })
            
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                html_message=message,
                fail_silently=False,
            )
            logger.info(f'Verification email sent to {user.email}')
            
        except Exception as e:
            logger.error(f'Error sending verification email: {str(e)}')
            # Don't raise the exception to prevent registration from failing
            # due to email issues


class VerifyEmailView(APIView):
    """
    Verify user's email using the token sent to their email.
    """
    permission_classes = [permissions.AllowAny]
    
    def get(self, request, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
            
            if default_token_generator.check_token(user, token):
                if not user.is_active:
                    user.is_active = True
                    user.is_verified = True
                    user.save()
                    
                    # Send welcome email
                    self._send_welcome_email(user)
                    
                    return Response(
                        {'detail': _('Email verified successfully! You can now log in.')},
                        status=status.HTTP_200_OK
                    )
                return Response(
                    {'detail': _('Email is already verified.')},
                    status=status.HTTP_200_OK
                )
            return Response(
                {'detail': _('Invalid verification link.')},
                status=status.HTTP_400_BAD_REQUEST
            )
                
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response(
                {'detail': _('Invalid verification link.')},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def _send_welcome_email(self, user):
        """Send welcome email after successful verification."""
        try:
            subject = 'Welcome to SmartFarm!'
            message = render_to_string('emails/welcome_email.html', {
                'user': user,
                'login_url': f"{settings.FRONTEND_URL}/login",
            })
            
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                html_message=message,
                fail_silently=False,
            )
            
        except Exception as e:
            logger.error(f'Error sending welcome email: {str(e)}')


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Custom token obtain view that includes user data in the response.
    """
    serializer_class = CustomTokenObtainPairSerializer


class CustomTokenRefreshView(TokenRefreshView):
    """
    Custom token refresh view that includes user data in the response.
    """
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        
        if response.status_code == 200 and 'access' in response.data:
            # Get the user from the token
            from rest_framework_simplejwt.tokens import AccessToken
            access_token = AccessToken(response.data['access'])
            user = User.objects.get(pk=access_token['user_id'])
            
            # Add user data to the response
            response.data['user'] = UserSerializer(user, context={'request': request}).data
            
        return response


class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    Retrieve or update the authenticated user's profile.
    """
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        # Return the profile of the currently authenticated user
        return self.request.user.profile


class ChangePasswordView(generics.UpdateAPIView):
    """
    An endpoint for changing password.
    """
    serializer_class = ChangePasswordSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Set the new password
        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()
        
        # Update session auth hash to prevent logout
        from django.contrib.auth import update_session_auth_hash
        update_session_auth_hash(request, request.user)
        
        return Response(
            {'detail': _('Password updated successfully.')},
            status=status.HTTP_200_OK
        )


class PasswordResetRequestView(generics.GenericAPIView):
    """
    Request a password reset email.
    """
    serializer_class = PasswordResetRequestSerializer
    permission_classes = [permissions.AllowAny]
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        
        # Get the user by email (if it exists)
        user = User.objects.filter(email=email).first()
        
        if user and user.is_active:
            # Generate password reset token
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            
            # Create reset URL
            reset_url = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}/"
            
            # Send email with reset link
            subject = 'Password Reset Request'
            message = render_to_string('emails/password_reset_email.html', {
                'user': user,
                'reset_url': reset_url,
            })
            
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                html_message=message,
                fail_silently=False,
            )
        
        # Always return success to prevent email enumeration
        return Response(
            {'detail': _('If an account exists with this email, you will receive a password reset link.')},
            status=status.HTTP_200_OK
        )


class PasswordResetConfirmView(generics.GenericAPIView):
    """
    Confirm password reset and set new password.
    """
    serializer_class = PasswordResetConfirmSerializer
    permission_classes = [permissions.AllowAny]
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            # Decode user ID
            uid = force_str(urlsafe_base64_decode(serializer.validated_data['uid']))
            user = User.objects.get(pk=uid)
            
            # Check token
            token = serializer.validated_data['token']
            if not default_token_generator.check_token(user, token):
                return Response(
                    {'token': _('Invalid or expired token.')},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Set the new password
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            
            # Send confirmation email
            self._send_password_changed_email(user)
            
            return Response(
                {'detail': _('Password has been reset successfully. You can now log in with your new password.')},
                status=status.HTTP_200_OK
            )
            
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response(
                {'detail': _('Invalid reset link.')},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def _send_password_changed_email(self, user):
        """Send confirmation email after password change."""
        try:
            subject = 'Your Password Has Been Changed'
            message = render_to_string('emails/password_changed_email.html', {
                'user': user,
                'login_url': f"{settings.FRONTEND_URL}/login",
            })
            
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                html_message=message,
                fail_silently=False,
            )
            
        except Exception as e:
            logger.error(f'Error sending password changed email: {str(e)}')


class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet for user management (admin only).
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by role if specified
        role = self.request.query_params.get('role')
        if role:
            queryset = queryset.filter(groups__name=role)
            
        # Filter by search query if specified
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(email__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(phone__icontains=search)
            )
            
        return queryset.distinct()
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activate a user account."""
        user = self.get_object()
        if not user.is_active:
            user.is_active = True
            user.save()
            return Response(
                {'detail': _('User activated successfully.')},
                status=status.HTTP_200_OK
            )
        return Response(
            {'detail': _('User is already active.')},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """Deactivate a user account."""
        user = self.get_object()
        if user.is_active:
            user.is_active = False
            user.save()
            return Response(
                {'detail': _('User deactivated successfully.')},
                status=status.HTTP_200_OK
            )
        return Response(
            {'detail': _('User is already inactive.')},
            status=status.HTTP_400_BAD_REQUEST
        )


class CheckAuthView(APIView):
    """
    Check if the user is authenticated and return their data.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        serializer = UserSerializer(request.user, context={'request': request})
        return Response(serializer.data)


class ProfileViewSet(viewsets.GenericViewSet, mixins.RetrieveModelMixin, mixins.UpdateModelMixin):
    """
    Get or update the authenticated user's profile.
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user
