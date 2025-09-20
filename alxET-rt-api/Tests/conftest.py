import pytest
import factory
from django.utils import timezone
from auth_service.models import User, Officer
from dashboard_service.models import Campaign, OfficerCampaignAssignment, ReferralLink, DailyMetrics
import pytest_factoryboy
from rest_framework.test import APIClient

@pytest.fixture
def api_client():
    return APIClient()

class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User

    email = factory.Sequence(lambda n: f"user{n}@test.com")
    full_name = factory.Sequence(lambda n: f"Test User {n}")
    is_active = True
    is_staff = False


class OfficerFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Officer

    user = factory.SubFactory(UserFactory)


class CampaignFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Campaign

    name = factory.Sequence(lambda n: f"Campaign {n}")
    start_date = factory.LazyFunction(timezone.now)
    end_date = factory.LazyFunction(lambda: timezone.now() + timezone.timedelta(days=10))
    is_active = True


class OfficerCampaignAssignmentFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = OfficerCampaignAssignment

    officer = factory.SubFactory(OfficerFactory)
    campaign = factory.SubFactory(CampaignFactory)


class ReferralLinkFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = ReferralLink

    officer = factory.SubFactory(OfficerFactory)
    campaign = factory.SubFactory(CampaignFactory)
    full_link = factory.Sequence(lambda n: f"https://ref.test/{n}")
    ref_code = factory.Sequence(lambda n: f"code{n}")
    is_active = True


class DailyMetricsFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = DailyMetrics

    campaign = factory.SubFactory(CampaignFactory)
    officer = factory.SubFactory(OfficerFactory)
    referral_link = factory.SubFactory(ReferralLinkFactory)
    metric_date = factory.LazyFunction(lambda: timezone.now().date())
    total_clicks = 10
    total_signups = 5


pytest_factoryboy.register(UserFactory)
pytest_factoryboy.register(OfficerFactory)
pytest_factoryboy.register(CampaignFactory)
pytest_factoryboy.register(OfficerCampaignAssignmentFactory)
pytest_factoryboy.register(ReferralLinkFactory)
pytest_factoryboy.register(DailyMetricsFactory)