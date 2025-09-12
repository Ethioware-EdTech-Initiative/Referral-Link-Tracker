import pytest
from dashboard_service.recruitment_officer.serializers import (
    OfficerCampaignSerializer,
    OfficerReferralLinkSerializer,
    OfficerDailyMetricsSerializer,
)

pytestmark = pytest.mark.django_db

def test_officer_campaign_serializer_returns_expected_fields(campaign_factory):
    campaign = campaign_factory()
    serializer = OfficerCampaignSerializer(campaign)
    data = serializer.data
    assert set(data.keys()) == {"id", "name", "start_date", "end_date", "is_active"}

def test_officer_referral_link_serializer_returns_expected_fields(referral_link_factory):
    referral = referral_link_factory()
    serializer = OfficerReferralLinkSerializer(referral)
    data = serializer.data
    assert "ref_code" in data
    assert "click_count" in data
    assert "signup_count" in data

def test_officer_daily_metrics_serializer_returns_expected_fields(daily_metrics_factory):
    metrics = daily_metrics_factory()
    serializer = OfficerDailyMetricsSerializer(metrics)
    data = serializer.data
    assert "total_clicks" in data
    assert "total_signups" in data
    assert "click_to_signup_rate" in data
