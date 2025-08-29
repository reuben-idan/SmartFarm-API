from rest_framework import status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q

from apps.api.base_views import BaseModelViewSet
from ..models import Crop
from ..serializers.crop_serializers import (
    CropSerializer, 
    CropCreateUpdateSerializer
)

class CropViewSet(BaseModelViewSet):
    """
    API endpoint that allows crops to be viewed or edited.
    """
    queryset = Crop.objects.all()
    serializer_class = CropSerializer
    search_fields = ['name', 'soil_type', 'regions']
    filterset_fields = {
        'season': ['exact'],
        'maturity_days': ['exact', 'gte', 'lte'],
        'created_at': ['date', 'date__gte', 'date__lte'],
        'updated_at': ['date', 'date__gte', 'date__lte'],
    }

    def get_serializer_class(self):
        """Return appropriate serializer class."""
        if self.action in ['create', 'update', 'partial_update']:
            return CropCreateUpdateSerializer
        return self.serializer_class

    def get_queryset(self):
        """
        Optionally filter crops by region or season.
        """
        queryset = super().get_queryset()
        region = self.request.query_params.get('region')
        season = self.request.query_params.get('season')
        
        if region:
            queryset = queryset.filter(regions__contains=[region])
        
        if season:
            queryset = queryset.filter(
                Q(season=season) | Q(season=Crop.Season.ALL)
            )
            
        return queryset

    @action(detail=False, methods=['get'])
    def seasons(self, request):
        """
        Get a list of available seasons.
        """
        return Response([
            {'value': choice[0], 'label': choice[1]}
            for choice in Crop.Season.choices
        ])
