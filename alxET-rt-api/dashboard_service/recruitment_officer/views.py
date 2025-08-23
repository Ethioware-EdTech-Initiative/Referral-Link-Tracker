from django.db.models import Sum
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import permissions
from ..models import ReferralLink, DailyMetrics, Campaign
from .serializers import OfficerReferralLinkSerializer, OfficerDailyMetricsSerializer


class ReferralLinkViewSet(viewsets.ReadOnlyModelViewSet):
    
    serializer_class = OfficerReferralLinkSerializer

    def get_queryset(self):
        return ReferralLink.objects.filter(officer=self.request.user.officer_profile)



class StatsViewSet(viewsets.ViewSet):
    

    def list(self, request):
        
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
        return Response(data)

    @action(detail=False, methods=["get"])
    def timeline(self, request):
        officer = request.user.officer_profile
        metrics = DailyMetrics.objects.filter(officer=officer).order_by("metric_date")
        serializer = OfficerDailyMetricsSerializer(metrics, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def campaigns(self, request):
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

        return Response(data)
