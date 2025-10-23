from decimal import Decimal, InvalidOperation
from django.conf import settings
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework import status
import logging

from core.exceptions import APIResponse
from .serializers import YieldForecastQuerySerializer, YieldForecastResponseSerializer
from .models import YieldForecast, YieldMethod

logger = logging.getLogger(__name__)


class YieldForecastView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            serializer = YieldForecastQuerySerializer(data=request.query_params)
            if not serializer.is_valid():
                return APIResponse.error(
                    message="Invalid parameters provided",
                    details=serializer.errors,
                    status_code=status.HTTP_400_BAD_REQUEST
                )

            crop_obj = serializer.validated_data['crop']
            region = serializer.validated_data['region']
            season = serializer.validated_data['season']
            hectares = serializer.validated_data['hectares']

            # Deterministic factors with error handling
            base_map = getattr(settings, 'YIELD_BASE_YIELDS', {})
            region_map = getattr(settings, 'YIELD_REGION_MULTIPLIERS', {})
            season_map = getattr(settings, 'YIELD_SEASON_FACTORS', {})

            crop_key = crop_obj.name.lower()
            region_key = region.lower()
            
            if crop_key not in base_map:
                return APIResponse.error(
                    message=f"Yield data not available for crop: {crop_obj.name}",
                    status_code=status.HTTP_404_NOT_FOUND
                )
            
            if region_key not in region_map:
                return APIResponse.error(
                    message=f"Yield data not available for region: {region}",
                    status_code=status.HTTP_404_NOT_FOUND
                )
            
            if season not in season_map:
                return APIResponse.error(
                    message=f"Yield data not available for season: {season}",
                    status_code=status.HTTP_404_NOT_FOUND
                )

            try:
                base = Decimal(str(base_map[crop_key]))
                regional_multiplier = Decimal(str(region_map[region_key]))
                season_factor = Decimal(str(season_map[season]))
                
                forecast = (base * regional_multiplier * season_factor * hectares).quantize(Decimal('0.01'))
            except (InvalidOperation, ValueError) as e:
                logger.error(f"Calculation error in yield forecast: {e}")
                return APIResponse.error(
                    message="Error calculating yield forecast",
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

            factors = {
                'base_yield_t_per_ha': float(base),
                'regional_multiplier': float(regional_multiplier),
                'season_factor': float(season_factor),
            }

            # Persist forecast
            try:
                yf = YieldForecast.objects.create(
                    crop=crop_obj,
                    crop_name=crop_obj.name,
                    region=region,
                    season=season,
                    hectares=hectares,
                    forecast_yield=forecast,
                    factors=factors,
                    method=YieldMethod.MOCK_V1,
                )
            except Exception as e:
                logger.error(f"Error saving yield forecast: {e}")
                # Continue without saving if there's a DB error

            response_data = {
                'id': yf.id if 'yf' in locals() else None,
                'crop': crop_obj.name,
                'region': region,
                'season': season,
                'hectares': str(hectares),
                'forecast_yield': str(forecast),
                'factors': factors,
                'confidence': 'high',  # Mock confidence level
                'generated_at': yf.created_at.isoformat() if 'yf' in locals() else None
            }
            
            return APIResponse.success(
                data=response_data,
                message="Yield forecast generated successfully"
            )
            
        except Exception as e:
            logger.error(f"Unexpected error in yield forecast: {e}")
            return APIResponse.error(
                message="An unexpected error occurred while generating forecast",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
