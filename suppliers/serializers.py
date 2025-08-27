from typing import Any, Dict, List, Optional
from rest_framework import serializers
from .models import Supplier


class ProductItemSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255)
    unit = serializers.CharField(max_length=50)
    price = serializers.FloatField(required=False, allow_null=True)


class SupplierSerializer(serializers.ModelSerializer):
    product_list = ProductItemSerializer(many=True)
    owner = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Supplier
        fields = [
            'id',
            'owner',
            'name',
            'product_list',
            'location',
            'phone',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'owner']

    def create(self, validated_data: Dict[str, Any]) -> Supplier:
        products = validated_data.pop('product_list', [])
        instance = Supplier.objects.create(**validated_data, product_list=products)
        return instance

    def update(self, instance: Supplier, validated_data: Dict[str, Any]) -> Supplier:
        products = validated_data.pop('product_list', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if products is not None:
            instance.product_list = products
        instance.save()
        return instance
