import os
import json
import ssl
from datetime import timedelta
from urllib.parse import urlparse
from datetime import timezone
import redis
import gspread

from celery.utils.log import get_task_logger
from celery import group, chain
from alx_recruitment_tracker.celery import app

from django.utils import timezone
from django.db.models import Sum, Avg, Count
from tracking_service.models import ClickEvent, SignupEvent
from auth_service.models import Officer
from dashboard_service.models import DailyMetrics, Campaign, ReferralLink


logger = get_task_logger(__name__)


def _redis_client():
    url = os.getenv("REDIS_URL")
    if not url:
        raise RuntimeError("REDIS_URL not set")
    return redis.from_url(url, decode_responses=True)


def _ckpt_key(task_name: str) -> str:
    return f"checkpoint:{task_name}"


def get_checkpoint(task_name: str):
    """Return ISO timestamp string or None."""
    try:
        r = _redis_client()
        return r.get(_ckpt_key(task_name))
    except Exception:
        logger.exception("Failed to read checkpoint for %s", task_name)
        return None


def set_checkpoint(task_name: str, iso_ts: str):
    try:
        r = _redis_client()
        r.set(_ckpt_key(task_name), iso_ts)
    except Exception:
        logger.exception("Failed to write checkpoint for %s", task_name)

def _parse_service_account_json(raw):
    """Try several ways to parse the JSON returned from env var."""
    if isinstance(raw, dict):
        return raw
    try:
        return json.loads(raw)
    except Exception:
        pass
    try:
        return json.loads(raw.replace('\\n', '\n'))
    except Exception:
        pass
    try:
        decoded = base64.b64decode(raw).decode('utf-8')
        return json.loads(decoded)
    except Exception:
        pass
    raise ValueError("Could not parse GOOGLE_SERVICE_ACCOUNT_JSON (tried raw, \\n->newline and base64)")

def _write_temp_service_account_file(creds_dict):
    """Write creds to a secure temp file and return path."""
    fd, path = tempfile.mkstemp(prefix="gsa_", suffix=".json")
    with os.fdopen(fd, "w", encoding="utf-8") as f:
        json.dump(creds_dict, f, ensure_ascii=False)
    
    try:
        os.chmod(path, stat.S_IRUSR | stat.S_IWUSR)
    except Exception:
        pass
    return path

import os
import json
import base64
import tempfile
import stat
import gspread

def _parse_service_account_json(raw):
    """Try several ways to parse the JSON returned from env var."""
    if isinstance(raw, dict):
        return raw
    # 1) try direct JSON
    try:
        return json.loads(raw)
    except Exception:
        pass
    # 2) try replacing escaped \\n with real newlines
    try:
        return json.loads(raw.replace('\\n', '\n'))
    except Exception:
        pass
    # 3) try base64 decode
    try:
        decoded = base64.b64decode(raw).decode('utf-8')
        return json.loads(decoded)
    except Exception:
        pass
    raise ValueError("Could not parse GOOGLE_SERVICE_ACCOUNT_JSON (tried raw, \\n->newline and base64)")

def _write_temp_service_account_file(creds_dict):
    """Write creds to a secure temp file and return path."""
    fd, path = tempfile.mkstemp(prefix="gsa_", suffix=".json")
    with os.fdopen(fd, "w", encoding="utf-8") as f:
        json.dump(creds_dict, f, ensure_ascii=False)
    # Restrict file permissions (Unix). On Windows this is best-effort.
    try:
        os.chmod(path, stat.S_IRUSR | stat.S_IWUSR)
    except Exception:
        pass
    return path

def get_google_sheet_client():
    """Get authenticated Google Sheets client.

    Prefer GOOGLE_SERVICE_ACCOUNT_FILE (path). Fallback to GOOGLE_SERVICE_ACCOUNT_JSON.
    This is robust to env var containing escaped newlines or base64.
    """
    svc_file = os.getenv("GOOGLE_SERVICE_ACCOUNT_FILE")
    if svc_file:
        svc_file = os.path.expanduser(svc_file)
        if os.path.exists(svc_file):
            return gspread.service_account(filename=svc_file)

    raw_json = os.getenv("GOOGLE_SERVICE_ACCOUNT_JSON")
    if not raw_json:
        raise ValueError(
            "Service account credentials not provided. "
            "Set GOOGLE_SERVICE_ACCOUNT_FILE (recommended) or GOOGLE_SERVICE_ACCOUNT_JSON."
        )

    creds = _parse_service_account_json(raw_json)
    try:
        return gspread.service_account_from_dict(creds)
    except Exception:
        temp_path = _write_temp_service_account_file(creds)
        os.environ["GOOGLE_SERVICE_ACCOUNT_FILE"] = temp_path
        return gspread.service_account(filename=temp_path)



def get_sheet_id():
    """Get the Google Sheet ID from environment."""
    sheet_id = os.getenv("GOOGLE_SHEET_ID")
    if not sheet_id:
        raise ValueError("GOOGLE_SHEET_ID not set in environment")
    return sheet_id



DEFAULT_RETRY_KW = dict(
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_jitter=True,
    max_retries=5,
)

@app.task(bind=True, **DEFAULT_RETRY_KW)
def export_raw_data(self):
    """
    Incrementally export raw click and signup events to Sheet 'Tracker_Raw_Data'.

    - DOES NOT clear the sheet.
    - Uses a checkpoint (last processed timestamp) to append only new events.
    - Idempotent-ish: we query events strictly greater than last checkpoint.
    """

    task_name = "export_raw_data"
    ckpt = get_checkpoint(task_name)

    if ckpt:
        since = timezone.datetime.fromisoformat(ckpt)
        if timezone.is_naive(since):
            since = timezone.make_aware(since, timezone=timezone.utc)
    else:
        since = timezone.now() - timedelta(hours=24)

    try:
        gc = get_google_sheet_client()
        sheet = gc.open_by_key(get_sheet_id())
        ws = sheet.worksheet("Tracker_Raw_Data")

        try:
            a1 = ws.acell("A1").value
        except Exception:
            a1 = None
        if not a1:
            headers = [
                "Timestamp",
                "EventType",
                "ReferralLinkID",
                "OfficerID",
                "CampaignID",
                "CampaignName",
                "UserEmailHash",
                "IP",
                "UserAgent",
            ]
            ws.append_row(headers)

        click_qs = (
            ClickEvent.objects.filter(timestamp__gt=since)
            .select_related("referral_link__officer__user", "referral_link__campaign")
            .order_by("timestamp", "id")
        )
        signup_qs = (
            SignupEvent.objects.filter(timestamp__gt=since)
            .select_related(
                "referral_link__officer__user",
                "referral_link__campaign",
                "click_event",
            )
            .order_by("timestamp", "id")
        )

        rows = []
        max_ts = None

        for ev in click_qs.iterator():
            ts = ev.timestamp
            if (max_ts is None) or (ts > max_ts):
                max_ts = ts
            rows.append(
                [
                    ts.isoformat(),
                    "click",
                    str(ev.referral_link_id),
                    str(ev.referral_link.officer_id),
                    str(ev.referral_link.campaign_id),
                    ev.referral_link.campaign.name if ev.referral_link and ev.referral_link.campaign else "",
                    "",  # UserEmailHash not present in ClickEvent
                    ev.ip or "",
                    ev.user_agent or "",
                ]
            )

        for ev in signup_qs.iterator():
            ts = ev.timestamp
            if (max_ts is None) or (ts > max_ts):
                max_ts = ts
            rows.append(
                [
                    ts.isoformat(),
                    "signup",
                    str(ev.referral_link_id),
                    str(ev.referral_link.officer_id),
                    str(ev.referral_link.campaign_id),
                    ev.referral_link.campaign.name if ev.referral_link and ev.referral_link.campaign else "",
                    "",  # obfuscated/empty by design
                    ev.click_event.ip if getattr(ev, "click_event", None) else "",
                    ev.click_event.user_agent if getattr(ev, "click_event", None) else "",
                ]
            )

        if rows:
            rows.sort(key=lambda r: r[0])

            CHUNK = 500
            for i in range(0, len(rows), CHUNK):
                ws.append_rows(rows[i : i + CHUNK])

            if max_ts:
                max_ts_iso = max_ts.astimezone(tz=timezone.utc).isoformat()
                set_checkpoint(task_name, max_ts_iso)

        logger.info("Raw export appended %d rows (since %s).", len(rows), since.isoformat())
        return f"Appended {len(rows)} new raw events"

    except Exception as e:
        logger.exception("Error exporting raw data")
        raise


@app.task(bind=True, **DEFAULT_RETRY_KW)
def export_officer_summary(self, *args, **kwargs):
    """
    Export aggregated officer summary to 'Officer_Summary' (overwrite mode).
    """

    try:
        gc = get_google_sheet_client()
        sheet = gc.open_by_key(get_sheet_id())
        ws = sheet.worksheet("Officer_Summary")

        ws.clear()
        headers = ["OfficerID", "OfficerName", "TotalClicks", "TotalSignups", "ClickToSignupRate"]
        ws.append_row(headers)

        officers = Officer.objects.all().select_related("user")

        rows = []
        for officer in officers:
            metrics = DailyMetrics.objects.filter(officer=officer).aggregate(
                total_clicks=Sum("total_clicks"),
                total_signups=Sum("total_signups"),
                avg_rate=Avg("click_to_signup_rate"),
            )
            rows.append(
                [
                    str(officer.id),
                    getattr(officer.user, "full_name", "") or getattr(officer.user, "get_full_name", lambda: "")(),
                    metrics["total_clicks"] or 0,
                    metrics["total_signups"] or 0,
                    round(metrics["avg_rate"] or 0.0, 2),
                ]
            )

        if rows:
            CHUNK = 500
            for i in range(0, len(rows), CHUNK):
                ws.append_rows(rows[i : i + CHUNK])

        logger.info("Exported officer summary for %d officers", len(rows))
        return f"Exported officer summary for {len(rows)} officers"

    except Exception:
        logger.exception("Error exporting officer summary")
        raise


@app.task(bind=True, **DEFAULT_RETRY_KW)
def export_campaign_summary(self, *args, **kwargs):
    """
    Export aggregated campaign summary to 'Campaign_Summary' (overwrite mode).

    Fixes:
    - Average signups/day computed over actual number of metric days (distinct dates),
        which handles ongoing campaigns and avoids off-by-one from raw date subtraction.
    """

    try:
        gc = get_google_sheet_client()
        sheet = gc.open_by_key(get_sheet_id())
        ws = sheet.worksheet("Campaign_Summary")

        ws.clear()
        headers = [
            "CampaignID",
            "CampaignName",
            "StartDate",
            "EndDate",
            "TotalClicks",
            "TotalSignups",
            "ClickToSignupRate",
            "AverageSignupsPerDay",
        ]
        ws.append_row(headers)

        campaigns = Campaign.objects.all()

        rows = []
        for campaign in campaigns:
            agg = DailyMetrics.objects.filter(campaign=campaign).aggregate(
                total_clicks=Sum("total_clicks"),
                total_signups=Sum("total_signups"),
                avg_rate=Avg("click_to_signup_rate"),
                days=Count("metric_date", distinct=True),
            )
            total_clicks = agg["total_clicks"] or 0
            total_signups = agg["total_signups"] or 0
            avg_rate = round(agg["avg_rate"] or 0.0, 2)
            days = agg["days"] or 0

            avg_signups_per_day = round((total_signups / days), 2) if days > 0 else 0.0

            rows.append(
                [
                    str(campaign.id),
                    campaign.name,
                    campaign.start_date.isoformat() if getattr(campaign, "start_date", None) else "",
                    campaign.end_date.isoformat() if getattr(campaign, "end_date", None) else "",
                    total_clicks,
                    total_signups,
                    avg_rate,
                    avg_signups_per_day,
                ]
            )

        if rows:
            CHUNK = 500
            for i in range(0, len(rows), CHUNK):
                ws.append_rows(rows[i : i + CHUNK])

        logger.info("Exported campaign summary for %d campaigns", len(rows))
        return f"Exported campaign summary for {len(rows)} campaigns"

    except Exception:
        logger.exception("Error exporting campaign summary")
        raise


@app.task(bind=True, **DEFAULT_RETRY_KW)
def export_time_series(self, *args, **kwargs):
    """
    Export time series to 'Time_Series_Data' (overwrite mode).

    Fixes:
    - Single grouped query over the date range (no N+1/day loop).
    """

    try:
        gc = get_google_sheet_client()
        sheet = gc.open_by_key(get_sheet_id())
        ws = sheet.worksheet("Time_Series_Data")

        ws.clear()
        headers = ["Date", "TotalClicks", "TotalSignups", "ClickToSignupRate"]
        ws.append_row(headers)

        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=90)

        agg = (
            DailyMetrics.objects.filter(metric_date__gte=start_date, metric_date__lte=end_date)
            .values("metric_date")
            .annotate(
                clicks=Sum("total_clicks"),
                signups=Sum("total_signups"),
                avg_rate=Avg("click_to_signup_rate"),
            )
            .order_by("metric_date")
        )

        rows = [
            [
                rec["metric_date"].isoformat(),
                rec["clicks"] or 0,
                rec["signups"] or 0,
                round(rec["avg_rate"] or 0.0, 2),
            ]
            for rec in agg
        ]

        if rows:
            CHUNK = 500
            for i in range(0, len(rows), CHUNK):
                ws.append_rows(rows[i : i + CHUNK])

        logger.info("Exported time series for %d days", len(rows))
        return f"Exported time series data for {len(rows)} days"

    except Exception:
        logger.exception("Error exporting time series")
        raise


@app.task(bind=True, **DEFAULT_RETRY_KW)
def calculate_daily_metrics(self):
    """
    Calculate and save today's metrics for all referral links.

    Fixes:
    - Avoid per-link queries: aggregate clicks and signups grouped by referral_link_id.
    - Compute click-to-signup rate safely.
    """

    today = timezone.now().date()

    clicks = (
        ClickEvent.objects.filter(timestamp__date=today)
        .values("referral_link_id")
        .annotate(n=Count("id"))
    )
    signups = (
        SignupEvent.objects.filter(timestamp__date=today)
        .values("referral_link_id")
        .annotate(n=Count("id"))
    )

    click_map = {r["referral_link_id"]: r["n"] for r in clicks}
    signup_map = {r["referral_link_id"]: r["n"] for r in signups}

    referral_links = ReferralLink.objects.all().select_related("officer", "campaign")

    updated = 0
    for rl in referral_links:
        c = int(click_map.get(rl.id, 0) or 0)
        s = int(signup_map.get(rl.id, 0) or 0)
        rate = (s / c * 100.0) if c > 0 else 0.0

        DailyMetrics.objects.update_or_create(
            referral_link=rl,
            officer=rl.officer,
            campaign=rl.campaign,
            metric_date=today,
            defaults={
                "total_clicks": c,
                "total_signups": s,
                "click_to_signup_rate": rate,
            },
        )
        updated += 1

    logger.info("Calculated daily metrics for %d referral links", updated)
    return f"Calculated daily metrics for {updated} referral links"


@app.task(bind=True, **DEFAULT_RETRY_KW)
def export_daily_aggregates(self):
    """
    Main daily pipeline:
    1) calculate_daily_metrics (serial)
    2) then in parallel: export_campaign_summary, export_time_series, export_officer_summary

    Fixes:
    - Tasks are not called synchronously; they’re executed as Celery tasks with retries.
    - If one parallel task fails, it retries independently.
    """
    job = chain(
        calculate_daily_metrics.s(),
        group(
            export_campaign_summary.s(),
            export_time_series.s(),
            export_officer_summary.s(),
        ),
    )()

    logger.info("Triggered daily aggregate pipeline: %s", job.id)
    try:
        children = [c.id for c in (job.children or [])]
    except Exception:
        children = []
    return {"root_id": job.id, "children": children}


@app.task(bind=True)
def debug_task(self):
    logger.info("Debug task request: %r", self.request)
    return f"Request: {self.request!r}"
