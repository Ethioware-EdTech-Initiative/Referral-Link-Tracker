from django.db.models import Sum, F, Count
from django.utils.timezone import now, timedelta

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from ..models import Campaign, OfficerCampaignAssignment, ReferralLink, DailyMetrics
from auth_service.models import Officer, Audit_Log
from .serializers import (
    OfficerSerializer,
    OfficerCreateSerializer,
    CampaignSerializer,
    CampaignCreateUpdateSerializer,
    OfficerCampaignAssignmentSerializer,
    OfficerCampaignAssignmentCreateSerializer,
    ReferralLinkSerializer,
    ReferralLinkCreateSerializer,
    DailyMetricsSerializer,
    AuditLogSerializer,
)


class OfficerViewSet(viewsets.ModelViewSet):
    queryset = Officer.objects.all()

    def get_serializer_class(self):
        if self.action == "create":
            return OfficerCreateSerializer
        return OfficerSerializer


class CampaignViewSet(viewsets.ModelViewSet):
    queryset = Campaign.objects.all()

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return CampaignCreateUpdateSerializer
        return CampaignSerializer


class OfficerCampaignAssignmentViewSet(viewsets.ModelViewSet):
    queryset = OfficerCampaignAssignment.objects.all()

    def get_serializer_class(self):
        if self.action == "create":
            return OfficerCampaignAssignmentCreateSerializer
        return OfficerCampaignAssignmentSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        campaign_id = self.request.query_params.get("campaign_id")
        if campaign_id:
            queryset = queryset.filter(campaign_id=campaign_id)
        return queryset


class ReferralLinkViewSet(viewsets.ModelViewSet):
    queryset = ReferralLink.objects.all()

    def get_serializer_class(self):
        if self.action == "create":
            return ReferralLinkCreateSerializer
        return ReferralLinkSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        officer_id = self.request.query_params.get("officer_id")
        if officer_id:
            queryset = queryset.filter(officer_id=officer_id)
        return queryset


class DailyMetricsViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = DailyMetrics.objects.all()
    serializer_class = DailyMetricsSerializer


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Audit_Log.objects.all()
    serializer_class = AuditLogSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        user_id = self.request.query_params.get("user_id")
        action = self.request.query_params.get("action")
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        if action:
            queryset = queryset.filter(action__iexact=action)
        return queryset



class StatsViewSet(viewsets.ViewSet):

    def list(self, request):

        return Response({
            "funnel": self._get_funnel(),
            "leaderboard": self._get_leaderboard(),
            "campaigns": self._get_campaigns(),
            "daily_trends": self._get_trends(),
            "geo_heatmap": self._get_geo(),
        })

    def _get_funnel(self):
        
        return []

    def _get_leaderboard(self):
        
        return []

    def _get_campaigns(self):
        
        return []

    def _get_trends(self):

        return  []

    def _get_geo(self):

        return []

