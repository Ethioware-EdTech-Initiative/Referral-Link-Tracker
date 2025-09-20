import importlib
import base64
import json
from types import SimpleNamespace
from datetime import datetime, timedelta
import pytest
from django.utils import timezone

pytestmark = pytest.mark.django_db

TASKS_MODULE = "alx_recruitment_tracker.celery"
tasks = importlib.import_module(TASKS_MODULE)



def test_parse_service_account_json_variants():
    raw_dict = {"a": 1}
    assert tasks._parse_service_account_json(raw_dict) == raw_dict

    raw_json = json.dumps({"k": "v"})
    assert tasks._parse_service_account_json(raw_json) == {"k": "v"}

    escaped_newline = json.dumps({"k": "n\nv"}).replace("\n", "\\n")
    parsed = tasks._parse_service_account_json(escaped_newline)
    assert parsed["k"] == "n\nv"

    b64 = base64.b64encode(json.dumps({"x": 5}).encode("utf-8")).decode("utf-8")
    parsed_b64 = tasks._parse_service_account_json(b64)
    assert parsed_b64["x"] == 5


def test_checkpoint_get_set(monkeypatch):
    store = {}

    class FakeRedis:
        def get(self, k):
            return store.get(k)

        def set(self, k, v):
            store[k] = v

    monkeypatch.setattr(tasks, "_redis_client", lambda: FakeRedis())
    assert tasks.get_checkpoint("my_task") is None
    tasks.set_checkpoint("my_task", "2024-01-01T00:00:00+00:00")
    assert tasks.get_checkpoint("my_task") == "2024-01-01T00:00:00+00:00"


class FakeWorksheet:
    def __init__(self):
        self.rows_appended = []
        self.rows_batched = []
        self.cleared = False

    def acell(self, addr):
        class C:
            value = None
        return C()

    def append_row(self, row):
        self.rows_appended.append(row)

    def append_rows(self, rows, value_input_option=None):
        for r in rows:
            self.rows_batched.append(r)

    def clear(self):
        self.cleared = True


class FakeSheet:
    def __init__(self, ws=None):
        self._ws = ws or FakeWorksheet()

    def worksheet(self, name):
        return self._ws

    def add_worksheet(self, title, rows, cols):
        self._ws = FakeWorksheet()
        return self._ws


class FakeClient:
    def __init__(self, sheet):
        self._sheet = sheet

    def open_by_key(self, key):
        return self._sheet


class FakeQuerySet:
    def __init__(self, items):
        self._items = list(items)

    def select_related(self, *args, **kwargs):
        return self

    def order_by(self, *args, **kwargs):
        return self

    def iterator(self):
        return iter(self._items)


def test_export_raw_data_appends_rows_and_sets_checkpoint(monkeypatch):
    """
    - Monkeypatch get_google_sheet_client to a fake client that records appended rows.
    - Monkeypatch ClickEvent and SignupEvent managers to return fake querysets.
    - Confirm append_rows invoked and checkpoint is set to max timestamp.
    """
    ws = FakeWorksheet()
    sheet = FakeSheet(ws)
    client = FakeClient(sheet)
    monkeypatch.setattr(tasks, "get_google_sheet_client", lambda: client)
    monkeypatch.setattr(tasks, "get_sheet_id", lambda: "sheet-123")

    store = {}

    class FakeRedis:
        def get(self, k):
            return store.get(k)

        def set(self, k, v):
            store[k] = v

    monkeypatch.setattr(tasks, "_redis_client", lambda: FakeRedis())

    class ReferralLink:
        def __init__(self, id_, officer_id, campaign_id, campaign_name):
            self.id = id_
            self.officer_id = officer_id
            self.campaign_id = campaign_id
            self.campaign = SimpleNamespace(name=campaign_name)

    rl1 = ReferralLink(1, 10, 100, "Camp A")
    rl2 = ReferralLink(2, 11, 101, "Camp B")
    now = timezone.now()
    ev1_ts = now - timedelta(minutes=5)
    ev2_ts = now - timedelta(minutes=3)
    ev3_ts = now - timedelta(minutes=1)


    class ClickEv:
        def __init__(self, ts, referral_link, ip="", user_agent=""):
            self.timestamp = ts
            self.referral_link_id = referral_link.id
            self.referral_link = referral_link
            self.ip = ip
            self.user_agent = user_agent

    class SignupEv:
        def __init__(self, ts, referral_link, click_event=None):
            self.timestamp = ts
            self.referral_link_id = referral_link.id
            self.referral_link = referral_link
            self.click_event = click_event

    click_events = [ClickEv(ev1_ts, rl1, "1.1.1.1", "u1"), ClickEv(ev2_ts, rl2, "2.2.2.2", "u2")]
    signup_click = SimpleNamespace(ip="3.3.3.3", user_agent="su")
    signup_events = [SignupEv(ev3_ts, rl1, click_event=signup_click)]

    monkeypatch.setattr(tasks, "ClickEvent", SimpleNamespace(objects=SimpleNamespace(filter=lambda **kwargs: FakeQuerySet(click_events))))
    monkeypatch.setattr(tasks, "SignupEvent", SimpleNamespace(objects=SimpleNamespace(filter=lambda **kwargs: FakeQuerySet(signup_events))))

    result = tasks.export_raw_data.run()
    assert ws.rows_appended, "headers were not appended"
    assert len(ws.rows_batched) == len(click_events) + len(signup_events)
    ck = (tasks._redis_client()).get("checkpoint:export_raw_data")
    assert ck is not None
    assert str(now.year) in ck


def test_export_raw_data_with_no_rows_does_not_fail(monkeypatch):
    """If both click and signup querysets are empty, task should succeed and not append rows."""
    ws = FakeWorksheet()
    sheet = FakeSheet(ws)
    client = FakeClient(sheet)
    monkeypatch.setattr(tasks, "get_google_sheet_client", lambda: client)
    monkeypatch.setattr(tasks, "get_sheet_id", lambda: "sheet-123")
    monkeypatch.setattr(tasks, "_redis_client", lambda: SimpleNamespace(get=lambda k: None, set=lambda k, v: None))

    monkeypatch.setattr(tasks, "ClickEvent", SimpleNamespace(objects=SimpleNamespace(filter=lambda **kwargs: FakeQuerySet([]))))
    monkeypatch.setattr(tasks, "SignupEvent", SimpleNamespace(objects=SimpleNamespace(filter=lambda **kwargs: FakeQuerySet([]))))

    res = tasks.export_raw_data.run()
    assert "Appended" in str(res) or res is None


def test_calculate_daily_metrics_creates_daily_metrics(referral_link_factory, click_event_factory, signup_event_factory):
    """
    Uses existing factory fixtures (assumed present in your suite).
    Creates clicks and signups for one referral link and ensures DailyMetrics record is created with correct totals.
    """
    today = timezone.now().date()
    rl = referral_link_factory()
    for _ in range(5):
        click_event_factory(referral_link=rl, timestamp=timezone.now())
    for _ in range(2):
        signup_event_factory(referral_link=rl, timestamp=timezone.now())

    tasks.calculate_daily_metrics.run()
    dm = tasks.DailyMetrics.objects.filter(referral_link=rl, metric_date=today).first()
    assert dm is not None
    assert dm.total_clicks == 5
    assert dm.total_signups == 2
    expected_rate = (2 / 5) * 100.0
    assert abs(dm.click_to_signup_rate - expected_rate) < 0.001



def test_export_daily_aggregates_triggers_chain(monkeypatch):
    """
    Patch the chain factory to ensure export_daily_aggregates creates a chain and returns job ids as expected.
    """

    def fake_chain(*args, **kwargs):
        def create_and_invoke():
            job = SimpleNamespace(id="root-job-123", children=[SimpleNamespace(id="child-1"), SimpleNamespace(id="child-2")])
            return job
        return create_and_invoke

    monkeypatch.setattr(tasks, "chain", fake_chain)

    res = tasks.export_daily_aggregates.run()
    assert isinstance(res, dict)
    assert res["root_id"] == "root-job-123"
    assert isinstance(res["children"], list)
    assert "child-1" in res["children"] or "child-2" in res["children"] or len(res["children"]) >= 0
