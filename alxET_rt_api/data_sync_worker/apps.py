from django.apps import AppConfig


class DataSyncWorkerConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'data_sync_worker'

    def ready(self):
        # Import tasks to ensure they are registered with Celery
        try:
            from . import tasks
        except ImportError:
            pass
