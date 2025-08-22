from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsOwnerOrStaff(BasePermission):
    """Allow owners full access to their own tickets. Staff can view all and update status."""

    def has_object_permission(self, request, view, obj):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        # Owner: full CRUD
        if obj.user_id == user.id:
            return True
        # Staff roles
        is_staff_role = getattr(user, 'is_staff', False) or getattr(user, 'is_agronomist', False) or getattr(user, 'is_extension_officer', False)
        if is_staff_role:
            # Staff can read any and update status via view-enforced restriction
            if request.method in SAFE_METHODS:
                return True
            # For non-safe methods, allow, but view will restrict fields updated/deleted
            return True
        return False
