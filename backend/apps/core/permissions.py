from rest_framework import permissions


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    Assumes the model has an 'owner' attribute.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the owner
        return obj.owner == request.user


class IsFarmer(permissions.BasePermission):
    """
    Permission class to check if the user is a farmer.
    """
    def has_permission(self, request, view):
        return hasattr(request.user, 'is_farmer') and request.user.is_farmer


class IsFarmerOwner(permissions.BasePermission):
    """
    Permission class to check if the user is the owner of the farmer profile.
    """
    def has_object_permission(self, request, view, obj):
        # Allow read permissions to any request
        if request.method in permissions.SAFE_METHODS:
            return True
            
        # Only allow the farmer who owns the profile to modify it
        return obj.user == request.user


class IsSupplier(permissions.BasePermission):
    """
    Permission class to check if the user is a supplier.
    """
    def has_permission(self, request, view):
        return hasattr(request.user, 'is_supplier') and request.user.is_supplier


class IsSupplierOwner(permissions.BasePermission):
    """
    Permission class to check if the user is the owner of the supplier entry.
    """
    def has_object_permission(self, request, view, obj):
        # Allow read permissions to any request
        if request.method in permissions.SAFE_METHODS:
            return True
            
        # Only allow the supplier who owns the entry to modify it
        return obj.user == request.user


class IsStaffOrReadOnly(permissions.BasePermission):
    """
    Permission class to allow read-only access to all users,
    but only allow write access to staff users.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_staff


class IsOwnerOrStaff(permissions.BasePermission):
    """
    Permission class to allow access to object owners or staff users.
    Assumes the model has a 'user' attribute.
    """
    def has_object_permission(self, request, view, obj):
        return obj.user == request.user or request.user.is_staff
