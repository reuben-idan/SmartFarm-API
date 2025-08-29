from django.contrib import admin
from .models import MarketPrice


@admin.register(MarketPrice)
class MarketPriceAdmin(admin.ModelAdmin):
    list_display = ("crop", "region", "price", "date")
    search_fields = ("crop__name", "region")
    list_filter = ("region", "date")
    autocomplete_fields = ("crop",)
