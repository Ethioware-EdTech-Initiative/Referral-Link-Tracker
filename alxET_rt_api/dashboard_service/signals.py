# tracking_service/signals.py
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.core.cache import cache
from .models import DailyMetrics, Campaign, ReferralLink

def clear_stats_cache():
    cache.clear()

@receiver([post_save, post_delete], sender=DailyMetrics)
@receiver([post_save, post_delete], sender=Campaign)
@receiver([post_save, post_delete], sender=ReferralLink)
def invalidate_cache(sender, **kwargs):
    clear_stats_cache()
