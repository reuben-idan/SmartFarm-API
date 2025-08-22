from django.db import models
from django.utils.translation import gettext_lazy as _


class MarketPrice(models.Model):
    crop = models.ForeignKey('crops.Crop', on_delete=models.CASCADE, related_name='market_prices')
    region = models.CharField(_('region'), max_length=100)
    price = models.DecimalField(_('price'), max_digits=10, decimal_places=2)
    date = models.DateField(_('date'))
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date', '-id']
        indexes = [
            models.Index(fields=['crop', 'region']),
            models.Index(fields=['date']),
        ]

    def __str__(self) -> str:
        return f"{self.crop.name} - {self.region} - {self.date}: {self.price}"
