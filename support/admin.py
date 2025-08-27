from django.contrib import admin
from .models import HelpRequest, HelpStatus


@admin.register(HelpRequest)
class HelpRequestAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "status", "created_at", "updated_at")
    list_filter = ("status", "created_at")
    search_fields = ("message", "user__username")
    autocomplete_fields = ("user",)
    readonly_fields = ("created_at", "updated_at")
