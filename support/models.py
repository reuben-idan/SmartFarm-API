from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class HelpStatus(models.TextChoices):
    OPEN = 'open', _('Open')
    IN_PROGRESS = 'in_progress', _('In Progress')
    CLOSED = 'closed', _('Closed')


class HelpRequest(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='help_requests')
    message = models.TextField()
    status = models.CharField(max_length=20, choices=HelpStatus.choices, default=HelpStatus.OPEN)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['user']),
        ]

    def __str__(self) -> str:
        return f"HelpRequest({self.user_id}, {self.status})"
