from ..admin_dashbaord.serializers import (
    CampaignSerializer as AdminCampaignSerializer,
    ReferralLinkSerializer as AdminReferralLinkSerializer,
    DailyMetricsSerializer as AdminDailyMetricsSerializer,
)


class OfficerReferralLinkSerializer(AdminReferralLinkSerializer):
    class Meta(AdminReferralLinkSerializer.Meta):
        fields = [
            "id",
            "full_link",
            "ref_code",
            "click_count",
            "signup_count",
            "is_active",
            "created_at",
            "campaign",
        ]
        read_only_fields = fields


class OfficerCampaignSerializer(AdminCampaignSerializer):
    class Meta(AdminCampaignSerializer.Meta):
        fields = [
            "id",
            "name",
            "start_date",
            "end_date",
            "is_active",
        ]
        read_only_fields = fields


class OfficerDailyMetricsSerializer(AdminDailyMetricsSerializer):
    class Meta(AdminDailyMetricsSerializer.Meta):
        fields = [
            "metric_date",
            "total_clicks",
            "total_signups",
            "click_to_signup_rate",
        ]
        read_only_fields = fields
