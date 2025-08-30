from django.db import models
import uuid
from auth_service.models import Officer
from django.utils import timezone

class Campaign(models.Model):
    id = models.UUIDField(primary_key=True, editable=False, default=uuid.uuid4)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if self.end_date < timezone.now():
            self.is_active = False
        super().save(*args, **kwargs)

    @property
    def is_currently_active(self):
        return self.is_active and self.end_date >= timezone.now()
    
class OfficerCampaignAssignment(models.Model):
    id = models.UUIDField(primary_key=True, editable=False, default=uuid.uuid4)
    officer = models.ForeignKey('auth_service.Officer', on_delete=models.CASCADE, related_name='campaign_assignments')
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='officer_assignments')
    assigned_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.officer.user.full_name} - {self.campaign.name}"

class ReferralLink(models.Model):
    id = models.UUIDField(primary_key=True, editable=False, default=uuid.uuid4)
    officer = models.ForeignKey(Officer, on_delete=models.CASCADE, related_name='referral_links')
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='referral_links')
    full_link = models.URLField()
    ref_code = models.CharField(max_length=300, unique=True)
    click_count = models.PositiveIntegerField(default=0)
    signup_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    revoke_at = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"Referral Link for {self.officer.user.full_name} - {self.campaign.name}"
    
class DailyMetrics(models.Model):
    id = models.UUIDField(primary_key=True, editable=False, default=uuid.uuid4)
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='daily_metrics')
    officer = models.ForeignKey(Officer, on_delete=models.CASCADE, related_name='daily_metrics')
    referral_link = models.ForeignKey(ReferralLink, on_delete=models.CASCADE, related_name='daily_metrics')
    metric_date = models.DateField()
    total_clicks = models.PositiveIntegerField(default=0)
    total_signups = models.PositiveIntegerField(default=0)
    click_to_signup_rate = models.FloatField(default=0.0)


    def __str__(self):
        return f"Metrics for {self.campaign.name} on {self.metric_date}"