from django.contrib import admin
from .models import Crop


@admin.register(Crop)
class CropAdmin(admin.ModelAdmin):
    list_display = ("name", "season", "soil_type")
    search_fields = ("name",)
