from django.apps import AppConfig


class FarmersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.farmers'

    def ready(self):
        # Import signals to register them
        import apps.farmers.signals
