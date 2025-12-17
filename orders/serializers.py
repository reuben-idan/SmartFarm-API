from rest_framework import serializers
from .models import Order, OrderItem

class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'quantity', 'price', 'subtotal']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    farmer_name = serializers.CharField(source='farmer.get_full_name', read_only=True)
    
    class Meta:
        model = Order
        fields = ['id', 'farmer', 'farmer_name', 'status', 'payment_method', 
                  'total_amount', 'delivery_location', 'phone_number', 
                  'items', 'created_at', 'updated_at']
        read_only_fields = ['farmer', 'total_amount']
    
    def create(self, validated_data):
        items_data = validated_data.pop('items')
        order = Order.objects.create(**validated_data)
        
        total = 0
        for item_data in items_data:
            item = OrderItem.objects.create(order=order, **item_data)
            total += item.subtotal
        
        order.total_amount = total
        order.save()
        return order
