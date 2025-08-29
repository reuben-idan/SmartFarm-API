from django.db.models import Q, Count, Sum
from django.contrib.auth import get_user_model
from rest_framework import status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django_filters.rest_framework import DjangoFilterBackend

from apps.api.base_views import BaseModelViewSet
from apps.farmers.models import FarmerProfile
from apps.farmers.serializers.farmer_profile_serializers import (
    FarmerProfileSerializer,
    FarmerProfileCreateUpdateSerializer
)

User = get_user_model()

class FarmerProfileViewSet(BaseModelViewSet):
    """
    API endpoint that allows farmer profiles to be viewed or edited.
    """
    queryset = FarmerProfile.objects.all()
    serializer_class = FarmerProfileSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = {
        'region': ['exact', 'icontains'],
        'district': ['exact', 'icontains'],
        'farm_size_ha': ['exact', 'gte', 'lte'],
        'created_at': ['date', 'date__gte', 'date__lte'],
        'updated_at': ['date', 'date__gte', 'date__lte'],
    }
    search_fields = ['user__first_name', 'user__last_name', 'user__email', 'phone', 'region', 'district']
    ordering_fields = ['farm_size_ha', 'created_at', 'updated_at']
    ordering = ['-created_at']

    def get_serializer_class(self):
        """Return appropriate serializer class."""
        if self.action in ['create', 'update', 'partial_update']:
            return FarmerProfileCreateUpdateSerializer
        return self.serializer_class

    def get_queryset(self):
        """
        Optionally filter farmer profiles by region, district, or crop.
        """
        queryset = super().get_queryset().select_related('user')
        
        # Get query parameters
        region = self.request.query_params.get('region')
        district = self.request.query_params.get('district')
        crop = self.request.query_params.get('crop')
        
        # Apply filters
        if region:
            queryset = queryset.filter(region__iexact=region)
            
        if district:
            queryset = queryset.filter(district__iexact=district)
            
        if crop:
            queryset = queryset.filter(crops_grown__contains=[crop])
            
        return queryset

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        Get statistics about farmers.
        """
        # Get total number of farmers
        total_farmers = self.get_queryset().count()
        
        # Get total farm area
        total_farm_area = self.get_queryset().aggregate(
            total_area=Sum('farm_size_ha')
        )['total_area'] or 0
        
        # Get farmers by region
        farmers_by_region = self.get_queryset().values('region').annotate(
            count=Count('id'),
            total_area=Sum('farm_size_ha')
        ).order_by('-count')
        
        # Get most common crops
        # This is a simplified version - in a real app, you might want to use a proper JSONField query
        all_crops = {}
        for profile in self.get_queryset():
            for crop in profile.crops_grown or []:
                all_crops[crop] = all_crops.get(crop, 0) + 1
        
        most_common_crops = [
            {'crop': crop, 'count': count}
            for crop, count in sorted(all_crops.items(), key=lambda x: x[1], reverse=True)[:10]
        ]
        
        return Response({
            'total_farmers': total_farmers,
            'total_farm_area_ha': float(total_farm_area),
            'average_farm_size_ha': float(total_farm_area / total_farmers) if total_farmers > 0 else 0,
            'farmers_by_region': list(farmers_by_region),
            'most_common_crops': most_common_crops
        })

    @action(detail=True, methods=['get'])
    def details(self, request, pk=None):
        """
        Get detailed information about a specific farmer.
        """
        farmer = self.get_object()
        serializer = self.get_serializer(farmer)
        
        # Add additional data to the response
        data = serializer.data
        data['farms_count'] = farmer.farms.count() if hasattr(farmer, 'farms') else 0
        data['yields_count'] = farmer.yields.count() if hasattr(farmer, 'yields') else 0
        
        return Response(data)
