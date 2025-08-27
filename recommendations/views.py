from typing import List, Dict
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny

from crops.models import Crop, Season
from .serializers import CropRecommendationSerializer


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
        region = request.query_params.get('region')
        season = request.query_params.get('season')
        soil_type = request.query_params.get('soil_type')

        if not region:
            return JsonResponse({'detail': 'region is required'}, status=400)

        crops_qs = Crop.objects.all()

        # Require region match in crop.regions
        def region_matches(c: Crop) -> bool:
            return isinstance(c.regions, list) and any(r.lower() == region.lower() for r in c.regions)

        candidates: List[Crop] = [c for c in crops_qs if region_matches(c)]

        # Score and sort
        scored: List[Dict] = []
        for c in candidates:
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
            }
            scored.append(item)

        scored.sort(key=lambda x: x['score'], reverse=True)
        top5 = scored[:5]

        serializer = CropRecommendationSerializer(top5, many=True)
        return JsonResponse({'count': len(scored), 'results': serializer.data})
