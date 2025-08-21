from rest_framework import serializers

from .models import ClickEvent, SignupEvent

class ClickEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClickEvent
        fields = [
            'id',
            'referral_link',
            'ip',
            'user_agent',
            'geo_country',
            'geo_city',
            'geo_region',
            'fraud_score',
            'timestamp'
        ]
        read_only_fields = ['id', 'fraud_score', 'timestamp']

        
        
class SignupEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = SignupEvent
        fields = [
            'id',
            'referral_link',
            'click_event',
            'conversion_minutes',
            'fraud_score',
            'timestamp'
        ]
        read_only_fields = ['id', 'conversion_minutes', 'timestamp']