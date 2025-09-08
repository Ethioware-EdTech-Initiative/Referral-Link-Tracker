from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import (
    OfficerViewSet,
    CampaignViewSet,
    OfficerCampaignAssignmentViewSet,
    ReferralLinkViewSet,
    DailyMetricsViewSet,
    StatsViewSet,
)

router = DefaultRouter()
router.register(r"officers", OfficerViewSet, basename="officer")
router.register(r"campaigns", CampaignViewSet, basename="campaign")
router.register(r"assignments", OfficerCampaignAssignmentViewSet, basename="assignment")
router.register(r"links", ReferralLinkViewSet, basename="referral-link")
router.register(r"metrics", DailyMetricsViewSet, basename="metrics")
router.register(r"stats", StatsViewSet, basename="stats")

router.register(r"assignments", OfficerCampaignAssignmentViewSet, basename="officercampaignassignment")
router.register(r"metrics", DailyMetricsViewSet, basename="dailymetrics")


urlpatterns = [
    path("admin-dash/", include(router.urls)),
]
