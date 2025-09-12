import pytest
from django.utils import timezone
from ..dashboard_service.admin_dashbaord.serializers import (
    CampaignCreateUpdateSerializer,
    OfficerCreateSerializer,
    OfficerCampaignAssignmentCreateSerializer,
    ReferralLinkCreateSerializer,
    DailyMetricsSerializer,
)

pytestmark = pytest.mark.django_db

def test_campaign_end_date_must_be_after_start_date():
    start = timezone.now()
    end = start - timezone.timedelta(days=1)
    serializer = CampaignCreateUpdateSerializer(data={"name": "Bad Campaign", "start_date": start, "end_date": end})
    assert not serializer.is_valid()
    assert "end_date" in serializer.errors

def test_campaign_name_must_be_unique(campaign_factory):
    campaign = campaign_factory(name="Unique Name")
    serializer = CampaignCreateUpdateSerializer(data={"name": "Unique Name", "start_date": campaign.start_date, "end_date": campaign.end_date})
    assert not serializer.is_valid()
    assert "name" in serializer.errors

def test_officer_create_serializer_inactive_user(user_factory):
    user = user_factory(is_active=False)
    serializer = OfficerCreateSerializer(data={"user": user.id})
    serializer.context["request"] = None
    assert not serializer.is_valid()
    assert "user" in serializer.errors

def test_officer_campaign_assignment_serializer(campaign_factory, officer_factory):
    campaign = campaign_factory()
    officer = officer_factory(user__is_active=False)
    serializer = OfficerCampaignAssignmentCreateSerializer(data={"officer": officer.id, "campaign": campaign.id})
    assert not serializer.is_valid()
    assert "officer" in serializer.errors

def test_referral_link_serializer_requires_assignment(officer_factory, campaign_factory):
    officer = officer_factory()
    campaign = campaign_factory()
    serializer = ReferralLinkCreateSerializer(data={"officer": officer.id, "campaign": campaign.id})
    assert not serializer.is_valid()
    assert "assignment" in serializer.errors

def test_daily_metrics_serializer_signups_cannot_exceed_clicks(campaign_factory, officer_factory, referral_link_factory):
    campaign = campaign_factory()
    officer = officer_factory()
    referral = referral_link_factory(campaign=campaign, officer=officer)
    serializer = DailyMetricsSerializer(data={
        "campaign": campaign.id,
        "officer": officer.id,
        "referral_link": referral.id,
        "metric_date": timezone.now().date(),
        "total_clicks": 5,
        "total_signups": 10,
    })
    assert not serializer.is_valid()
    assert "non_field_errors" in serializer.errors or "__all__" in serializer.errors
