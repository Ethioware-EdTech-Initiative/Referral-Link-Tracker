import pytest
from rest_framework.test import APIClient
from django.urls import reverse
from dashboard_service.Tests.conftest import (
    UserFactory, OfficerFactory, CampaignFactory,
    ReferralLinkFactory, DailyMetricsFactory, OfficerCampaignAssignmentFactory
)
from dashboard_service.models import ReferralLink


@pytest.mark.django_db
class TestReferralLinkViewSet:

    @pytest.fixture
    def api_client(self):
        return APIClient()

    @pytest.fixture
    def officer_user(self):
        user = UserFactory()
        OfficerFactory(user=user)
        return user

    def test_queryset_returns_only_officer_links(self, api_client, officer_user):
        officer = officer_user.officer_profile
        ref = ReferralLinkFactory(officer=officer)
        ReferralLinkFactory()  # another officer

        api_client.force_authenticate(officer_user)
        url = reverse("officer-link-list")
        response = api_client.get(url)
        assert response.status_code == 200

        data = response.data.get("results", response.data)
        qs_ids = set(str(x) for x in ReferralLink.objects.filter(officer=officer).values_list("id", flat=True))
        for item in data:
            assert str(item["id"]) in qs_ids



    def test_unauthenticated_access_denied(self, api_client):
        url = reverse("officer-link-list")
        response = api_client.get(url)
        assert response.status_code == 401


@pytest.mark.django_db
class TestStatsViewSet:

    @pytest.fixture
    def api_client(self):
        return APIClient()

    @pytest.fixture
    def officer_user(self):
        user = UserFactory()
        OfficerFactory(user=user)
        return user

    def test_list_calculates_stats_correctly(self, api_client, officer_user):
        officer = officer_user.officer_profile
        api_client.force_authenticate(officer_user)

        DailyMetricsFactory(officer=officer, total_clicks=10, total_signups=5)
        DailyMetricsFactory(officer=officer, total_clicks=20, total_signups=10)
        ReferralLinkFactory(officer=officer, is_active=True)
        ReferralLinkFactory(officer=officer, is_active=False)

        campaign_active = CampaignFactory(is_active=True)
        campaign_inactive = CampaignFactory(is_active=False)
        OfficerCampaignAssignmentFactory(officer=officer, campaign=campaign_active)
        OfficerCampaignAssignmentFactory(officer=officer, campaign=campaign_inactive)

        url = reverse("officer-stats-list")
        response = api_client.get(url)
        data = response.data
        assert response.status_code == 200
        assert data["total_clicks"] == 30
        assert data["total_signups"] == 15
        assert data["conversion_rate"] == 50.0
        assert data["active_links"] == 1
        assert data["active_campaigns"] == 1

    def test_list_handles_zero_clicks(self, api_client, officer_user):
        officer = officer_user.officer_profile
        api_client.force_authenticate(officer_user)

        DailyMetricsFactory(officer=officer, total_clicks=0, total_signups=5)

        url = reverse("officer-stats-list")
        response = api_client.get(url)
        data = response.data
        assert response.status_code == 200
        assert data["conversion_rate"] == 0

    def test_timeline_returns_ordered_metrics(self, api_client, officer_user):
        officer = officer_user.officer_profile
        api_client.force_authenticate(officer_user)

        m1 = DailyMetricsFactory(officer=officer, metric_date="2025-01-01")
        m2 = DailyMetricsFactory(officer=officer, metric_date="2025-01-02")

        url = reverse("officer-stats-timeline")
        response = api_client.get(url)
        assert response.status_code == 200
        dates = [item["metric_date"] for item in response.data]
        assert dates == sorted(dates)

    def test_campaigns_returns_aggregated_data_per_campaign(self, api_client, officer_user):
        officer = officer_user.officer_profile
        api_client.force_authenticate(officer_user)

        campaign1 = CampaignFactory()
        campaign2 = CampaignFactory()
        DailyMetricsFactory(officer=officer, campaign=campaign1, total_clicks=10, total_signups=5)
        DailyMetricsFactory(officer=officer, campaign=campaign1, total_clicks=20, total_signups=10)
        DailyMetricsFactory(officer=officer, campaign=campaign2, total_clicks=5, total_signups=2)

        url = reverse("officer-stats-campaigns")
        response = api_client.get(url)
        data = {row["campaign_id"]: row for row in response.data}

        assert response.status_code == 200
        assert data[campaign1.id]["clicks"] == 30
        assert data[campaign1.id]["signups"] == 15
        assert data[campaign1.id]["conversion_rate"] == 50.0

        assert data[campaign2.id]["clicks"] == 5
        assert data[campaign2.id]["signups"] == 2
        assert round(data[campaign2.id]["conversion_rate"], 2) == 40.0

    def test_unauthenticated_access_denied(self, api_client):
        url = reverse("officer-stats-list")
        response = api_client.get(url)
        assert response.status_code == 401
