import os
import ssl
from celery import Celery
from celery.schedules import crontab
from dotenv import load_dotenv

load_dotenv()


os.environ.setdefault("DJANGO_SETTINGS_MODULE", "alx_recruitment_tracker.settings")

app = Celery("data_sync_worker")
app.conf.broker_use_ssl = {"ssl_cert_reqs": ssl.CERT_NONE}
app.conf.redis_backend_use_ssl = {"ssl_cert_reqs": ssl.CERT_NONE}

BROKER_URL = os.getenv("REDIS_URL")
RESULT_URL = os.getenv("REDIS_URL")

# Core Celery config
app.conf.update(
    broker_url=BROKER_URL,
    result_backend=RESULT_URL,
    accept_content=["json"],
    task_serializer="json",
    result_serializer="json",
    timezone="UTC",
)

app.config_from_object("django.conf:settings", namespace="CELERY")


app.autodiscover_tasks()


app.conf.beat_schedule = {
    "export-raw-data": {
        "task": "data_sync_worker.tasks.export_raw_data",
        "schedule": crontab(minute="*/15"),
    },
    "export-daily-aggregates": {
        "task": "data_sync_worker.tasks.export_daily_aggregates",
        "schedule": crontab(hour=3, minute=0),
    },

    "export-time-series": {
        "task": "data_sync_worker.tasks.export_time_series",
        "schedule": crontab(hour=4, minute=30),
    },
}

# # Testing purposes 
# app.conf.beat_schedule = {
#     "export-raw-data": {
#         "task": "data_sync_worker.tasks.export_raw_data",
#         "schedule": crontab(minute="*"),  # runs every 1 minute
#     },
#     "export-daily-aggregates": {
#         "task": "data_sync_worker.tasks.export_daily_aggregates",
#         "schedule": crontab(minute="*"),  # runs every 1 minute
#     },
#     "export-time-series": {
#         "task": "data_sync_worker.tasks.export_time_series",
#         "schedule": crontab(minute="*"),  # runs every 1 minute
#     },
# }


@app.task(bind=True)
def debug_task(self):
    print(f"Request: {self.request!r}")
