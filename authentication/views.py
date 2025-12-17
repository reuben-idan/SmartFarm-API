from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from .models import OTP

User = get_user_model()

class SendOTPView(APIView):
    permission_classes = []
    
    def post(self, request):
        phone = request.data.get('phone_number')
        if not phone:
            return Response({'success': False, 'message': 'Phone number required'}, status=400)
        
        otp_code = OTP.generate_otp()
        OTP.objects.create(phone_number=phone, otp_code=otp_code)
        
        # In production, send SMS via Twilio/Africa's Talking
        print(f"OTP for {phone}: {otp_code}")
        
        return Response({
            'success': True,
            'message': 'OTP sent successfully',
            'data': {'otp': otp_code}  # Remove in production
        })

class VerifyOTPView(APIView):
    permission_classes = []
    
    def post(self, request):
        phone = request.data.get('phone_number')
        otp_code = request.data.get('otp')
        
        try:
            otp = OTP.objects.filter(phone_number=phone, otp_code=otp_code, is_verified=False).latest('created_at')
            
            if not otp.is_valid():
                return Response({'success': False, 'message': 'OTP expired'}, status=400)
            
            otp.is_verified = True
            otp.save()
            
            user, created = User.objects.get_or_create(
                username=phone,
                defaults={'phone_number': phone}
            )
            
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'success': True,
                'message': 'Login successful',
                'data': {
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'phone_number': phone,
                        'first_name': user.first_name,
                        'role': user.role,
                        'location': getattr(user, 'location', None)
                    },
                    'tokens': {
                        'access': str(refresh.access_token),
                        'refresh': str(refresh)
                    }
                }
            })
        except OTP.DoesNotExist:
            return Response({'success': False, 'message': 'Invalid OTP'}, status=400)