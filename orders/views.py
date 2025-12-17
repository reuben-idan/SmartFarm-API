from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Order
from .serializers import OrderSerializer

class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return Order.objects.all()
        return Order.objects.filter(farmer=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(farmer=self.request.user)
    
    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        order = self.get_object()
        order.status = 'confirmed'
        order.save()
        return Response({'status': 'order confirmed'})
    
    @action(detail=True, methods=['post'])
    def deliver(self, request, pk=None):
        order = self.get_object()
        order.status = 'delivered'
        order.save()
        return Response({'status': 'order delivered'})
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        order = self.get_object()
        order.status = 'cancelled'
        order.save()
        return Response({'status': 'order cancelled'})
