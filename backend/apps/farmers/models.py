from django.db import models
from django.conf import settings
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator, RegexValidator
from django.db.models import JSONField, Q, Sum, Count, F, FloatField
from django.utils.translation import gettext_lazy as _
from apps.core.models import BaseModel


class FarmType(models.Model):
    """
    Type of farm (e.g., Organic, Conventional, Hydroponic, etc.)
    """
    name = models.CharField(_('farm type'), max_length=100, unique=True)
    description = models.TextField(_('description'), blank=True)
    is_active = models.BooleanField(_('is active'), default=True)
    is_deleted = models.BooleanField(_('is deleted'), default=False)
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    class Meta:
        verbose_name = _('Farm Type')
        verbose_name_plural = _('Farm Types')
        ordering = ['name']

    def __str__(self):
        return self.name


class FarmerProfile(BaseModel):
    """
    Farmer profile containing detailed information about a farmer.
    """
    GENDER_CHOICES = [
        ('M', _('Male')),
        ('F', _('Female')),
        ('O', _('Other')),
        ('P', _('Prefer not to say')),
    ]

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='farmer_profile',
        primary_key=True,
        verbose_name=_('user')
    )
    
    # Basic Information
    gender = models.CharField(
        _('gender'),
        max_length=1,
        choices=GENDER_CHOICES,
        blank=True,
        null=True
    )
    date_of_birth = models.DateField(_('date of birth'), null=True, blank=True)
    id_number = models.CharField(
        _('ID/Passport Number'),
        max_length=50,
        blank=True,
        null=True,
        unique=True
    )
    
    # Contact Information
    phone = models.CharField(
        _('phone number'),
        max_length=20,
        validators=[
            RegexValidator(
                regex=r'^\+?1?\d{9,15}$',
                message=_('Phone number must be entered in the format: "+999999999". Up to 15 digits allowed.')
            )
        ]
    )
    alternate_phone = models.CharField(
        _('alternate phone number'),
        max_length=20,
        blank=True,
        null=True,
        validators=[
            RegexValidator(
                regex=r'^\+?1?\d{9,15}$',
                message=_('Phone number must be entered in the format: "+999999999". Up to 15 digits allowed.')
            )
        ]
    )
    
    # Location Information
    country = models.CharField(_('country'), max_length=100, default='Tanzania')
    region = models.CharField(_('region'), max_length=100)
    district = models.CharField(_('district'), max_length=100)
    ward = models.CharField(_('ward'), max_length=100, blank=True, null=True)
    village = models.CharField(_('village'), max_length=100, blank=True, null=True)
    address = models.TextField(_('physical address'), blank=True, null=True)
    gps_coordinates = models.CharField(
        _('GPS coordinates'),
        max_length=100,
        blank=True,
        null=True,
        help_text=_('Latitude and Longitude (e.g., -6.3690, 34.8888)')
    )
    
    # Farm Information
    farm_name = models.CharField(_('farm name'), max_length=200, blank=True, null=True)
    farm_type = models.ForeignKey(
        FarmType,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='farmers',
        verbose_name=_('farm type')
    )
    farm_size_ha = models.DecimalField(
        _('farm size (hectares)'),
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0.01)]
    )
    crops_grown = JSONField(
        _('crops grown'),
        default=list,
        help_text=_("List of crops grown by the farmer (stored as JSON)")
    )
    
    # Additional Details
    years_farming = models.PositiveIntegerField(
        _('years of farming experience'),
        null=True,
        blank=True
    )
    is_lead_farmer = models.BooleanField(_('is lead farmer'), default=False)
    lead_farmer = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='associated_farmers',
        verbose_name=_('lead farmer')
    )
    
    # Status and Verification
    is_verified = models.BooleanField(_('is verified'), default=False)
    verified_at = models.DateTimeField(_('verified at'), null=True, blank=True)
    verification_notes = models.TextField(_('verification notes'), blank=True, null=True)
    
    # Financial Information
    has_bank_account = models.BooleanField(_('has bank account'), default=False)
    bank_name = models.CharField(_('bank name'), max_length=100, blank=True, null=True)
    account_number = models.CharField(_('account number'), max_length=50, blank=True, null=True)
    
    # Metadata
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_farmers',
        verbose_name=_('created by')
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='updated_farmers',
        verbose_name=_('updated by')
    )
    
    class Meta:
        verbose_name = _('Farmer Profile')
        verbose_name_plural = _('Farmer Profiles')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['region', 'district']),
            models.Index(fields=['is_verified']),
            models.Index(fields=['is_lead_farmer']),
            models.Index(fields=['created_at']),
        ]
        permissions = [
            ('can_verify_farmer', 'Can verify farmer profiles'),
            ('export_farmer', 'Can export farmer data'),
            ('import_farmer', 'Can import farmer data'),
        ]

    def __str__(self):
        return f"{self.user.get_full_name() or self.user.username}'s Profile"
    
    def save(self, *args, **kwargs):
        # Auto-set created_by/updated_by if not set
        if not self.pk and not self.created_by_id and hasattr(self, '_request_user'):
            self.created_by = self._request_user
        if hasattr(self, '_request_user'):
            self.updated_by = self._request_user
            
        # Update verification timestamp if is_verified is being set to True
        if self.pk and self.is_verified and not self.verified_at:
            self.verified_at = timezone.now()
            
        super().save(*args, **kwargs)
    
    @property
    def full_address(self):
        """Return the full address as a formatted string."""
        parts = [
            self.village,
            self.ward,
            self.district,
            self.region,
            self.country
        ]
        return ', '.join(filter(None, parts))
    
    @property
    def age(self):
        """Calculate and return the farmer's age based on date of birth."""
        if not self.date_of_birth:
            return None
        today = timezone.now().date()
        return today.year - self.date_of_birth.year - (
            (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day)
        )
    
    @classmethod
    def get_farmers_by_region(cls):
        """Get count and total farm area of farmers grouped by region."""
        return cls.objects.values('region').annotate(
            farmer_count=Count('id'),
            total_area=Sum('farm_size_ha')
        ).order_by('-farmer_count')
    
    @classmethod
    def get_farmers_by_crop(cls, crop_name):
        """Get farmers who grow a specific crop."""
        return cls.objects.filter(crops_grown__contains=[crop_name])
    
    def get_similar_farmers(self, max_results=5):
        """Find similar farmers based on location and crops grown."""
        if not self.crops_grown:
            return []
            
        return FarmerProfile.objects.exclude(pk=self.pk).filter(
            Q(region=self.region) | 
            Q(district=self.district) |
            Q(crops_grown__overlap=self.crops_grown)
        ).distinct()[:max_results]
