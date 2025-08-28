import os
from celery import Celery
from celery.schedules import crontab
from dotenv import load_dotenv
import ssl

load_dotenv()
# Set the default Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'alx_recruitment_tracker.settings')

app = Celery('data_sync_worker')


# Use REDIS_URL from .env for broker and backend
app.conf.update(
    broker_url=os.getenv("REDIS_URL"),
    result_backend=os.getenv("REDIS_URL"),
    accept_content=['json'],
    task_serializer='json',
    result_serializer='json',
    timezone='UTC',
    broker_use_ssl={
        'ssl_cert_reqs': ssl.CERT_NONE
    },
    redis_backend_use_ssl={
        'ssl_cert_reqs': ssl.CERT_NONE
    },
)

app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks(['data_sync_worker'])

# Define the beat schedule
app.conf.beat_schedule = {
    'export-daily-aggregates': {
        'task': 'data_sync_worker.tasks.export_daily_aggregates',
        'schedule': crontab(hour=3, minute=0),  # Daily at 3 AM UTC
    },
    'export-hourly-officer-summary': {
        'task': 'data_sync_worker.tasks.export_officer_summary',
        'schedule': crontab(minute='*/60'),  # Every hour
    },
    'export-time-series': {
        'task': 'data_sync_worker.tasks.export_time_series',
        'schedule': crontab(hour=3, minute=0),  # Daily at 3 AM UTC
    },
}

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
