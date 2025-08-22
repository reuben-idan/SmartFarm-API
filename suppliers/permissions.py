from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsOwnerOrStaff(BasePermission):
    """Allow owners to manage their own supplier entries; staff can manage all."""

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        if request.user and request.user.is_staff:
            return True
        return getattr(obj, 'owner_id', None) == getattr(request.user, 'id', None)
