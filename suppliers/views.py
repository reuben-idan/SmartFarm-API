from django.db.models import Q
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .models import Supplier, Product
from .serializers import SupplierSerializer, ProductSerializer
from .permissions import IsOwnerOrStaff


class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        qs = super().get_queryset()
        search = self.request.query_params.get('search') or self.request.query_params.get('q')
        if search:
            qs = qs.filter(Q(name__icontains=search) | Q(product_list__icontains=search))
        location = self.request.query_params.get('location')
        if location:
            qs = qs.filter(location__icontains=location)
        return qs

    def perform_create(self, serializer):
        owner = self.request.user if self.request.user.is_authenticated else None
        serializer.save(owner=owner)


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.select_related('supplier').filter(supplier__is_verified=True)
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        qs = super().get_queryset()
        category = self.request.query_params.get('category')
        if category:
            qs = qs.filter(category=category)
        return qs