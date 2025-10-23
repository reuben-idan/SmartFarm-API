from django.utils.dateparse import parse_date
from django.db.models import Q, Avg, Max, Min, Count
from django.core.cache import cache
from django.utils import timezone
from datetime import timedelta
from rest_framework import mixins, viewsets, status
from rest_framework.permissions import AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response
import logging

from core.exceptions import APIResponse
from .models import MarketPrice
from .serializers import MarketPriceSerializer

logger = logging.getLogger(__name__)


class MarketPriceViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    queryset = MarketPrice.objects.select_related('crop').all()
    serializer_class = MarketPriceSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        try:
            qs = super().get_queryset()
            params = self.request.query_params

            crop = params.get('crop')  # crop id
            crop_name = params.get('crop_name')
            region = params.get('region')
            date_after = params.get('date_after')
            date_before = params.get('date_before')

            if crop:
                try:
                    crop_id = int(crop)
                    qs = qs.filter(crop_id=crop_id)
                except ValueError:
                    logger.warning(f"Invalid crop ID provided: {crop}")
                    return qs.none()
                    
            if crop_name:
                qs = qs.filter(crop__name__iexact=crop_name)
                
            if region:
                qs = qs.filter(region__iexact=region)

            if date_after:
                d = parse_date(date_after)
                if d:
                    qs = qs.filter(date__gte=d)
                else:
                    logger.warning(f"Invalid date_after format: {date_after}")
                    
            if date_before:
                d = parse_date(date_before)
                if d:
                    qs = qs.filter(date__lte=d)
                else:
                    logger.warning(f"Invalid date_before format: {date_before}")

            return qs.order_by('-date', '-id')
            
        except Exception as e:
            logger.error(f"Error filtering market prices: {e}")
            return self.queryset.none()
    
    def list(self, request, *args, **kwargs):
        try:
            queryset = self.filter_queryset(self.get_queryset())
            
            # Check if no results
            if not queryset.exists():
                return APIResponse.success(
                    data={'count': 0, 'results': []},
                    message="No market prices found for the specified criteria"
                )
            
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
                    message="Market prices retrieved successfully"
                )

            serializer = self.get_serializer(queryset, many=True)
            return APIResponse.success(
                data={'count': len(serializer.data), 'results': serializer.data},
                message="Market prices retrieved successfully"
            )
            
        except Exception as e:
            logger.error(f"Error retrieving market prices: {e}")
            return APIResponse.error(
                message="Error retrieving market prices",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def analytics(self, request):
        """Get price analytics for a specific crop and region"""
        try:
            crop_name = request.query_params.get('crop_name')
            region = request.query_params.get('region')
            
            if not crop_name or not region:
                return APIResponse.error(
                    message="Both crop_name and region parameters are required",
                    status_code=status.HTTP_400_BAD_REQUEST
                )
            
            cache_key = f"price_analytics_{crop_name.lower()}_{region.lower()}"
            cached_result = cache.get(cache_key)
            
            if cached_result:
                return APIResponse.success(
                    data=cached_result,
                    message="Price analytics retrieved successfully (cached)"
                )
            
            qs = self.get_queryset().filter(
                crop__name__iexact=crop_name,
                region__iexact=region
            )
            
            if not qs.exists():
                return APIResponse.success(
                    data=None,
                    message=f"No price data found for {crop_name} in {region}"
                )
            
            analytics = qs.aggregate(
                avg_price=Avg('price'),
                max_price=Max('price'),
                min_price=Min('price'),
                count=Count('id')
            )
            
            # Get recent trend (last 30 days)
            recent_prices = qs.filter(
                date__gte=timezone.now().date() - timedelta(days=30)
            ).order_by('date')
            
            trend_data = [{
                'date': price.date.isoformat(),
                'price': float(price.price)
            } for price in recent_prices]
            
            result = {
                'crop': crop_name,
                'region': region,
                'analytics': {
                    'average_price': round(float(analytics['avg_price'] or 0), 2),
                    'highest_price': float(analytics['max_price'] or 0),
                    'lowest_price': float(analytics['min_price'] or 0),
                    'total_records': analytics['count']
                },
                'recent_trend': trend_data
            }
            
            cache.set(cache_key, result, 1800)  # Cache for 30 minutes
            
            return APIResponse.success(
                data=result,
                message="Price analytics generated successfully"
            )
            
        except Exception as e:
            logger.error(f"Error generating price analytics: {e}")
            return APIResponse.error(
                message="Error generating price analytics",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
