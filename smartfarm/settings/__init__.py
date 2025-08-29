from .base import *  # noqa

# Import environment specific settings
try:
    from .local import *  # noqa
except ImportError:
    from .production import *  # noqa
