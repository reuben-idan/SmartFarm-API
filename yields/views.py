from decimal import Decimal
from django.conf import settings
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny

from .serializers import YieldForecastQuerySerializer, YieldForecastResponseSerializer
from .models import YieldForecast, YieldMethod


class YieldForecastView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        serializer = YieldForecastQuerySerializer(data=request.query_params)
        if not serializer.is_valid():
            return JsonResponse(serializer.errors, status=400)

        crop_obj = serializer.validated_data['crop']
        region = serializer.validated_data['region']
        season = serializer.validated_data['season']
        hectares = serializer.validated_data['hectares']

        # Deterministic factors
        base_map = getattr(settings, 'YIELD_BASE_YIELDS', {})
        region_map = getattr(settings, 'YIELD_REGION_MULTIPLIERS', {})
        season_map = getattr(settings, 'YIELD_SEASON_FACTORS', {})

        base = Decimal(str(base_map[crop_obj.name.lower()]))
        regional_multiplier = Decimal(str(region_map[region.lower()]))
        season_factor = Decimal(str(season_map[season]))

        forecast = (base * regional_multiplier * season_factor * hectares).quantize(Decimal('0.01'))

        factors = {
            'base_yield_t_per_ha': float(base),
            'regional_multiplier': float(regional_multiplier),
            'season_factor': float(season_factor),
        }

        # Persist
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

        resp = {
            'crop': crop_obj.name,
            'region': region,
            'season': season,
            'hectares': str(hectares),
            'forecast_yield': str(forecast),
            'factors': factors,
        }
        out = YieldForecastResponseSerializer(resp)
        return JsonResponse(out.data)
