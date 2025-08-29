from rest_framework import viewsets, filters, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from .models import Crop, Season
from .serializers import CropSerializer, CropListSerializer


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow admins to edit, but anyone to view.
    """
    def has_permission(self, request, view):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True
        # Write permissions are only allowed to admin users.
        return request.user and request.user.is_staff


class CropViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and managing crops.
    """
    queryset = Crop.objects.all().order_by('name')
    serializer_class = CropSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['season', 'soil_type']
    search_fields = ['name', 'regions']
    ordering_fields = ['name', 'maturity_days', 'created_at']
    ordering = ['name']

    def get_serializer_class(self):
        """
        Use different serializers for list and detail views.
        """
        if self.action == 'list':
            return CropListSerializer
        return self.serializer_class

    def get_queryset(self):
        """
        Optionally filter by season if provided in query params.
        """
        queryset = super().get_queryset()
        season = self.request.query_params.get('season', None)
        if season:
            queryset = queryset.filter(season__iexact=season)
        return queryset

    @action(detail=False, methods=['get'])
    def seasons(self, request):
        """
        Return a list of available seasons with their display names.
        """
        return Response([
            {'value': value, 'display_name': display_name}
            for value, display_name in Season.choices
        ])

    def perform_create(self, serializer):
        """
        Set the created_by field to the current user when creating a new crop.
        """
        serializer.save()

    def perform_update(self, serializer):
        """
        Set the updated_by field to the current user when updating a crop.
        """
        serializer.save()
