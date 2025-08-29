from datetime import datetime, timedelta
from django.db.models import Q, Sum, Count, Avg, F, ExpressionWrapper, DecimalField
from django.db.models.functions import Coalesce, TruncDate, TruncMonth, TruncYear
from rest_framework import status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django_filters.rest_framework import DjangoFilterBackend

from apps.api.base_views import BaseModelViewSet
from ..models import YieldForecast, YieldMethod, Season
from ..serializers.yield_serializers import (
    YieldForecastSerializer,
    YieldForecastCreateUpdateSerializer,
    YieldStatsSerializer
)

class YieldForecastViewSet(BaseModelViewSet):
    """
    API endpoint that allows yield forecasts to be viewed or edited.
    """
    queryset = YieldForecast.objects.all()
    serializer_class = YieldForecastSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = {
        'crop__id': ['exact'],
        'crop_name': ['exact', 'icontains'],
        'region': ['exact', 'icontains'],
        'season': ['exact'],
        'method': ['exact'],
        'hectares': ['exact', 'gte', 'lte'],
        'forecast_yield': ['exact', 'gte', 'lte'],
        'created_at': ['date', 'date__gte', 'date__lte', 'range'],
    }
    search_fields = ['crop_name', 'region', 'season']
    ordering_fields = [
        'crop_name', 'region', 'season', 'hectares', 
        'forecast_yield', 'yield_per_ha', 'created_at'
    ]
    ordering = ['-created_at']

    def get_serializer_class(self):
        """Return appropriate serializer class."""
        if self.action in ['create', 'update', 'partial_update']:
            return YieldForecastCreateUpdateSerializer
        return self.serializer_class

    def get_queryset(self):
        """
        Optionally filter yield forecasts by various parameters.
        """
        queryset = super().get_queryset()
        
        # Get query parameters
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        min_yield = self.request.query_params.get('min_yield')
        max_yield = self.request.query_params.get('max_yield')
        
        # Apply date range filter
        if start_date and end_date:
            queryset = queryset.filter(created_at__date__range=[start_date, end_date])
        elif start_date:
            queryset = queryset.filter(created_at__date__gte=start_date)
        elif end_date:
            queryset = queryset.filter(created_at__date__lte=end_date)
            
        # Apply yield range filter
        if min_yield:
            queryset = queryset.filter(forecast_yield__gte=min_yield)
        if max_yield:
            queryset = queryset.filter(forecast_yield__lte=max_yield)
            
        # Annotate with yield per hectare
        queryset = queryset.annotate(
            yield_per_ha=ExpressionWrapper(
                F('forecast_yield') / F('hectares'),
                output_field=DecimalField(max_digits=14, decimal_places=2)
            )
        )
            
        return queryset.select_related('crop')

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        Get statistics about yield forecasts.
        """
        # Get base queryset with filters
        queryset = self.filter_queryset(self.get_queryset())
        
        # Get total statistics
        total_stats = queryset.aggregate(
            total_forecasts=Count('id'),
            total_hectares=Coalesce(Sum('hectares'), 0.0),
            total_yield=Coalesce(Sum('forecast_yield'), 0.0),
            avg_yield_per_ha=Coalesce(Avg(F('forecast_yield') / F('hectares')), 0.0)
        )
        
        # Get statistics by region and season
        stats_by_region_season = queryset.values('region', 'season').annotate(
            total_hectares=Coalesce(Sum('hectares'), 0.0),
            total_yield=Coalesce(Sum('forecast_yield'), 0.0),
            forecast_count=Count('id'),
            avg_yield_per_ha=Coalesce(Avg(F('forecast_yield') / F('hectares')), 0.0)
        ).order_by('region', 'season')
        
        # Get statistics by crop
        stats_by_crop = queryset.values('crop_name').annotate(
            total_hectares=Coalesce(Sum('hectares'), 0.0),
            total_yield=Coalesce(Sum('forecast_yield'), 0.0),
            forecast_count=Count('id'),
            avg_yield_per_ha=Coalesce(Avg(F('forecast_yield') / F('hectares')), 0.0)
        ).order_by('-total_hectares')
        
        # Get recent forecasts (last 30 days)
        thirty_days_ago = datetime.now() - timedelta(days=30)
        recent_forecasts = queryset.filter(created_at__gte=thirty_days_ago).count()
        
        return Response({
            'total_forecasts': total_stats['total_forecasts'],
            'total_hectares': float(total_stats['total_hectares']),
            'total_yield': float(total_stats['total_yield']),
            'average_yield_per_ha': float(total_stats['avg_yield_per_ha']),
            'recent_forecasts': recent_forecasts,
            'by_region_season': [
                {
                    'region': item['region'],
                    'season': item['season'],
                    'total_hectares': float(item['total_hectares']),
                    'total_yield': float(item['total_yield']),
                    'forecast_count': item['forecast_count'],
                    'average_yield_per_ha': float(item['avg_yield_per_ha'])
                }
                for item in stats_by_region_season
            ],
            'by_crop': [
                {
                    'crop_name': item['crop_name'],
                    'total_hectares': float(item['total_hectares']),
                    'total_yield': float(item['total_yield']),
                    'forecast_count': item['forecast_count'],
                    'average_yield_per_ha': float(item['avg_yield_per_ha'])
                }
                for item in stats_by_crop
            ]
        })

    @action(detail=False, methods=['get'])
    def trends(self, request):
        """
        Get yield forecast trends over time.
        """
        # Get base queryset with filters
        queryset = self.filter_queryset(self.get_queryset())
        
        # Get time period (default: last 12 months)
        months = int(request.query_params.get('months', 12))
        end_date = datetime.now()
        start_date = end_date - timedelta(days=30 * months)
        
        # Group by month and calculate statistics
        trends = queryset.filter(
            created_at__date__range=[start_date, end_date]
        ).annotate(
            month=TruncMonth('created_at')
        ).values('month').annotate(
            count=Count('id'),
            avg_yield=Avg('forecast_yield'),
            avg_hectares=Avg('hectares'),
            avg_yield_per_ha=Avg(F('forecast_yield') / F('hectares'))
        ).order_by('month')
        
        return Response([
            {
                'month': item['month'].strftime('%Y-%m'),
                'count': item['count'],
                'average_yield': float(item['avg_yield'] or 0),
                'average_hectares': float(item['avg_hectares'] or 0),
                'average_yield_per_ha': float(item['avg_yield_per_ha'] or 0)
            }
            for item in trends
        ])
