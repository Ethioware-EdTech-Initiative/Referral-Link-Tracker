# Data Sync Worker

A Celery-based background task system for aggregating referral tracking data and exporting to Google Sheets.

## Overview

The Data Sync Worker handles background processing for the Referral Link Tracker system, including:

- **Real-time Data Aggregation**: Processes click and signup events
- **Metrics Calculation**: Computes daily performance metrics
- **Google Sheets Export**: Automated data export to Google Sheets
- **Scheduled Tasks**: Daily reporting and analytics

## Features

- Celery task queue with Redis broker
- Google Sheets API integration
- Automated daily metrics calculation
- Multiple export formats (raw data, summaries, time series)
- Windows-compatible with solo pool option

## Quick Setup

### 1. Prerequisites

- Python 3.8+
- Redis (local or cloud service)
- Google Cloud Project with Sheets API enabled
- Service Account with Google Sheets permissions

### 2. Environment Variables

Add these to your main `.env` file:

```env
# Redis Configuration
REDIS_URL=rediss://default:your-redis-password@your-redis-host:6379

# Google Sheets Configuration
GOOGLE_SHEET_ID=your-google-sheet-id-here
GOOGLE_SERVICE_ACCOUNT_JSON={"type": "service_account", "project_id": "your-project", ...}
```

### 3. Google Sheets Setup

1. **Create Service Account**:
   - Go to Google Cloud Console > IAM & Admin > Service Accounts
   - Create new service account with Sheets API permissions

2. **Generate JSON Key**:
   - Download the JSON key file
   - Copy its contents to `GOOGLE_SERVICE_ACCOUNT_JSON`

3. **Create Google Sheet**:
   - Create new Google Sheet
   - Copy Sheet ID from URL (between `/d/` and `/edit`)
   - Share sheet with service account email

4. **Set up Worksheets**:
   ```
   Tracker_Raw_Data
   Officer_Summary
   Campaign_Summary
   Time_Series_Data
   ```

## Usage

### Synchronous Testing (Recommended for Windows)

```bash
# Export all data types synchronously
python manage.py export_data --type=all --sync

# Export specific data types
python manage.py export_data --type=raw --sync      # Raw events only
python manage.py export_data --type=daily --sync    # Aggregates only
python manage.py export_data --type=metrics --sync  # Metrics only
```

### Asynchronous Production Mode (Linux/Mac)

```bash
# Start Celery worker
celery -A data_sync_worker worker --loglevel=info

# Queue export tasks
python manage.py export_data --type=all
```

### Windows-Specific Setup

For Windows development, use the `--sync` flag or `--pool=solo`:

```bash
# Synchronous mode (no worker needed)
python manage.py export_data --type=all --sync

# With worker (use solo pool)
celery -A data_sync_worker worker --pool=solo --loglevel=info
```

## Export Data Structure

### Tracker_Raw_Data Sheet
| Column | Description |
|--------|-------------|
| Timestamp | Event timestamp |
| EventType | 'click' or 'signup' |
| ReferralLinkID | Referral link identifier |
| OfficerID | Officer identifier |
| CampaignID | Campaign identifier |
| CampaignName | Campaign name |
| UserEmailHash | User identifier (if available) |
| IP | User IP address |
| UserAgent | Browser user agent |

### Officer_Summary Sheet
- Officer performance metrics
- Click counts and conversion rates
- Aggregated by officer

### Campaign_Summary Sheet
- Campaign-level analytics
- Conversion rates and performance
- Aggregated by campaign

### Time_Series_Data Sheet
- Daily metrics over 90 days
- Trends and historical data
- Date-based aggregations

## Task Functions

### Core Tasks

- `export_raw_data()`: Export recent click/signup events
- `calculate_daily_metrics()`: Compute daily performance metrics
- `export_officer_summary()`: Generate officer performance reports
- `export_campaign_summary()`: Generate campaign analytics
- `export_time_series()`: Generate historical trend data

### Management Command

The `export_data` management command supports:

```bash
python manage.py export_data --type=all --sync  # Export everything
python manage.py export_data --type=raw --sync  # Raw data only
python manage.py export_data --type=daily --sync # Aggregates only
python manage.py export_data --type=metrics --sync # Metrics only
```

## Configuration

### Celery Settings (celery.py)

```python
app.conf.update(
    broker_url=os.getenv('REDIS_URL'),
    result_backend=os.getenv('REDIS_URL'),
    timezone='UTC',
    beat_schedule={
        'daily-export': {
            'task': 'data_sync_worker.tasks.export_daily_aggregates',
            'schedule': crontab(hour=1, minute=0),  # Daily at 1 AM
        },
    }
)
```

### SSL Configuration for Redis

For cloud Redis services like Upstash:

```python
app.conf.update(
    broker_use_ssl={'ssl_cert_reqs': ssl.CERT_NONE},
    redis_backend_use_ssl={'ssl_cert_reqs': ssl.CERT_NONE}
)
```

## Troubleshooting

### Common Issues

1. **Redis Connection Failed**
   ```bash
   # Test Redis connection
   python -c "import redis; r = redis.from_url('your-redis-url'); print(r.ping())"
   ```

2. **Google Sheets Permission Error**
   ```bash
   # Test Google Sheets connection
   python manage.py shell -c "from data_sync_worker.tasks import get_google_sheet_client; print('OK' if get_google_sheet_client() else 'Failed')"
   ```

3. **Windows Celery Issues**
   - Use `--pool=solo` flag
   - Or use `--sync` flag for testing
   - Consider Linux/Mac for production

4. **Empty Export Results**
   - Check if test data exists in database
   - Verify Google Sheet permissions
   - Check Celery worker logs

### Debug Commands

```bash
# Check registered tasks
celery -A data_sync_worker inspect registered

# Check active tasks
celery -A data_sync_worker inspect active

# Test specific task
python manage.py shell -c "from data_sync_worker.tasks import export_raw_data; result = export_raw_data(); print(result)"
```

## Development

### Adding New Export Tasks

1. Create task function in `tasks.py`
2. Add to Celery beat schedule in `celery.py`
3. Update management command if needed
4. Add to Google Sheet structure

### Testing New Tasks

```python
# Test in Django shell
python manage.py shell
>>> from data_sync_worker.tasks import your_new_task
>>> result = your_new_task()
>>> print(result)
```

## Production Considerations

- Use Linux/Mac servers for better Celery performance
- Set up proper Redis monitoring
- Configure automated backups
- Use process managers (Supervisor, systemd)
- Set up logging and monitoring
- Configure SSL certificates properly

## Dependencies

- `celery>=5.5.3`: Task queue
- `redis>=4.0.0`: Redis client
- `gspread>=5.0.0`: Google Sheets API
- `django-celery-beat`: Scheduled tasks (optional)
- `django-celery-results`: Task results (optional)
