"""Settings package for SmartFarm API.

This package contains all the settings for the SmartFarm API project.
"""

# Import the appropriate settings based on the environment
import os

# Default to development settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')

# Import environment-specific settings by DJANGO_ENV
ENVIRONMENT = os.environ.get('DJANGO_ENV', 'development')
if ENVIRONMENT == 'production':
    from .production import *  # type: ignore  # noqa
elif ENVIRONMENT == 'test':
    from .test import *  # type: ignore  # noqa
else:
    from .development import *  # type: ignore  # noqa
