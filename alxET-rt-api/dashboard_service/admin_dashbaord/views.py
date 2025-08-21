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

from ..utils import generate_referral_code
from django.conf import settings


class OfficerViewSet(viewsets.ModelViewSet):

    queryset = Officer.objects.select_related("user")
    serializer_class = OfficerSerializer
    http_method_names = ["get", "delete"]

    def create(self, request, *args, **kwargs):
        return Response({"detail": "Create not allowed for officers."},
                        status=status.HTTP_405_METHOD_NOT_ALLOWED)

    def update(self, request, *args, **kwargs):
        return Response({"detail": "Update not allowed for officers."},
                        status=status.HTTP_405_METHOD_NOT_ALLOWED)

    def partial_update(self, request, *args, **kwargs):
        return Response({"detail": "Partial update not allowed for officers."},
                        status=status.HTTP_405_METHOD_NOT_ALLOWED)


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

    queryset = ReferralLink.objects.select_related("officer__user", "campaign")
    http_method_names = ["get", "delete", "post"]
    
    def get_serializer_class(self):
        if self.action == "create_link":
            return ReferralLinkCreateSerializer
        return ReferralLinkSerializer

    def create(self, request, *args, **kwargs):
        return Response({"detail": "Direct create not allowed. Use /links/create-link/."},
                        status=status.HTTP_405_METHOD_NOT_ALLOWED)

    def update(self, request, *args, **kwargs):
        return Response({"detail": "Update not allowed for referral links."},
                        status=status.HTTP_405_METHOD_NOT_ALLOWED)

    def partial_update(self, request, *args, **kwargs):
        return Response({"detail": "Partial update not allowed for referral links."},
                        status=status.HTTP_405_METHOD_NOT_ALLOWED)

    @action(detail=False, methods=["post"], url_path="gen-link")
    def create_link(self, request):
        serializer = ReferralLinkCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        officer = serializer.validated_data["officer"]
        campaign = serializer.validated_data["campaign"]

        ref_code = generate_referral_code(str(campaign.id), str(officer.id), settings.SECRET_KEY)
        full_link = f"https://referral-link-tracker.vercel.app/alxET-rt-api/tracking/referral/{ref_code}/"

        referral_link = ReferralLink.objects.create(
            officer=officer,
            campaign=campaign,
            ref_code=ref_code,
            full_link=full_link,
            is_active=True,
        )

        return Response(ReferralLinkSerializer(referral_link).data, status=status.HTTP_201_CREATED)


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

