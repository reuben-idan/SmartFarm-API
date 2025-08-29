from rest_framework import serializers


class CropRecommendationSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    season = serializers.CharField()
    soil_type = serializers.CharField(allow_blank=True)
    regions = serializers.ListField(child=serializers.CharField())
    maturity_days = serializers.IntegerField()
    recommended_inputs = serializers.JSONField()
    score = serializers.FloatField()
