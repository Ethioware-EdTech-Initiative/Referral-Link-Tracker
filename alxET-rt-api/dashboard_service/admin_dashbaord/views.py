from django.db.models import Sum, F, Count
from django.utils.timezone import now, timedelta
from rest_framework.permissions import AllowAny
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from tracking_service.models import ClickEvent, SignupEvent
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

    @action(detail=False, methods=["post"], url_path="gen-link")
    def create_link(self, request):
        serializer = ReferralLinkCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        officer = serializer.validated_data["officer"]
        campaign = serializer.validated_data["campaign"]

        ref_code = generate_referral_code(str(campaign.id), str(officer.id), settings.SECRET_KEY)
        full_link = f"https://admissions.alxafrica.com/users/sign_up/track?refcode={ref_code}"

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
    permission_classes = [AllowAny] # Add appropriate authentication classes
    def list(self, request):

        return Response({
            "funnel": self._get_funnel(),
            "leaderboard": self._get_leaderboard(),
            "campaigns": self._get_campaigns(),
            "daily_trends": self._get_trends(),
            "geo_heatmap": self._get_geo(),
        })

    def _get_funnel(self):
        total_clicks = DailyMetrics.objects.aggregate(total=Sum("total_clicks"))["total"] or 0
        total_signups = DailyMetrics.objects.aggregate(total=Sum("total_signups"))["total"] or 0
        conversion_rate = (total_signups / total_clicks * 100) if total_clicks > 0 else 0
        return {
            "total_clicks": total_clicks,
            "total_signups": total_signups,
            "conversion_rate": conversion_rate,
        }

    def _get_leaderboard(self):
        officers = (
            DailyMetrics.objects
            .values("officer_id", "officer__user__full_name")
            .annotate(total_clicks=Sum("total_clicks"), total_signups=Sum("total_signups"))
        )
        results = []
        for officer in officers:
            clicks, signups = officer["total_clicks"] or 0, officer["total_signups"] or 0
            rate = (signups / clicks * 100) if clicks > 0 else 0
            score = signups + rate
            results.append({
                "officer_id": officer["officer_id"],
                "officer_name": officer["officer__user__full_name"],
                "total_clicks": clicks,
                "total_signups": signups,
                "conversion_rate": rate,
                "conversion_score": score,
            })
        return sorted(results, key=lambda x: x["conversion_score"], reverse=True)

    def _get_campaigns(self):
        campaigns = (
            DailyMetrics.objects
            .values("campaign_id", "campaign__name", "campaign__start_date", "campaign__end_date")
            .annotate(total_clicks=Sum("total_clicks"), total_signups=Sum("total_signups"))
        )
        results = []
        for c in campaigns:
            clicks, signups = c["total_clicks"] or 0, c["total_signups"] or 0
            rate = (signups / clicks * 100) if clicks > 0 else 0
            duration_days = (c["campaign__end_date"] - c["campaign__start_date"]).days or 1
            avg_signups = signups / duration_days
            results.append({
                "campaign_id": c["campaign_id"],
                "campaign_name": c["campaign__name"],
                "total_clicks": clicks,
                "total_signups": signups,
                "conversion_rate": rate,
                "avg_signups_per_day": avg_signups,
            })
        return results

    def _get_trends(self):
        range_days = 90
        start_date = now().date() - timedelta(days=range_days)
        metrics = (
            DailyMetrics.objects
            .filter(metric_date__gte=start_date)
            .values("metric_date")
            .annotate(total_clicks=Sum("total_clicks"), total_signups=Sum("total_signups"))
            .order_by("metric_date")
        )
        results = []
        for m in metrics:
            clicks, signups = m["total_clicks"] or 0, m["total_signups"] or 0
            rate = (signups / clicks * 100) if clicks > 0 else 0
            results.append({
                "date": m["metric_date"],
                "total_clicks": clicks,
                "total_signups": signups,
                "conversion_rate": rate,
            })
        return results

    def _get_geo(self):
        total_clicks = ClickEvent.objects.count()
        total_signups = SignupEvent.objects.count()

        country_data = (
            ClickEvent.objects
            .values("geo_country")
            .annotate(
                total_clicks=Count("id"),
                total_signups=Count("signup_events")
            )
            .order_by("-total_clicks")
        )

        region_data = (
            ClickEvent.objects
            .values("geo_country", "geo_region")
            .annotate(
                total_clicks=Count("id"),
                total_signups=Count("signup_events")
            )
            .order_by("-total_clicks")
        )

        city_data = (
            ClickEvent.objects
            .values("geo_country", "geo_city")
            .annotate(
                total_clicks=Count("id"),
                total_signups=Count("signup_events")
            )
            .order_by("-total_clicks")[:10]
        )

        def format_data(qs, keys):
            results = []
            for item in qs:
                clicks = item["total_clicks"] or 0
                signups = item["total_signups"] or 0
                entry = {k: item.get(k) or "Unknown" for k in keys}
                entry.update({
                    "total_clicks": clicks,
                    "total_signups": signups,
                    "conversion_rate": (signups / clicks * 100) if clicks > 0 else 0
                })
                results.append(entry)
            return results

        return {
            "total_clicks": total_clicks,
            "total_signups": total_signups,
            "top_countries": format_data(country_data, ["geo_country"]),
            "top_regions": format_data(region_data, ["geo_region"]),
            "top_cities": format_data(city_data, ["geo_city"]),
        }
