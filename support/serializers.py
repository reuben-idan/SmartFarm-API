from rest_framework import serializers
from .models import HelpRequest, HelpStatus


class HelpRequestSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = HelpRequest
        fields = [
            'id', 'user', 'message', 'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

    def validate_message(self, value: str):
        if not value or not value.strip():
            raise serializers.ValidationError("Message cannot be empty")
        return value
