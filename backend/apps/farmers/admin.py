from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe

from .models import FarmerProfile, FarmType


class FarmTypeAdmin(admin.ModelAdmin):
    """Admin interface for FarmType model."""
    list_display = ('name', 'description', 'is_active', 'created_at', 'updated_at')
    list_filter = ('is_active', 'created_at', 'updated_at')
    search_fields = ('name', 'description')
    readonly_fields = ('created_at', 'updated_at')
    list_editable = ('is_active',)
    ordering = ('name',)


class FarmerProfileAdmin(admin.ModelAdmin):
    """Admin interface for FarmerProfile model."""
    list_display = (
        'user_link', 'full_name', 'phone', 'region', 'district', 
        'is_lead_farmer', 'is_verified', 'created_at'
    )
    list_filter = (
        'is_verified', 'is_lead_farmer', 'gender', 'region', 'district',
        'created_at', 'updated_at', 'farm_type'
    )
    search_fields = (
        'user__first_name', 'user__last_name', 'user__email',
        'phone', 'id_number', 'region', 'district', 'ward', 'village'
    )
    readonly_fields = (
        'created_at', 'updated_at', 'verified_at',
        'created_by', 'updated_by', 'user_link'
    )
    list_select_related = ('user', 'farm_type', 'lead_farmer')
    raw_id_fields = ('user', 'lead_farmer')
    date_hierarchy = 'created_at'
    fieldsets = (
        ('Personal Information', {
            'fields': (
                'user', 'user_link', 'gender', 'date_of_birth',
                'id_number', 'phone', 'alternate_phone'
            )
        }),
        ('Location Information', {
            'fields': (
                'country', 'region', 'district', 'ward',
                'village', 'address', 'gps_coordinates'
            )
        }),
        ('Farm Information', {
            'fields': (
                'farm_name', 'farm_type', 'farm_size_ha',
                'crops_grown', 'years_farming', 'lead_farmer'
            )
        }),
        ('Verification & Status', {
            'fields': (
                'is_lead_farmer', 'is_verified', 'verified_at',
                'verification_notes'
            )
        }),
        ('Bank Details', {
            'fields': (
                'bank_name', 'bank_branch', 'account_number',
                'account_name'
            ),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('created_by', 'updated_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def user_link(self, obj):
        if obj.user:
            url = reverse('admin:users_user_change', args=[obj.user.id])
            return mark_safe(f'<a href="{url}">{obj.user.email}</a>')
        return "-"
    user_link.short_description = 'User'
    user_link.allow_tags = True

    def full_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}" if obj.user else "-"
    full_name.short_description = 'Full Name'
    full_name.admin_order_field = 'user__first_name'

    def save_model(self, request, obj, form, change):
        if not obj.pk:
            obj.created_by = request.user
        obj.updated_by = request.user
        super().save_model(request, obj, form, change)


class FarmerProfileInline(admin.StackedInline):
    """Inline admin for FarmerProfile, used in User admin."""
    model = FarmerProfile
    can_delete = False
    verbose_name_plural = 'Farmer Profile'
    fk_name = 'user'
    fields = ('phone', 'region', 'district', 'is_verified', 'is_lead_farmer')
    readonly_fields = ('created_at', 'updated_at')


# Register models with their respective admin classes
admin.site.register(FarmerProfile, FarmerProfileAdmin)
admin.site.register(FarmType, FarmTypeAdmin)
