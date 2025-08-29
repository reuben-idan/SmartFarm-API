from django.contrib import admin
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _
from .models import Crop, Season


class SeasonFilter(admin.SimpleListFilter):
    title = _('season')
    parameter_name = 'season'

    def lookups(self, request, model_admin):
        return Season.choices

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(season=self.value())
        return queryset


@admin.register(Crop)
class CropAdmin(admin.ModelAdmin):
    list_display = ('name', 'season', 'soil_type', 'maturity_days', 'regions_preview', 'created_at')
    list_filter = (SeasonFilter, 'soil_type', 'created_at')
    search_fields = ('name', 'soil_type', 'regions')
    readonly_fields = ('created_at', 'updated_at')
    list_per_page = 20
    date_hierarchy = 'created_at'
    
    fieldsets = (
        (_('Basic Information'), {
            'fields': ('name', 'season', 'soil_type', 'maturity_days')
        }),
        (_('Growing Information'), {
            'fields': ('regions', 'recommended_inputs')
        }),
        (_('Metadata'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def regions_preview(self, obj):
        """Display first 2 regions as a preview."""
        if not obj.regions:
            return "-"
        preview = ", ".join(obj.regions[:2])
        if len(obj.regions) > 2:
            preview += f" (+{len(obj.regions) - 2} more)"
        return preview
    regions_preview.short_description = _('Regions')
    
    def get_queryset(self, request):
        return super().get_queryset(request).prefetch_related('farmers')
