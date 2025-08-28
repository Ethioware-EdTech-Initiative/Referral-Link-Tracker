from django.apps import AppConfig


class DashboardServiceConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'dashboard_service'
    
    def ready(self):
        import dashboard_service.signals