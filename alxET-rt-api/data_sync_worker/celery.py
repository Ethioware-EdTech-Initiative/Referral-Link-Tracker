import os
from celery import Celery
from celery.schedules import crontab

# Set the default Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'alx_recruitment_tracker.settings')

app = Celery('data_sync_worker')

app.config_from_object('django.conf:settings', namespace='CELERY')

# Discover tasks from this app
app.autodiscover_tasks(['data_sync_worker'])

# Define the beat schedule
app.conf.beat_schedule = {
    'export-daily-aggregates': {
        'task': 'data_sync_worker.tasks.export_daily_aggregates',
        'schedule': crontab(hour=3, minute=0),  
    },
    'export-hourly-officer-summary': {
        'task': 'data_sync_worker.tasks.export_officer_summary',
        'schedule': crontab(minute='*/60'),  
    },
    'export-time-series': {
        'task': 'data_sync_worker.tasks.export_time_series',
        'schedule': crontab(hour=3, minute=0),  
    },
}

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
