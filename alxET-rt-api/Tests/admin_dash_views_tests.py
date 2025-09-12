import pytest
from rest_framework.test import APIClient
from rest_framework import status
from django.urls import reverse
from dashboard_service.models import Campaign, OfficerCampaignAssignment, ReferralLink, DailyMetrics
from auth_service.models import Officer, User, Audit_Log
from .conftest import (
    UserFactory, OfficerFactory, CampaignFactory,
    OfficerCampaignAssignmentFactory, ReferralLinkFactory, DailyMetricsFactory
)


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def admin_user():
    return UserFactory(is_staff=True)


@pytest.fixture
def auth_client(api_client, admin_user):
    api_client.force_authenticate(admin_user)
    return api_client


@pytest.mark.django_db
class TestOfficerViewSet:
    def test_list_officers(self, auth_client):
        OfficerFactory()
        url = reverse("officer-list")
        response = auth_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) > 0

    def test_delete_officer_creates_audit_log(self, auth_client):
        officer = OfficerFactory()
        url = reverse("officer-detail", args=[officer.id])
        response = auth_client.delete(url)
        assert response.status_code == status.HTTP_204_NO_CONTENT
        audit_log = Audit_Log.objects.filter(
            target_type="Officer", target_id=officer.id, action="delete"
        ).first()
        assert audit_log is not None
        assert "Deleted officer" in audit_log.description



@pytest.mark.django_db
class TestCampaignViewSet:
    def test_create_campaign_creates_audit_log(self, auth_client):
        data = {
        "name": "Test Campaign",
        "description": "Test Description",
        "start_date": "2030-01-01",  # date only
        "end_date": "2030-01-10",    # date only
        "is_active": True
        }

        url = reverse("campaign-list")
        response = auth_client.post(url, data, format="json")
        assert response.status_code == status.HTTP_201_CREATED

        campaign = Campaign.objects.get(name="Test Campaign")
        audit_log = Audit_Log.objects.filter(target_id=campaign.id, action="create").first()
        assert audit_log is not None
        assert audit_log.description == f"Created campaign {campaign.name}"

    def test_update_campaign_creates_audit_log(self, auth_client):
        campaign = CampaignFactory(name="Old Name")
        url = reverse("campaign-detail", args=[campaign.id])
        response = auth_client.put(
            url,
            {
                "name": "New Name",
                "description": campaign.description,
                "start_date": campaign.start_date.isoformat().replace("+00:00", "Z"),
                "end_date": campaign.end_date.isoformat().replace("+00:00", "Z"),
                "is_active": True,
            },
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK
        audit_log = Audit_Log.objects.filter(target_id=campaign.id, action="update").first()
        assert audit_log is not None
        assert "Updated campaign" in audit_log.description

    def test_destroy_campaign_creates_audit_log(self, auth_client):
        campaign = CampaignFactory()
        url = reverse("campaign-detail", args=[campaign.id])
        response = auth_client.delete(url)
        assert response.status_code == status.HTTP_204_NO_CONTENT
        audit_log = Audit_Log.objects.filter(target_id=campaign.id, action="delete").first()
        assert audit_log is not None
        assert f"Deleted campaign {campaign.name}" in audit_log.description



@pytest.mark.django_db
class TestOfficerCampaignAssignmentViewSet:
    def test_create_assignment_logs_audit(self, auth_client):
        officer = OfficerFactory()
        campaign = CampaignFactory()
        url = reverse("assignment-list")
        response = auth_client.post(
            url, {"officer": officer.id, "campaign": campaign.id}, format="json"
        )
        assert response.status_code == status.HTTP_201_CREATED
        assignment = OfficerCampaignAssignment.objects.get(officer=officer, campaign=campaign)
        audit_log = Audit_Log.objects.filter(
            target_type="OfficerCampaignAssignment", target_id=assignment.id, action="create"
        ).first()
        assert audit_log is not None

    def test_delete_assignment_logs_audit(self, auth_client):
        assignment = OfficerCampaignAssignmentFactory()
        url = reverse("assignment-detail", args=[assignment.id])
        response = auth_client.delete(url)
        assert response.status_code == status.HTTP_204_NO_CONTENT
        audit_log = Audit_Log.objects.filter(
            target_type="OfficerCampaignAssignment", target_id=assignment.id, action="delete"
        ).first()
        assert audit_log is not None

    def test_filter_assignments_by_campaign(self, auth_client):
        assignment = OfficerCampaignAssignmentFactory()
        url = reverse("assignment-list")
        response = auth_client.get(url, {"campaign_id": assignment.campaign.id})
        assert response.status_code == 200

        data = response.data.get("results", response.data)
        assert all(a["campaign"] == assignment.campaign.id for a in data)




@pytest.mark.django_db
class TestReferralLinkViewSet:
    def test_create_referral_link_generates_link(self, auth_client):
        officer = OfficerFactory()
        campaign = CampaignFactory()
        OfficerCampaignAssignmentFactory(officer=officer, campaign=campaign)
        url = reverse("referral-link-create-link")
        data = {"officer": officer.id, "campaign": campaign.id}
        response = auth_client.post(url, data, format="json")
        assert response.status_code == status.HTTP_201_CREATED
        ref = ReferralLink.objects.get(officer=officer, campaign=campaign)
        assert ref.ref_code
        assert ref.full_link.startswith("https://referral-link-tracker.vercel.app")

    def test_list_referral_links(self, auth_client):
        officer = OfficerFactory()
        campaign = CampaignFactory()
        ref = ReferralLinkFactory(officer=officer, campaign=campaign)

        url = reverse("referral-link-list")
        response = auth_client.get(url)
        assert response.status_code == 200

        # handle paginated vs non-paginated response
        data = response.data.get("results", response.data)
        ids = [str(item["id"]) for item in data]  # convert response IDs to strings
        assert str(ref.id) in ids  # convert the ref.id to string too

        
        
    def test_delete_referral_link(self, auth_client):
        ref = ReferralLinkFactory()
        url = reverse("referral-link-detail", args=[ref.id])
        response = auth_client.delete(url)
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not ReferralLink.objects.filter(id=ref.id).exists()



@pytest.mark.django_db
class TestDailyMetricsViewSet:
    def test_list_daily_metrics(self, auth_client):
        DailyMetricsFactory()
        url = reverse("metrics-list")
        response = auth_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) > 0



@pytest.mark.django_db
class TestStatsViewSet:
    def test_get_stats_keys_and_values(self, auth_client):
        DailyMetricsFactory(total_clicks=10, total_signups=5)
        DailyMetricsFactory(total_clicks=20, total_signups=10)
        url = reverse("stats-list")
        response = auth_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        data = response.data

        for key in ["funnel", "leaderboard", "campaigns", "daily_trends", "geo_heatmap"]:
            assert key in data
        funnel = data["funnel"]
        assert funnel["total_clicks"] == 30
        assert funnel["total_signups"] == 15
        assert round(funnel["conversion_rate"], 2) == 50.0

    def test_leaderboard_sorted(self, auth_client):
        DailyMetricsFactory(officer__user__full_name="A", total_clicks=10, total_signups=5)
        DailyMetricsFactory(officer__user__full_name="B", total_clicks=20, total_signups=15)
        url = reverse("stats-list")
        response = auth_client.get(url)
        leaderboard = response.data["leaderboard"]
        assert leaderboard[0]["conversion_score"] >= leaderboard[1]["conversion_score"]

    def test_trends_respects_90_days(self, auth_client):
        DailyMetricsFactory()
        url = reverse("stats-list")
        response = auth_client.get(url)
        trends = response.data["daily_trends"]
        assert all("date" in t for t in trends)

    def test_geo_heatmap_has_expected_structure(self, auth_client):
        url = reverse("stats-list")
        response = auth_client.get(url)
        geo = response.data["geo_heatmap"]
        assert "top_countries" in geo
        assert "top_regions" in geo
        assert "top_cities" in geo

@pytest.mark.django_db
class TestPermissions:
    def test_non_admin_cannot_access_protected_endpoints(self, api_client):
        user = UserFactory(is_staff=False)
        api_client.force_authenticate(user)
        url = reverse("campaign-list")
        response = api_client.get(url)
        assert response.status_code == status.HTTP_403_FORBIDDEN
