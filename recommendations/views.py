from typing import List, Dict
from django.http import JsonResponse
from django.db.models import Q
from django.core.cache import cache
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework import status
import logging

from core.exceptions import APIResponse
from crops.models import Crop, Season
from .serializers import CropRecommendationSerializer

logger = logging.getLogger(__name__)


def score_crop(crop: Crop, region: str, season: str | None, soil_type: str | None) -> float:
    # Basic matches
    score = 0.0
    region_match = False
    if isinstance(crop.regions, list):
        region_match = any(r.lower() == region.lower() for r in crop.regions)
    if region_match:
        score += 1.0

    if season:
        try:
            if crop.season == season:
                score += 1.0
        except Exception:
            pass

    if soil_type:
        if crop.soil_type and crop.soil_type.lower() == soil_type.lower():
            score += 1.0
        else:
            # Apply a small penalty when a soil filter is provided but doesn't match
            score -= 0.1

    # Maturity fit: prefer around 120 days; add up to +1 based on closeness
    target = 120.0
    if crop.maturity_days:
        diff = abs(float(crop.maturity_days) - target)
        # linear decay: 0 diff -> 1.0, 120+ diff -> ~0
        maturity_component = max(0.0, 1.0 - (diff / target))
        score += maturity_component
        # Apply small penalty if much longer than target to differentiate extreme values
        if float(crop.maturity_days) > target:
            score -= 0.05

    return score


class RecommendationView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            region = request.query_params.get('region')
            season = request.query_params.get('season')
            soil_type = request.query_params.get('soil_type')

            if not region:
                return APIResponse.error(
                    message="Region parameter is required",
                    details={'region': ['This field is required.']},
                    status_code=status.HTTP_400_BAD_REQUEST
                )

            # Create cache key for performance
            cache_key = f"recommendations_{region.lower()}_{season or 'any'}_{soil_type or 'any'}"
            cached_result = cache.get(cache_key)
            
            if cached_result:
                return APIResponse.success(
                    data=cached_result,
                    message="Crop recommendations retrieved successfully (cached)"
                )

            # Optimize database query with select_related and filtering
            region_filter = Q(regions__icontains=region.lower())
            crops_qs = Crop.objects.filter(region_filter).select_related()
            
            if season:
                crops_qs = crops_qs.filter(season=season)
            
            if soil_type:
                crops_qs = crops_qs.filter(soil_type__iexact=soil_type)

            candidates = list(crops_qs)
            
            if not candidates:
                return APIResponse.success(
                    data={'count': 0, 'results': []},
                    message=f"No crops found for region: {region}"
                )

            # Score and sort
            scored: List[Dict] = []
            for c in candidates:
                try:
                    s = score_crop(c, region=region, season=season, soil_type=soil_type)
                    item = {
                        'id': c.id,
                        'name': c.name,
                        'season': c.season,
                        'soil_type': c.soil_type or '',
                        'regions': c.regions or [],
                        'maturity_days': c.maturity_days,
                        'recommended_inputs': c.recommended_inputs or {},
                        'score': round(s, 4),
                        'suitability': self._get_suitability_level(s)
                    }
                    scored.append(item)
                except Exception as e:
                    logger.warning(f"Error scoring crop {c.name}: {e}")
                    continue

            scored.sort(key=lambda x: x['score'], reverse=True)
            top5 = scored[:5]

            result_data = {
                'count': len(scored),
                'total_available': len(candidates),
                'results': top5,
                'filters_applied': {
                    'region': region,
                    'season': season,
                    'soil_type': soil_type
                }
            }
            
            # Cache result for 1 hour
            cache.set(cache_key, result_data, 3600)
            
            return APIResponse.success(
                data=result_data,
                message="Crop recommendations generated successfully"
            )
            
        except Exception as e:
            logger.error(f"Error generating recommendations: {e}")
            return APIResponse.error(
                message="An error occurred while generating recommendations",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _get_suitability_level(self, score: float) -> str:
        """Convert numeric score to human-readable suitability level"""
        if score >= 2.5:
            return 'excellent'
        elif score >= 2.0:
            return 'very_good'
        elif score >= 1.5:
            return 'good'
        elif score >= 1.0:
            return 'fair'
        else:
            return 'poor'
