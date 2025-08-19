from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import (
    OfficerViewSet,
    CampaignViewSet,
    OfficerCampaignAssignmentViewSet,
    ReferralLinkViewSet,
    DailyMetricsViewSet,
    AuditLogViewSet,
    StatsViewSet,
)

router = DefaultRouter()
router.register(r"officers", OfficerViewSet, basename="officer")
router.register(r"campaigns", CampaignViewSet, basename="campaign")
router.register(r"assignments", OfficerCampaignAssignmentViewSet, basename="assignment")
router.register(r"links", ReferralLinkViewSet, basename="referral-link")
router.register(r"metrics", DailyMetricsViewSet, basename="metrics")
router.register(r"audit-logs", AuditLogViewSet, basename="audit-log")
router.register(r"stats", StatsViewSet, basename="stats")

urlpatterns = [
    path("admin-dash/", include(router.urls)),
]
