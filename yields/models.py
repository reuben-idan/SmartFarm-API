from django.db import models
from django.utils.translation import gettext_lazy as _

from crops.models import Crop, Season


class YieldMethod(models.TextChoices):
    MOCK_V1 = 'mock_v1', _('Deterministic mock v1')


class YieldForecast(models.Model):
    crop = models.ForeignKey(Crop, on_delete=models.SET_NULL, null=True, blank=True, related_name='yield_forecasts')
    crop_name = models.CharField(max_length=100)
    region = models.CharField(max_length=100)
    season = models.CharField(max_length=10, choices=Season.choices)
    hectares = models.DecimalField(max_digits=10, decimal_places=2)

    forecast_yield = models.DecimalField(max_digits=14, decimal_places=2)
    factors = models.JSONField(default=dict)
    method = models.CharField(max_length=20, choices=YieldMethod.choices, default=YieldMethod.MOCK_V1)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['region']),
            models.Index(fields=['season']),
            models.Index(fields=['crop_name']),
        ]

    def __str__(self) -> str:
        return f"YieldForecast({self.crop_name}, {self.region}, {self.season}, {self.hectares} ha)"
