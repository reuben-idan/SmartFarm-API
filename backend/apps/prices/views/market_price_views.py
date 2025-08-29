from datetime import timedelta
from django.db.models import Avg, Min, Max, Count, Q
from django.utils import timezone
from rest_framework import status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from apps.api.base_views import BaseModelViewSet
from ..models import MarketPrice
from ..serializers.market_price_serializers import (
    MarketPriceSerializer,
    MarketPriceCreateUpdateSerializer,
    MarketPriceTrendSerializer
)
from apps.crops.models import Crop

class MarketPriceViewSet(BaseModelViewSet):
    """
    API endpoint that allows market prices to be viewed or edited.
    """
    queryset = MarketPrice.objects.all()
    serializer_class = MarketPriceSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = {
        'crop': ['exact'],
        'region': ['exact', 'icontains'],
        'price': ['exact', 'gte', 'lte'],
        'date': ['exact', 'gte', 'lte', 'range'],
        'created_at': ['date', 'date__gte', 'date__lte'],
        'updated_at': ['date', 'date__gte', 'date__lte'],
    }
    search_fields = ['crop__name', 'region']
    ordering_fields = ['date', 'price', 'created_at', 'updated_at']
    ordering = ['-date', '-id']

    def get_serializer_class(self):
        """Return appropriate serializer class."""
        if self.action in ['create', 'update', 'partial_update']:
            return MarketPriceCreateUpdateSerializer
        return self.serializer_class

    def get_queryset(self):
        """
        Optionally filter market prices by crop, region, or date range.
        """
        queryset = super().get_queryset()
        
        # Get query parameters
        crop_id = self.request.query_params.get('crop')
        region = self.request.query_params.get('region')
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        
        # Apply filters
        if crop_id:
            queryset = queryset.filter(crop_id=crop_id)
            
        if region:
            queryset = queryset.filter(region__iexact=region)
            
        if start_date and end_date:
            queryset = queryset.filter(date__range=[start_date, end_date])
        elif start_date:
            queryset = queryset.filter(date__gte=start_date)
        elif end_date:
            queryset = queryset.filter(date__lte=end_date)
            
        return queryset.select_related('crop')

    @action(detail=False, methods=['get'])
    def latest(self, request):
        """
        Get the latest market prices.
        """
        # Get the number of days to look back (default: 7)
        days = int(request.query_params.get('days', 7))
        
        # Calculate the date range
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=days)
        
        # Get the latest price for each crop and region
        latest_prices = MarketPrice.objects.filter(
            date__range=[start_date, end_date]
        ).values('crop', 'region').annotate(
            latest_date=Max('date')
        )
        
        # Get the full price records for the latest dates
        price_queries = [
            Q(crop=item['crop'], region=item['region'], date=item['latest_date'])
            for item in latest_prices
        ]
        
        if not price_queries:
            return Response([])
            
        # Combine queries with OR
        query = price_queries.pop()
        for q in price_queries:
            query |= q
            
        latest_records = MarketPrice.objects.filter(query).select_related('crop')
        serializer = self.get_serializer(latest_records, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def trends(self, request):
        """
        Get price trends over time for a specific crop and region.
        """
        crop_id = request.query_params.get('crop')
        region = request.query_params.get('region')
        days = int(request.query_params.get('days', 30))  # Default to 30 days
        
        if not crop_id or not region:
            return Response(
                {"error": "Both 'crop' and 'region' parameters are required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Calculate date range
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=days)
        
        # Get the crop
        try:
            crop = Crop.objects.get(pk=crop_id)
        except Crop.DoesNotExist:
            return Response(
                {"error": f"Crop with ID {crop_id} does not exist."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Aggregate prices by date
        trends = MarketPrice.objects.filter(
            crop=crop,
            region=region,
            date__range=[start_date, end_date]
        ).values('date').annotate(
            average_price=Avg('price'),
            min_price=Min('price'),
            max_price=Max('price'),
            count=Count('id')
        ).order_by('date')
        
        serializer = MarketPriceTrendSerializer(trends, many=True)
        return Response({
            'crop': crop.name,
            'region': region,
            'start_date': start_date,
            'end_date': end_date,
            'trends': serializer.data
        })
