from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.db.models import Q

from .models import HelpRequest, HelpStatus
from .serializers import HelpRequestSerializer
from .permissions import IsOwnerOrStaff


class HelpRequestViewSet(viewsets.ModelViewSet):
    queryset = HelpRequest.objects.all()
    serializer_class = HelpRequestSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrStaff]
    pagination_class = None

    def get_queryset(self):
        user = self.request.user
        if getattr(user, 'is_agronomist', False) or getattr(user, 'is_extension_officer', False) or getattr(user, 'is_staff', False):
            # Staff can see all
            return HelpRequest.objects.all()
        # Owners see only their tickets
        return HelpRequest.objects.filter(user=user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def update(self, request, *args, **kwargs):
        return self._update_with_role_rules(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        return self._update_with_role_rules(request, *args, **kwargs)

    def _update_with_role_rules(self, request, *args, **kwargs):
        instance = self.get_object()
        user = request.user
        is_owner = instance.user_id == user.id
        is_staff_role = getattr(user, 'is_agronomist', False) or getattr(user, 'is_extension_officer', False) or getattr(user, 'is_staff', False)

        # Owners: can update any of their fields (message, status)
        # Staff: can only update status
        if not is_owner and is_staff_role:
            data = request.data.copy()
            allowed = {}
            if 'status' in data:
                allowed['status'] = data['status']
            if not allowed:
                return Response({'detail': 'Only status can be updated by staff'}, status=status.HTTP_400_BAD_REQUEST)
            serializer = self.get_serializer(instance, data=allowed, partial=True)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            return Response(serializer.data)
        else:
            # Owner or other cases (permission class already blocks non-authorized)
            partial = kwargs.pop('partial', True)
            serializer = self.get_serializer(instance, data=request.data, partial=partial)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        user = request.user
        if instance.user_id != user.id:
            # Prevent staff from deleting user's ticket
            return Response({'detail': 'Only the owner can delete the ticket'}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)
