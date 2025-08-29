"""
Base views for the SmartFarm API.

Provides common view logic that can be reused across the application.
"""
from rest_framework import viewsets, permissions
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend

from .permissions import IsAdminOrReadOnly


class BaseModelViewSet(viewsets.ModelViewSet):
    """
    Base viewset for all models in the application.
    
    Provides common functionality like:
    - Default permission classes
    - Filtering and ordering
    - Soft delete handling
    - Standard response format
    """
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = []
    ordering_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']
    filterset_fields = {
        'created_at': ['gte', 'lte', 'exact', 'gt', 'lt'],
        'updated_at': ['gte', 'lte', 'exact', 'gt', 'lt'],
    }
    
    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action in ['list', 'retrieve']:
            permission_classes = [permissions.IsAuthenticated]
        elif self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAuthenticated, IsAdminOrReadOnly]
        else:
            permission_classes = [permissions.IsAuthenticated]
            
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        """
        This view should return a list of all objects
        for admin users, or a filtered list for non-admin users.
        """
        queryset = super().get_queryset()
        
        # Filter out soft-deleted items for non-admin users
        if hasattr(queryset.model, 'is_deleted') and not self.request.user.is_staff:
            queryset = queryset.filter(is_deleted=False)
            
        return queryset

    def perform_destroy(self, instance):
        """
        Handle soft delete if the model supports it, otherwise do a hard delete.
        """
        if hasattr(instance, 'is_deleted'):
            instance.is_deleted = True
            instance.save()
        else:
            instance.delete()

    @action(detail=False, methods=['get'])
    def search(self, request, *args, **kwargs):
        """
        Search endpoint that can be used by any viewset.
        """
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
