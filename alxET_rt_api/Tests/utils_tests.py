import pytest
import re
from unittest import mock
from dashboard_service.utils import generate_referral_code

pytestmark = pytest.mark.django_db

def test_generate_referral_code_returns_string(campaign_factory, officer_factory, settings):
    campaign = campaign_factory()
    officer = officer_factory()
    code = generate_referral_code(str(campaign.id), str(officer.id))
    assert isinstance(code, str)
    assert len(code) == 32
    assert re.fullmatch(r"[0-9a-f]{16}", code)  # only hex chars

def test_generate_referral_code_uses_custom_secret_key(campaign_factory, officer_factory):
    campaign = campaign_factory()
    officer = officer_factory()
    code1 = generate_referral_code(str(campaign.id), str(officer.id), secret_key="custom_secret")
    code2 = generate_referral_code(str(campaign.id), str(officer.id), secret_key="another_secret")
    assert code1 != code2  # different keys = different hashes

def test_generate_referral_code_is_time_dependent(campaign_factory, officer_factory):
    campaign = campaign_factory()
    officer = officer_factory()

    with mock.patch("time.time", return_value=1000):
        code1 = generate_referral_code(str(campaign.id), str(officer.id), secret_key="secret")

    with mock.patch("time.time", return_value=2000):
        code2 = generate_referral_code(str(campaign.id), str(officer.id), secret_key="secret")

    assert code1 != code2
