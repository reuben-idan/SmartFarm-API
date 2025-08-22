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
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['location']),
        ]

    def __str__(self) -> str:
        return self.name
