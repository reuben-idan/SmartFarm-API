from rest_framework import status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django_filters.rest_framework import DjangoFilterBackend

from apps.api.base_views import BaseModelViewSet
from apps.farmers.models import FarmType
from apps.farmers.serializers.farmer_profile_serializers import FarmTypeSerializer

class FarmTypeViewSet(BaseModelViewSet):
    """
    API endpoint that allows farm types to be viewed or edited.
    """
    queryset = FarmType.objects.all()
    serializer_class = FarmTypeSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']
    permission_classes = [IsAuthenticated]
    
    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdminUser]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        """
        Toggle the is_active status of a farm type.
        """
        farm_type = self.get_object()
        farm_type.is_active = not farm_type.is_active
        farm_type.save()
        
        serializer = self.get_serializer(farm_type)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """
        Get all active farm types.
        """
        queryset = self.filter_queryset(self.get_queryset().filter(is_active=True))
        page = self.paginate_queryset(queryset)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
            
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
