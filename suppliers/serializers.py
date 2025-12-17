from rest_framework import serializers
from .models import Supplier, Product


class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = '__all__'
        read_only_fields = ['is_verified', 'verification_date', 'verified_by']


class ProductSerializer(serializers.ModelSerializer):
    supplier = SupplierSerializer(read_only=True)
    
    class Meta:
        model = Product
        fields = '__all__'