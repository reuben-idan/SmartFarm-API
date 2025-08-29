from rest_framework import permissions

class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow admins to create, update, or delete objects.
    Read access is allowed to any authenticated user.
    """
    def has_permission(self, request, view):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions are only allowed to admin users.
        return request.user and request.user.is_staff

class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object or admins to edit it.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True
            
        # Write permissions are only allowed to the owner or admin users
        return obj.user == request.user or request.user.is_staff

class IsFarmerOrAdmin(permissions.BasePermission):
    """
    Custom permission to only allow farmers or admins to access certain views.
    """
    def has_permission(self, request, view):
        return request.user and (request.user.is_staff or hasattr(request.user, 'farmer_profile'))

class IsYieldForecastOwnerOrAdmin(permissions.BasePermission):
    """
    Custom permission to only allow the owner of a yield forecast or admin to access it.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True
            
        # Write permissions are only allowed to the owner (if applicable) or admin users
        if hasattr(obj, 'user'):
            return obj.user == request.user or request.user.is_staff
        return request.user.is_staff
