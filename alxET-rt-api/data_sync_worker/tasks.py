import os
import json
from datetime import datetime, timedelta

# Import the configured Celery app from celery.py
from .celery import app

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')


def get_google_sheet_client():
    """Get authenticated Google Sheets client."""
    import gspread

    service_account_json = os.getenv('GOOGLE_SERVICE_ACCOUNT_JSON')
    if not service_account_json:
        raise ValueError("GOOGLE_SERVICE_ACCOUNT_JSON not set in environment")

    credentials = json.loads(service_account_json)
    gc = gspread.service_account_from_dict(credentials)
    return gc


def get_sheet_id():
    """Get the Google Sheet ID from environment."""
    sheet_id = os.getenv('GOOGLE_SHEET_ID')
    if not sheet_id:
        raise ValueError("GOOGLE_SHEET_ID not set in environment")
    return sheet_id


@app.task
def export_raw_data():
    """Export raw click and signup events to Sheet 1: Tracker_Raw_Data."""
    from django.utils import timezone
    from tracking_service.models import ClickEvent, SignupEvent

    try:
        gc = get_google_sheet_client()
        sheet_id = get_sheet_id()
        sheet = gc.open_by_key(sheet_id)
        worksheet = sheet.worksheet("Tracker_Raw_Data")

        # Clear existing data and add headers
        worksheet.clear()
        headers = [
            "Timestamp", "EventType", "ReferralLinkID", "OfficerID", 
            "CampaignID", "CampaignName", "UserEmailHash", "IP", "UserAgent"
        ]
        worksheet.append_row(headers)

        # Get events from the last hour (for real-time append)
        one_hour_ago = timezone.now() - timedelta(hours=1)

        # Click events
        click_events = ClickEvent.objects.filter(timestamp__gte=one_hour_ago).select_related(
            'referral_link__officer__user', 'referral_link__campaign'
        )

        click_rows = []
        for event in click_events:
            click_rows.append([
                event.timestamp.isoformat(),
                'click',
                str(event.referral_link.id),
                str(event.referral_link.officer.id),
                str(event.referral_link.campaign.id),
                event.referral_link.campaign.name,
                '',  # userEmailHash - not available in ClickEvent
                event.ip or '',
                event.user_agent or ''
            ])

        # Signup events
        signup_events = SignupEvent.objects.filter(timestamp__gte=one_hour_ago).select_related(
            'referral_link__officer__user', 'referral_link__campaign', 'click_event'
        )

        signup_rows = []
        for event in signup_events:
            signup_rows.append([
                event.timestamp.isoformat(),
                'signup',
                str(event.referral_link.id),
                str(event.referral_link.officer.id),
                str(event.referral_link.campaign.id),
                event.referral_link.campaign.name,
                '', 
                event.click_event.ip if event.click_event else '',
                event.click_event.user_agent if event.click_event else ''
            ])

        # Append rows
        all_rows = click_rows + signup_rows
        if all_rows:
            worksheet.append_rows(all_rows)

        return f"Exported {len(all_rows)} raw events"

    except Exception as e:
        return f"Error exporting raw data: {str(e)}"


@app.task
def export_officer_summary():
    """Export aggregated officer summary to Sheet 2: Officer_Summary."""
    from auth_service.models import Officer
    from dashboard_service.models import DailyMetrics
    from django.db.models import Sum, Avg

    try:
        gc = get_google_sheet_client()
        sheet_id = get_sheet_id()
        sheet = gc.open_by_key(sheet_id)
        worksheet = sheet.worksheet("Officer_Summary")

        # Clear existing data (overwrite mode)
        worksheet.clear()

        # Add headers
        headers = ["OfficerID", "OfficerName", "TotalClicks", "TotalSignups", "ClickToSignupRate"]
        worksheet.append_row(headers)

        # Aggregate data by officer from DailyMetrics
        officers = Officer.objects.all().select_related('user')

        rows = []
        for officer in officers:
            # Aggregate from DailyMetrics
            metrics = DailyMetrics.objects.filter(officer=officer).aggregate(
                total_clicks=Sum('total_clicks'),
                total_signups=Sum('total_signups'),
                avg_rate=Avg('click_to_signup_rate')
            )

            total_clicks = metrics['total_clicks'] or 0
            total_signups = metrics['total_signups'] or 0
            avg_rate = metrics['avg_rate'] or 0

            rows.append([
                str(officer.id),
                officer.user.full_name,
                total_clicks,
                total_signups,
                round(avg_rate, 2)
            ])

        # Append rows
        if rows:
            worksheet.append_rows(rows)

        return f"Exported officer summary for {len(rows)} officers"

    except Exception as e:
        return f"Error exporting officer summary: {str(e)}"


@app.task
def export_campaign_summary():
    """Export aggregated campaign summary to Sheet 3: Campaign_Summary."""
    from dashboard_service.models import Campaign, DailyMetrics
    from django.db.models import Sum, Avg

    try:
        gc = get_google_sheet_client()
        sheet_id = get_sheet_id()
        sheet = gc.open_by_key(sheet_id)
        worksheet = sheet.worksheet("Campaign_Summary")

        # Clear existing data (overwrite mode)
        worksheet.clear()

        # Add headers
        headers = ["CampaignID", "CampaignName", "StartDate", "EndDate", "TotalClicks", "TotalSignups", "ClickToSignupRate", "AverageSignupsPerDay"]
        worksheet.append_row(headers)

        # Aggregate data by campaign from DailyMetrics
        campaigns = Campaign.objects.all()

        rows = []
        for campaign in campaigns:
            # Aggregate from DailyMetrics
            metrics = DailyMetrics.objects.filter(campaign=campaign).aggregate(
                total_clicks=Sum('total_clicks'),
                total_signups=Sum('total_signups'),
                avg_rate=Avg('click_to_signup_rate')
            )

            total_clicks = metrics['total_clicks'] or 0
            total_signups = metrics['total_signups'] or 0
            avg_rate = metrics['avg_rate'] or 0

            # Calculate average signups per day
            campaign_duration = (campaign.end_date - campaign.start_date).days
            avg_signups_per_day = total_signups / campaign_duration if campaign_duration > 0 else 0

            rows.append([
                str(campaign.id),
                campaign.name,
                campaign.start_date.isoformat(),
                campaign.end_date.isoformat(),
                total_clicks,
                total_signups,
                round(avg_rate, 2),
                round(avg_signups_per_day, 2)
            ])

        # Append rows
        if rows:
            worksheet.append_rows(rows)

        return f"Exported campaign summary for {len(rows)} campaigns"

    except Exception as e:
        return f"Error exporting campaign summary: {str(e)}"


@app.task
def export_time_series():
    """Export time series data to Sheet 4: Time_Series_Data."""
    from django.utils import timezone
    from dashboard_service.models import DailyMetrics
    from django.db.models import Sum, Avg

    try:
        gc = get_google_sheet_client()
        sheet_id = get_sheet_id()
        sheet = gc.open_by_key(sheet_id)
        worksheet = sheet.worksheet("Time_Series_Data")

        # Clear existing data (overwrite mode)
        worksheet.clear()

        # Add headers
        headers = ["Date", "TotalClicks", "TotalSignups", "ClickToSignupRate"]
        worksheet.append_row(headers)

        # Get data for last 90 days from DailyMetrics
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=90)

        rows = []
        current_date = start_date
        while current_date <= end_date:
            # Aggregate from DailyMetrics for the day
            metrics = DailyMetrics.objects.filter(metric_date=current_date).aggregate(
                total_clicks=Sum('total_clicks'),
                total_signups=Sum('total_signups'),
                avg_rate=Avg('click_to_signup_rate')
            )

            clicks = metrics['total_clicks'] or 0
            signups = metrics['total_signups'] or 0
            avg_rate = metrics['avg_rate'] or 0

            rows.append([
                current_date.isoformat(),
                clicks,
                signups,
                round(avg_rate, 2)
            ])

            current_date += timedelta(days=1)

        # Append rows
        if rows:
            worksheet.append_rows(rows)

        return f"Exported time series data for {len(rows)} days"

    except Exception as e:
        return f"Error exporting time series: {str(e)}"


@app.task
def calculate_daily_metrics():
    """Calculate and save daily metrics for all officers and campaigns."""
    from django.utils import timezone
    from dashboard_service.models import ReferralLink, DailyMetrics
    from tracking_service.models import ClickEvent, SignupEvent

    today = timezone.now().date()

    # Get all referral links
    referral_links = ReferralLink.objects.all().select_related('officer', 'campaign')

    for referral_link in referral_links:
        # Count clicks and signups for today
        clicks = ClickEvent.objects.filter(
            referral_link=referral_link,
            timestamp__date=today
        ).count()

        signups = SignupEvent.objects.filter(
            referral_link=referral_link,
            timestamp__date=today
        ).count()

        # Calculate click to signup rate
        click_to_signup_rate = (signups / clicks * 100) if clicks > 0 else 0

        # Update or create DailyMetrics
        DailyMetrics.objects.update_or_create(
            referral_link=referral_link,
            officer=referral_link.officer,
            campaign=referral_link.campaign,
            metric_date=today,
            defaults={
                'total_clicks': clicks,
                'total_signups': signups,
                'click_to_signup_rate': click_to_signup_rate
            }
        )

    return f"Calculated daily metrics for {len(referral_links)} referral links"


@app.task
def export_daily_aggregates():
    """Main task to calculate metrics and export all daily aggregates."""
    results = []
    results.append(calculate_daily_metrics())
    results.append(export_campaign_summary())
    results.append(export_time_series())
    results.append(export_officer_summary())  # Also run this daily for consistency
    return results
