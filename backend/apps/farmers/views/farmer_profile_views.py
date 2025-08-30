from django.db.models import Q, Count, Sum, F, Value, CharField
from django.db.models.functions import Concat, Coalesce
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import status, filters, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from django_filters.rest_framework import DjangoFilterBackend, FilterSet, CharFilter, NumberFilter, ChoiceFilter

from apps.api.base_views import BaseModelViewSet
from apps.farmers.models import FarmerProfile, FarmType
from apps.farmers.serializers.farmer_profile_serializers import (
    FarmerProfileListSerializer,
    FarmerProfileDetailSerializer,
    FarmerProfileCreateUpdateSerializer,
    FarmTypeSerializer
)
from apps.users.models import User

class FarmerProfileFilter(FilterSet):
    """Filter for FarmerProfileViewSet."""
    region = CharFilter(field_name='region', lookup_expr='iexact')
    district = CharFilter(field_name='district', lookup_expr='iexact')
    ward = CharFilter(field_name='ward', lookup_expr='iexact')
    village = CharFilter(field_name='village', lookup_expr='iexact')
    farm_type = NumberFilter(field_name='farm_type')
    is_lead_farmer = ChoiceFilter(choices=[('true', 'True'), ('false', 'False')], method='filter_boolean')
    is_verified = ChoiceFilter(choices=[('true', 'True'), ('false', 'False')], method='filter_boolean')
    has_bank_account = ChoiceFilter(choices=[('true', 'True'), ('false', 'False')], method='filter_boolean')
    min_farm_size = NumberFilter(field_name='farm_size_ha', lookup_expr='gte')
    max_farm_size = NumberFilter(field_name='farm_size_ha', lookup_expr='lte')
    crop = CharFilter(method='filter_crop')
    search = CharFilter(method='filter_search')
    
    class Meta:
        model = FarmerProfile
        fields = []
    
    def filter_boolean(self, queryset, name, value):
        """Filter boolean fields."""
        if value.lower() == 'true':
            return queryset.filter(**{f'{name}': True})
        return queryset.filter(**{f'{name}': False})
    
    def filter_crop(self, queryset, name, value):
        """Filter by crop name in crops_grown JSONField."""
        if not value:
            return queryset
        return queryset.filter(crops_grown__contains=[value])
    
    def filter_search(self, queryset, name, value):
        """Search across multiple fields."""
        if not value:
            return queryset
            
        # Search in user fields and farmer profile fields
        return queryset.annotate(
            full_name=Concat(
                'user__first_name', Value(' '), 'user__last_name',
                output_field=CharField()
            )
        ).filter(
            Q(full_name__icontains=value) |
            Q(user__email__icontains=value) |
            Q(phone__icontains=value) |
            Q(farm_name__icontains=value) |
            Q(address__icontains=value) |
            Q(region__icontains=value) |
            Q(district__icontains=value) |
            Q(ward__icontains=value) |
            Q(village__icontains=value) |
            Q(id_number__icontains=value)
        )

class FarmerProfileViewSet(BaseModelViewSet):
    """
    API endpoint that allows farmer profiles to be viewed or edited.
    """
    queryset = FarmerProfile.objects.all().select_related(
        'user', 'farm_type', 'lead_farmer', 'created_by', 'updated_by'
    )
    serializer_class = FarmerProfileListSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = FarmerProfileFilter
    search_fields = [
        'user__first_name', 'user__last_name', 'user__email',
        'phone', 'farm_name', 'id_number', 'region', 'district', 'ward', 'village'
    ]
    ordering_fields = [
        'created_at', 'updated_at', 'farm_size_ha', 'user__first_name',
        'user__last_name', 'region', 'district'
    ]
    ordering = ['-created_at']
    
    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdminUser]
        elif self.action in ['verify', 'reject']:
            permission_classes = [IsAdminUser]
        elif self.action in ['me']:
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def get_serializer_class(self):
        """Return appropriate serializer class based on action."""
        if self.action in ['create', 'update', 'partial_update']:
            return FarmerProfileCreateUpdateSerializer
        elif self.action in ['retrieve', 'me']:
            return FarmerProfileDetailSerializer
        return self.serializer_class

    def get_queryset(self):
        """
        Optionally filter farmer profiles based on user permissions and query params.
        """
        queryset = super().get_queryset()
        
        # For non-admin users, only show their own profile or public data
        if not self.request.user.is_staff:
            # If user is a farmer, show their own profile
            if hasattr(self.request.user, 'farmer_profile'):
                return queryset.filter(user=self.request.user)
            # For other authenticated users, only show verified farmers
            return queryset.filter(is_verified=True)
            
        return queryset
    
    def perform_create(self, serializer):
        """Set created_by and updated_by on create."""
        serializer.save(
            created_by=self.request.user,
            updated_by=self.request.user
        )
    
    def perform_update(self, serializer):
        """Set updated_by on update."""
        serializer.save(updated_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def verify(self, request, pk=None):
        """Verify a farmer profile."""
        farmer = self.get_object()
        if farmer.is_verified:
            return Response(
                {'detail': 'Farmer is already verified.'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        farmer.is_verified = True
        farmer.verified_at = timezone.now()
        farmer.verification_notes = request.data.get('notes', '')
        farmer.updated_by = request.user
        farmer.save()
        
        serializer = self.get_serializer(farmer)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject a farmer profile verification."""
        farmer = self.get_object()
        if not farmer.is_verified:
            return Response(
                {'detail': 'Farmer is not verified.'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        farmer.is_verified = False
        farmer.verification_notes = request.data.get('notes', '')
        farmer.updated_by = request.user
        farmer.save()
        
        serializer = self.get_serializer(farmer)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get or create the profile of the currently authenticated farmer."""
        if not hasattr(request.user, 'farmer_profile'):
            return Response(
                {'detail': 'No farmer profile found for this user.'},
                status=status.HTTP_404_NOT_FOUND
            )
            
        serializer = self.get_serializer(request.user.farmer_profile)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get statistics about farmers."""
        queryset = self.filter_queryset(self.get_queryset())
        
        # Basic counts
        total_farmers = queryset.count()
        verified_farmers = queryset.filter(is_verified=True).count()
        lead_farmers = queryset.filter(is_lead_farmer=True).count()
        
        # Farm size statistics
        farm_stats = queryset.aggregate(
            total_farm_area=Sum('farm_size_ha') or 0,
            avg_farm_size=Sum('farm_size_ha') / Count('id') if queryset.exists() else 0,
            max_farm_size=Max('farm_size_ha') or 0,
            min_farm_size=Min('farm_size_ha') or 0
        )
        
        # Farmers by region
        farmers_by_region = list(queryset.values('region').annotate(
            count=Count('id'),
            total_area=Sum('farm_size_ha'),
            avg_area=Sum('farm_size_ha') / Count('id')
        ).order_by('-count'))
        
        # Farmers by farm type
        farmers_by_farm_type = list(queryset.values('farm_type__name').annotate(
            count=Count('id'),
            farm_type_name=F('farm_type__name'),
            total_area=Sum('farm_size_ha')
        ).order_by('-count').values('farm_type', 'farm_type_name', 'count', 'total_area'))
        
        # Most common crops
        all_crops = {}
        for profile in queryset.only('crops_grown'):
            for crop in profile.crops_grown or []:
                all_crops[crop] = all_crops.get(crop, 0) + 1
        
        most_common_crops = [
            {'crop': crop, 'count': count}
            for crop, count in sorted(all_crops.items(), key=lambda x: x[1], reverse=True)[:10]
        ]
        
        # Monthly registration trend (last 12 months)
        twelve_months_ago = timezone.now() - timezone.timedelta(days=365)
        monthly_registrations = list(queryset.filter(
            created_at__gte=twelve_months_ago
        ).extra({
            'month': "date_trunc('month', created_at)"
        }).values('month').annotate(
            count=Count('id')
        ).order_by('month'))
        
        return Response({
            'total_farmers': total_farmers,
            'verified_farmers': verified_farmers,
            'lead_farmers': lead_farmers,
            'farm_size_stats': {
                'total_area_ha': float(farm_stats['total_farm_area'] or 0),
                'average_size_ha': float(farm_stats['avg_farm_size'] or 0),
                'max_size_ha': float(farm_stats['max_farm_size'] or 0),
                'min_size_ha': float(farm_stats['min_farm_size'] or 0)
            },
            'farmers_by_region': farmers_by_region,
            'farmers_by_farm_type': farmers_by_farm_type,
            'most_common_crops': most_common_crops,
            'monthly_registrations': monthly_registrations
        })
