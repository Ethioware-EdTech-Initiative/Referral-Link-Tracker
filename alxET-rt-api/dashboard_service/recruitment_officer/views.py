# dashboard_services/recruitment_officer/views.py

from django.db.models import Sum, Count
from rest_framework import generics, views, response, permissions
from ..models import ReferralLink, DailyMetrics, Campaign
from .serializers import (
    OfficerReferralLinkSerializer,
    OfficerDailyMetricsSerializer,
)


class ReferralLinkListView(generics.ListAPIView):
    serializer_class = OfficerReferralLinkSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ReferralLink.objects.filter(officer=self.request.user.officer_profile)


class ReferralLinkDetailView(generics.RetrieveAPIView):
    serializer_class = OfficerReferralLinkSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = "id"

    def get_queryset(self):
        return ReferralLink.objects.filter(officer=self.request.user.officer_profile)


class ReferralLinkRevokeView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, id):
        link = ReferralLink.objects.filter(
            officer=request.user.officer_profile, id=id
        ).first()
        if not link:
            return response.Response({"detail": "Not found."}, status=404)

        link.is_active = False
        link.save(update_fields=["is_active"])
        return response.Response({
            "id": str(link.id),
            "is_active": link.is_active,
            "revoke_at": link.revoke_at,
        })


class KPIView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        officer = request.user.officer_profile
        qs = DailyMetrics.objects.filter(officer=officer)

        total_clicks = qs.aggregate(Sum("total_clicks"))["total_clicks__sum"] or 0
        total_signups = qs.aggregate(Sum("total_signups"))["total_signups__sum"] or 0
        conversion_rate = (total_signups / total_clicks * 100) if total_clicks > 0 else 0

        active_links = ReferralLink.objects.filter(officer=officer, is_active=True).count()
        active_campaigns = Campaign.objects.filter(
            officer_assignments__officer=officer, is_active=True
        ).distinct().count()

        data = {
            "total_clicks": total_clicks,
            "total_signups": total_signups,
            "conversion_rate": round(conversion_rate, 2),
            "active_links": active_links,
            "active_campaigns": active_campaigns,
        }
        return response.Response(data)


class TimelineView(generics.ListAPIView):
    serializer_class = OfficerDailyMetricsSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        officer = self.request.user.officer_profile
        return DailyMetrics.objects.filter(officer=officer).order_by("metric_date")


class CampaignBreakdownView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        officer = request.user.officer_profile
        qs = (
            DailyMetrics.objects.filter(officer=officer)
            .values("campaign_id", "campaign__name", "campaign__start_date", "campaign__end_date")
            .annotate(
                clicks=Sum("total_clicks"),
                signups=Sum("total_signups"),
            )
        )

        data = []
        for row in qs:
            clicks = row["clicks"] or 0
            signups = row["signups"] or 0
            conversion_rate = (signups / clicks * 100) if clicks > 0 else 0

            data.append({
                "campaign_id": row["campaign_id"],
                "campaign_name": row["campaign__name"],
                "clicks": clicks,
                "signups": signups,
                "conversion_rate": round(conversion_rate, 2),
                "start_date": row["campaign__start_date"],
                "end_date": row["campaign__end_date"],
            })

        return response.Response(data)
