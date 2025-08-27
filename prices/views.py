from django.utils.dateparse import parse_date
from django.db.models import Q
from rest_framework import mixins, viewsets
from rest_framework.permissions import AllowAny

from .models import MarketPrice
from .serializers import MarketPriceSerializer


class MarketPriceViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    queryset = MarketPrice.objects.select_related('crop').all()
    serializer_class = MarketPriceSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = super().get_queryset()
        params = self.request.query_params

        crop = params.get('crop')  # crop id
        crop_name = params.get('crop_name')
        region = params.get('region')
        date_after = params.get('date_after')
        date_before = params.get('date_before')

        if crop:
            qs = qs.filter(crop_id=crop)
        if crop_name:
            qs = qs.filter(crop__name__iexact=crop_name)
        if region:
            qs = qs.filter(region__iexact=region)

        if date_after:
            d = parse_date(date_after)
            if d:
                qs = qs.filter(date__gte=d)
        if date_before:
            d = parse_date(date_before)
            if d:
                qs = qs.filter(date__lte=d)

        return qs.order_by('-date', '-id')
