from django.contrib import admin
from .models import Supplier


@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = ('name', 'location', 'phone', 'owner')
    search_fields = ('name', 'location', 'phone')
    list_filter = ('location',)
