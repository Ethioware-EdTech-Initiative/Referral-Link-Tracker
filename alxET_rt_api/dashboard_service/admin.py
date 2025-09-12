from django.contrib import admin
from .models import Campaign, OfficerCampaignAssignment, ReferralLink, DailyMetrics
# Register your models here.

admin.site.register([Campaign, OfficerCampaignAssignment, ReferralLink, DailyMetrics])