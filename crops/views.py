from rest_framework import viewsets, permissions
from rest_framework.permissions import AllowAny
from core.exceptions import APIResponse
from .models import Crop
from .serializers import CropSerializer


class CropViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Crop.objects.all()
    serializer_class = CropSerializer
    permission_classes = [AllowAny]
    
    def list(self, request, *args, **kwargs):
        try:
            queryset = self.filter_queryset(self.get_queryset())
            page = self.paginate_queryset(queryset)
            
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                paginated_response = self.get_paginated_response(serializer.data)
                
                return APIResponse.success(
                    data={
                        'count': paginated_response.data['count'],
                        'next': paginated_response.data['next'],
                        'previous': paginated_response.data['previous'],
                        'results': paginated_response.data['results']
                    },
                    message="Crops retrieved successfully"
                )

            serializer = self.get_serializer(queryset, many=True)
            return APIResponse.success(
                data={'count': len(serializer.data), 'results': serializer.data},
                message="Crops retrieved successfully"
            )
        except Exception as e:
            return APIResponse.error(
                message="Error retrieving crops",
                status_code=500
            )
    
    def retrieve(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance)
            return APIResponse.success(
                data=serializer.data,
                message="Crop retrieved successfully"
            )
        except Exception as e:
            return APIResponse.error(
                message="Crop not found",
                status_code=404
            )