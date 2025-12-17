from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _


class Supplier(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name='suppliers',
        null=True,
        blank=True,
        help_text=_('User that owns/manages this supplier entry'),
    )
    name = models.CharField(_('name'), max_length=255)
    product_list = models.JSONField(
        _('product list'),
        default=list,
        help_text=_('List of products: [{"name": str, "unit": str, "price": number?}]'),
    )
    location = models.CharField(_('location'), max_length=255)
    phone = models.CharField(_('phone'), max_length=50)
    is_verified = models.BooleanField(default=False)
    verification_date = models.DateTimeField(null=True, blank=True)
    verified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='verified_suppliers'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['location']),
        ]

    def __str__(self):
        return self.name


class Product(models.Model):
    CATEGORY_CHOICES = [
        ('seeds', 'Seeds'),
        ('fertilizer', 'Fertilizer'),
        ('pesticide', 'Pesticide'),
        ('tools', 'Tools'),
    ]
    
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE, related_name='products')
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    unit = models.CharField(max_length=50)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    market_average_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    stock_quantity = models.PositiveIntegerField(default=0)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} - {self.supplier.name}"
    
    @property
    def price_difference(self):
        if self.market_average_price:
            return self.price - self.market_average_price
        return None
