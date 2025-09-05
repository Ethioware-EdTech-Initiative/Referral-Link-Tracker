from rest_framework import serializers
from django.db import IntegrityError, transaction
from django.utils.timezone import now
from django.core.exceptions import ValidationError
from django.db.models import Count
from ..utils import generate_referral_code 
from ..models import Campaign, OfficerCampaignAssignment, ReferralLink, DailyMetrics
from auth_service.models import Officer, Audit_Log, User


class OfficerSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source="user.full_name", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = Officer
        fields = ["id", "full_name", "email"]
        read_only_fields = ["id"]

    def validate(self, data):
        user = data.get("user") or getattr(self.instance, "user", None)
        if user and Officer.objects.filter(user=user).exclude(pk=getattr(self.instance, "pk", None)).exists():
            raise serializers.ValidationError({"user": "This user already has an Officer profile."})
        if user and not user.is_active:
            raise serializers.ValidationError({"user": "Cannot assign inactive user as Officer."})
        return data


class OfficerCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Officer
        fields = ["user"]

    def validate_user(self, value):
        if Officer.objects.filter(user=value).exists():
            raise serializers.ValidationError("This user already has an Officer profile.")
        if not value.is_active:
            raise serializers.ValidationError("User must be active.")
        return value


class CampaignSerializer(serializers.ModelSerializer):
    officer_count = serializers.IntegerField(read_only=True)
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
        assignments = obj.officer_assignments.select_related("officer__user").all()
        officers = [a.officer for a in assignments]
        return OfficerSerializer(officers, many=True).data


class CampaignCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Campaign
        fields = ["name", "description", "start_date", "end_date", "is_active"]

    def validate(self, data):
        start_date = data.get("start_date", getattr(self.instance, "start_date", None))
        end_date = data.get("end_date", getattr(self.instance, "end_date", None))
        if start_date and end_date and end_date <= start_date:
            raise serializers.ValidationError({"end_date": "End date must be after start date."})
        if Campaign.objects.filter(name=data.get("name")).exclude(pk=getattr(self.instance, "pk", None)).exists():
            raise serializers.ValidationError({"name": "Campaign with this name already exists."})
        if self.instance and self.instance.start_date < now().date() and "start_date" in data:
            raise serializers.ValidationError({"start_date": "Cannot modify start_date of past campaigns."})
        return data


class OfficerCampaignAssignmentSerializer(serializers.ModelSerializer):
    officer = OfficerSerializer(read_only=True)
    campaign = CampaignSerializer(read_only=True)

    class Meta:
        model = OfficerCampaignAssignment
        fields = ["id", "officer", "campaign", "assigned_at"]
        read_only_fields = ["id", "assigned_at"]


class OfficerCampaignAssignmentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = OfficerCampaignAssignment
        fields = ["officer", "campaign"]
        read_only_fields = ["id", "assigned_at"]

    def validate(self, data):
        officer = data["officer"]
        campaign = data["campaign"]
        if not officer.user.is_active:
            raise serializers.ValidationError({"officer": "Officer must be active."})
        if not campaign.is_active:
            raise serializers.ValidationError({"campaign": "Campaign must be active."})
        if OfficerCampaignAssignment.objects.filter(officer=officer, campaign=campaign).exists():
            raise serializers.ValidationError("This officer is already assigned to this campaign.")
        return data


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
            "ref_code",
            "full_link",
        ]


class ReferralLinkCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReferralLink
        fields = ["officer", "campaign"]
        read_only_fields = [
            "id",
            "click_count",
            "signup_count",
            "created_at",
            "full_link",
            "ref_code",
            "updated_at",
            "is_active",
            "revoke_at",
        ]

    def validate(self, data):
        officer = data["officer"]
        campaign = data["campaign"]

        if not officer.user.is_active:
            raise serializers.ValidationError({"officer": "Officer must be active."})

        if not campaign.is_active:
            raise serializers.ValidationError({"campaign": "Campaign must be active."})

        if not OfficerCampaignAssignment.objects.filter(
            officer=officer, campaign=campaign
        ).exists():
            raise serializers.ValidationError(
                {"assignment": "Officer is not assigned to this campaign."}
            )

        return data


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
        read_only_fields = ["id"]

    def validate(self, data):
        clicks = data.get("total_clicks", getattr(self.instance, "total_clicks", 0))
        signups = data.get("total_signups", getattr(self.instance, "total_signups", 0))
        if signups > clicks:
            raise serializers.ValidationError("Total signups cannot exceed total clicks.")
        metric_date = data.get("metric_date", getattr(self.instance, "metric_date", None))
        if metric_date and metric_date > now().date():
            raise serializers.ValidationError({"metric_date": "Metric date cannot be in the future."})
        return data


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
