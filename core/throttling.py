from rest_framework.throttling import UserRateThrottle


class WriteOperationThrottle(UserRateThrottle):
    """
    Throttle for write operations (POST, PUT, PATCH, DELETE).
    Uses the 'write_ops' rate from settings.
    """
    rate = None
    scope = 'write_ops'

    def allow_request(self, request, view):
        # Only throttle write operations
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True
        return super().allow_request(request, view)


class BurstRateThrottle(UserRateThrottle):
    """
    Throttle for burst protection.
    Uses the 'burst' rate from settings.
    """
    scope = 'burst'
    rate = None


class SustainedRateThrottle(UserRateThrottle):
    """
    Throttle for sustained protection.
    Uses the 'sustained' rate from settings.
    """
    scope = 'sustained'
    rate = None
