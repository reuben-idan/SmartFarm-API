from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.pagination import PageNumberPagination
from rest_framework import status, serializers
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample
from drf_spectacular.types import OpenApiTypes


class HealthCheckSerializer(serializers.Serializer):
    """Serializer for health check response."""
    status = serializers.CharField()
    service = serializers.CharField()
    version = serializers.CharField()


class HealthCheckView(APIView):
    """
    API endpoint that provides health check information for the service.
    
    This endpoint can be used to verify that the API is up and running.
    It returns basic information about the service including its status and version.
    
    ### Query Parameters:
    - `page` (int): Page number to return (default: 1)
    - `page_size` (int): Number of results per page (default: 20, max: 100)
    - `ordering` (str): Field to order results by (prefix with - for descending)
    - `search` (str): Search term to filter results
    
    ### Example Requests:
    ```
    GET /api/health/
    GET /api/health/?page=2&page_size=10
    GET /api/health/?ordering=-created_at
    GET /api/health/?search=test
    ```
    """
    permission_classes = [AllowAny]
    serializer_class = HealthCheckSerializer
    
    @extend_schema(
        parameters=[
            OpenApiParameter(
                name='page',
                type=OpenApiTypes.INT,
                location=OpenApiParameter.QUERY,
                description='A page number within the paginated result set.',
                required=False
            ),
            OpenApiParameter(
                name='page_size',
                type=OpenApiTypes.INT,
                location=OpenApiParameter.QUERY,
                description='Number of results to return per page (max 100).',
                required=False
            ),
            OpenApiParameter(
                name='ordering',
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description='Which field to use when ordering the results.',
                required=False
            ),
        ],
        responses={
            200: HealthCheckSerializer,
            400: 'Bad Request',
            401: 'Unauthorized',
            404: 'Not Found',
        },
        examples=[
            OpenApiExample(
                'Successful Response',
                value={
                    'status': 'ok',
                    'service': 'SmartFarm API',
                    'version': '1.0.0'
                },
                status_codes=['200']
            )
        ]
    )
    def get(self, request):
        """
        Return health check information.
        
        This endpoint returns the current status of the API service along with
        version information. It can be used for health monitoring and uptime checks.
        """
        data = {
            'status': 'ok',
            'service': 'SmartFarm API',
            'version': '1.0.0'
        }
        
        # In a real view, you would paginate your queryset here
        # For this example, we'll just return the health data as a single item list
        paginator = PageNumberPagination()
        result_page = paginator.paginate_queryset([data], request)
        return paginator.get_paginated_response(result_page[0] if result_page else [])
