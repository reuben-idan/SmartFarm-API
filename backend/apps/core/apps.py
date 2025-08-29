from django.apps import AppConfig


class CoreConfig(AppConfig):
    """
    Core application configuration.
    """
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.core'
    verbose_name = 'Core'
    
    def ready(self):
        """
        Override this to perform initialization tasks when Django starts.
        """
        # Import signals to register them
        try:
            import apps.core.signals  # noqa F401
        except ImportError:
            pass
