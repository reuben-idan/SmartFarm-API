""
Test settings for SmartFarm project.
"""
from .base import *

# Use in-memory SQLite database for tests
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }
}

# Disable password hashing for faster tests
PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.MD5PasswordHasher',
]

# Use console email backend for tests
EMAIL_BACKEND = 'django.core.mail.backends.locmem.EmailBackend'

# Disable logging
import logging
logging.disable(logging.CRITICAL)

# Use faster password hasher for tests
PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.MD5PasswordHasher',
]

# Disable throttling during tests
REST_FRAMEWORK['DEFAULT_THROTTLE_RATES'] = {
    'anon': None,
    'user': None,
}

# Disable caching for tests
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.dummy.DummyCache',
    }
}

# Use a simpler secret key for tests
SECRET_KEY = 'test-secret-key-1234567890'

# Disable debug toolbar
DEBUG_TOOLBAR_CONFIG = {}

# Disable debug toolbar middleware
MIDDLEWARE = [
    m for m in MIDDLEWARE 
    if 'debug_toolbar' not in m
]

# Disable debug toolbar from installed apps
INSTALLED_APPS = [
    app for app in INSTALLED_APPS 
    if 'debug_toolbar' not in app
]

# Disable all external services
CELERY_TASK_ALWAYS_EAGER = True
CELERY_TASK_EAGER_PROPAGATES = True

# Disable file storage for tests
DEFAULT_FILE_STORAGE = 'inmemorystorage.InMemoryStorage'

# Disable whitenoise for tests
STATICFILES_STORAGE = None
WHITENOISE_AUTOREFRESH = True
WHITENOISE_USE_FINDERS = True

# Set test runner
TEST_RUNNER = 'django.test.runner.DiscoverRunner'

# Disable password validation for tests
AUTH_PASSWORD_VALIDATORS = []

# Set test email backend
EMAIL_BACKEND = 'django.core.mail.backends.locmem.EmailBackend'

# Set test media root
import tempfile
MEDIA_ROOT = tempfile.mkdtemp()

# Disable cache for tests
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.dummy.DummyCache',
    }
}

# Set test frontend URL
FRONTEND_URL = 'http://localhost:3000'
