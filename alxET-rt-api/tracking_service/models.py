from django.db import models
from dashboard_service.models import ReferralLink
import uuid

class ClickEvent(models.Model):
    id = models.UUIDField(primary_key=True, editable=False, default=uuid.uuid4)
    referral_link = models.ForeignKey(ReferralLink, on_delete=models.CASCADE, related_name='click_events')
    timestamp = models.DateTimeField(auto_now_add=True)
    ip = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=512, null=True, blank=True)
    geo_country = models.CharField(max_length=64, null=True, blank=True)
    geo_city = models.CharField(max_length=64, null=True, blank=True)
    geo_region = models.CharField(max_length=64, null=True, blank=True)
    fraud_score = models.FloatField(default=0.0)
    

    def __str__(self):
        return f"ClickEvent {self.id}"
    
class SignupEvent(models.Model):
    id = models.UUIDField(primary_key=True, editable=False, default=uuid.uuid4)
    click_event = models.ForeignKey(ClickEvent, on_delete=models.CASCADE, related_name='signup_events')
    referral_link = models.ForeignKey(ReferralLink, on_delete=models.CASCADE, related_name='signup_events')
    timestamp = models.DateTimeField(auto_now_add=True)
    conversion_minutes = models.PositiveIntegerField(null=True, blank=True)
    fraud_score = models.FloatField(default=0.0)

    def __str__(self):
        return f"SignupEvent {self.id}"
    
class FraudFindings(models.Model):
    id = models.UUIDField(primary_key=True, editable=False, default=uuid.uuid4)
    event_type = models.CharField(max_length=50, choices=[
        ('click', 'ClickEvent'),
        ('signup', 'SignupEvent')
    ])
    event_id =models.UUIDField()
    fraud_score = models.FloatField(default=0.0)
    findings_details = models.TextField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"FraudFinding for Event {self.event_id}"

