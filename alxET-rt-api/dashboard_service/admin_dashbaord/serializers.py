from rest_framework import serializers
from ..models import Campaign, OfficerCampaignAssignment, ReferralLink, DailyMetrics
from auth_service.models import Officer, Audit_Log, User


class OfficerSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source="user.full_name", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = Officer
        fields = ["id", "full_name", "email"]
        read_only_fields = ["id"]


class OfficerCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Officer
        fields = ["user"]


class CampaignSerializer(serializers.ModelSerializer):
    officer_count = serializers.IntegerField(
        source="officer_assignments.count", read_only=True
    )
    
    officers = serializers.SerializerMethodField()

    class Meta:
        model = Campaign
        fields = [
            "id",
            "name",
            "description",
            "start_date",
            "officers",
            "end_date",
            "is_active",
            "officer_count",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "officer_count"]
        
    def get_officers(self, obj):
        assignments = obj.officer_assignments.select_related("officer__user")
        return OfficerSerializer([a.officer for a in assignments], many=True).data


class CampaignCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Campaign
        fields = ["name", "description", "start_date", "end_date", "is_active"]


class OfficerCampaignAssignmentSerializer(serializers.ModelSerializer):
    officer = OfficerSerializer(read_only=True)
    campaign = CampaignSerializer(read_only=True)

    class Meta:
        model = OfficerCampaignAssignment
        fields = ["id", "officer", "campaign", "assigned_at"]


class OfficerCampaignAssignmentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = OfficerCampaignAssignment
        fields = ["officer", "campaign"]
        read_only_fields = ["id", "assigned_at"]


class ReferralLinkSerializer(serializers.ModelSerializer):
    officer = OfficerSerializer(read_only=True)
    campaign = CampaignSerializer(read_only=True)

    class Meta:
        model = ReferralLink
        fields = [
            "id",
            "officer",
            "campaign",
            "full_link",
            "ref_code",
            "click_count",
            "signup_count",
            "is_active",
            "revoke_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "click_count",
            "signup_count",
            "created_at",
            "updated_at",
        ]


class ReferralLinkCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReferralLink
        fields = ["officer", "campaign"]
        read_only_fields = ["id", "click_count", "signup_count", "created_at", "full_link", "ref_code", "updated_at", "is_active", "revoke_at"]


class DailyMetricsSerializer(serializers.ModelSerializer):
    campaign = serializers.StringRelatedField()
    officer = serializers.StringRelatedField()
    referral_link = serializers.StringRelatedField()

    class Meta:
        model = DailyMetrics
        fields = [
            "id",
            "metric_date",
            "campaign",
            "officer",
            "referral_link",
            "total_clicks",
            "total_signups",
            "click_to_signup_rate",
        ]


class AuditLogSerializer(serializers.ModelSerializer):
    user_full_name = serializers.CharField(source="user.full_name", read_only=True)
    user_email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = Audit_Log
        fields = [
            "id",
            "user_full_name",
            "user_email",
            "action",
            "target_type",
            "target_id",
            "description",
            "user_agent",
            "ip_address",
            "timestamp",
        ]
        read_only_fields = fields
