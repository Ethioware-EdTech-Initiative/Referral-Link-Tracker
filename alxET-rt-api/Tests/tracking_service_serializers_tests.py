import pytest
from django.utils import timezone
from auth_service.models import User
from dashboard_service.models import ReferralLink, Officer, Campaign
from tracking_service.models import ClickEvent, SignupEvent, FraudFindings
from tracking_service.serializers import (
    ClickEventSerializer,
    SignupEventSerializer,
    FraudFindingsSerializer
)

@pytest.mark.django_db
class TestClickEventSerializer:

    def setup_method(self):
        self.user = User.objects.create(
            email="testuser@example.com",
            full_name="Test User",
            is_active=True,
            is_staff=False
        )
        self.officer = Officer.objects.create(user=self.user)

        self.campaign = Campaign.objects.create(
            name="Test Campaign",
            start_date=timezone.now(),
            end_date=timezone.now() + timezone.timedelta(days=7)
        )
        self.referral = ReferralLink.objects.create(
            officer=self.officer,
            campaign=self.campaign,
            full_link="https://example.com/ref/xyz789",
            ref_code="xyz789"
        )

        self.click_event = ClickEvent.objects.create(
            referral_link=self.referral,
            ip="192.168.1.1",
            user_agent="Test Browser",
            geo_country="US",
            geo_city="New York",
            geo_region="NY"
        )

    def test_click_event_serialization(self):
        serializer = ClickEventSerializer(self.click_event)
        data = serializer.data
        
        assert data["referral_link"] == self.referral.id
        assert data["ip"] == "192.168.1.1"
        assert data["user_agent"] == "Test Browser"
        assert data["geo_country"] == "US"
        assert "id" in data
        assert "timestamp" in data

    def test_click_event_deserialization(self):
        payload = {
            "referral_link": self.referral.id,
            "ip": "192.168.1.2",
            "user_agent": "Another Browser",
            "geo_country": "CA",
            "geo_city": "Toronto",
            "geo_region": "ON"
        }
        serializer = ClickEventSerializer(data=payload)
        assert serializer.is_valid(), serializer.errors
        click_event = serializer.save()
        
        assert click_event.ip == "192.168.1.2"
        assert click_event.user_agent == "Another Browser"
        assert click_event.geo_country == "CA"


@pytest.mark.django_db
class TestSignupEventSerializer:

    def setup_method(self):
        self.user = User.objects.create(
            email="signupuser@example.com",
            full_name="Signup User"
        )
        self.officer = Officer.objects.create(user=self.user)
        self.campaign = Campaign.objects.create(
            name="Signup Campaign",
            start_date=timezone.now(),
            end_date=timezone.now() + timezone.timedelta(days=7)
        )
        self.referral = ReferralLink.objects.create(
            officer=self.officer,
            campaign=self.campaign,
            full_link="https://example.com/ref/signup123",
            ref_code="signup123"
        )
        self.click_event = ClickEvent.objects.create(
            referral_link=self.referral,
            ip="192.168.1.1",
            user_agent="Test Browser"
        )
        self.signup_event = SignupEvent.objects.create(
            referral_link=self.referral,
            click_event=self.click_event
        )

    def test_signup_event_serialization(self):
        serializer = SignupEventSerializer(self.signup_event)
        data = serializer.data
        
        assert data["referral_link"] == self.referral.id
        assert data["click_event"] == self.click_event.id
        assert "conversion_minutes" in data
        assert "timestamp" in data
        assert "id" in data

    def test_signup_event_deserialization(self):
        payload = {
            "referral_link": self.referral.id,
            "click_event": self.click_event.id
        }
        serializer = SignupEventSerializer(data=payload)
        assert serializer.is_valid(), serializer.errors
        signup_event = serializer.save()
        
        assert signup_event.referral_link == self.referral
        assert signup_event.click_event == self.click_event


@pytest.mark.django_db
class TestFraudFindingsSerializer:

    def setup_method(self):
        self.user = User.objects.create(
            email="frauduser@example.com",
            full_name="Fraud User"
        )
        self.officer = Officer.objects.create(user=self.user)
        self.campaign = Campaign.objects.create(
            name="Fraud Campaign",
            start_date=timezone.now(),
            end_date=timezone.now() + timezone.timedelta(days=7)
        )
        self.referral = ReferralLink.objects.create(
            officer=self.officer,
            campaign=self.campaign,
            full_link="https://example.com/ref/fraud123",
            ref_code="fraud123"
        )
        self.click_event = ClickEvent.objects.create(
            referral_link=self.referral,
            ip="192.168.1.1",
            user_agent="Test Browser"
        )
        self.signup_event = SignupEvent.objects.create(
            referral_link=self.referral,
            click_event=self.click_event
        )
        self.fraud_findings = FraudFindings.objects.create(
            event_type='signup',
            event_id=self.signup_event.id,
            fraud_score=85.5,
            findings_details="Suspicious IP pattern and rapid conversion time"
        )

    def test_fraud_findings_serialization_and_deserialization(self):
        serializer = FraudFindingsSerializer(self.fraud_findings)
        data = serializer.data
        
        assert data["event_type"] == "signup"
        assert data["event_id"] == str(self.signup_event.id)
        assert data["fraud_score"] == 85.5
        assert data["findings_details"] == "Suspicious IP pattern and rapid conversion time"
        assert "id" in data
        assert "timestamp" in data

        payload = {
            "event_type": "click",
            "event_id": str(self.click_event.id),
            "fraud_score": 20.0,
            "findings_details": "Low risk, normal behavior"
        }
        serializer = FraudFindingsSerializer(data=payload)
        assert serializer.is_valid(), serializer.errors
        fraud_findings = serializer.save()
        
        assert fraud_findings.event_type == "click"
        assert fraud_findings.event_id == self.click_event.id
        assert fraud_findings.fraud_score == 20.0
        assert fraud_findings.findings_details == "Low risk, normal behavior"