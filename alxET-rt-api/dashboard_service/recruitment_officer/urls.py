from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import (
    ReferralLinkViewSet,
    StatsViewSet,
)

router = DefaultRouter()
router.register(r"links", ReferralLinkViewSet, basename="officer-link")
router.register(r"stats", StatsViewSet, basename="officer-stats")

urlpatterns = [
    path("officer-dash/", include(router.urls)),
]
