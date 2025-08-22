from django.db import models
from django.core.validators import MinValueValidator
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from django.db import models as dj_models  # alias to avoid confusion


class Season(models.TextChoices):
    MAJOR = 'major', _('Major Season')
    MINOR = 'minor', _('Minor Season')
    ALL = 'all', _('All Seasons')


class Crop(models.Model):
    """
    Crop model representing different types of crops with their properties.
    """
    name = models.CharField(
        max_length=100,
        unique=True,
        help_text=_("Name of the crop (e.g., Maize, Beans, Coffee)")
    )
    
    season = models.CharField(
        max_length=10,
        choices=Season.choices,
        default=Season.MAJOR,
        help_text=_("Growing season for the crop")
    )
    
    soil_type = models.CharField(
        max_length=100,
        blank=True,
        help_text=_("Preferred soil type (e.g., loamy, clay, sandy)")
    )
    
    regions = models.JSONField(
        default=list,
        help_text=_("List of regions where this crop is commonly grown (array of strings)")
    )
    
    recommended_inputs = models.JSONField(
        default=dict,
        help_text=_("Recommended inputs like fertilizers, pesticides, etc.")
    )
    
    maturity_days = models.PositiveIntegerField(
        validators=[MinValueValidator(1)],
        help_text=_("Number of days until the crop reaches maturity")
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        verbose_name = _('Crop')
        verbose_name_plural = _('Crops')

    def __str__(self):
        return self.name

    def clean(self):
        # Ensure regions is a list of non-empty strings
        if self.regions:
            self.regions = [r.strip() for r in self.regions if r and r.strip()]
            
        # Ensure recommended_inputs is a dictionary
        if not isinstance(self.recommended_inputs, dict):
            raise ValidationError({
                'recommended_inputs': _('Recommended inputs must be a JSON object')
            })

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
