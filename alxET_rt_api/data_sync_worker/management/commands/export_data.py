from django.core.management.base import BaseCommand
from data_sync_worker.tasks import export_daily_aggregates, export_raw_data, calculate_daily_metrics


class Command(BaseCommand):
    help = 'Export data to Google Sheets'

    def add_arguments(self, parser):
        parser.add_argument(
            '--type',
            type=str,
            choices=['daily', 'raw', 'metrics', 'all'],
            default='all',
            help='Type of export: daily aggregates, raw data, calculate metrics, or all'
        )
        parser.add_argument(
            '--sync',
            action='store_true',
            help='Run tasks synchronously (for testing without Celery worker)'
        )

    def handle(self, *args, **options):
        export_type = options['type']
        sync_mode = options['sync']

        if export_type in ['metrics', 'all']:
            self.stdout.write('Starting daily metrics calculation...')
            if sync_mode:
                result = calculate_daily_metrics()
                self.stdout.write(f'Daily metrics completed: {result}')
            else:
                result = calculate_daily_metrics.delay()
                self.stdout.write(f'Daily metrics task queued: {result.id}')

        if export_type in ['daily', 'all']:
            self.stdout.write('Starting daily aggregates export...')
            if sync_mode:
                result = export_daily_aggregates()
                self.stdout.write(f'Daily aggregates completed: {result}')
            else:
                result = export_daily_aggregates.delay()
                self.stdout.write(f'Daily aggregates task queued: {result.id}')

        if export_type in ['raw', 'all']:
            self.stdout.write('Starting raw data export...')
            if sync_mode:
                result = export_raw_data()
                self.stdout.write(f'Raw data export completed: {result}')
            else:
                result = export_raw_data.delay()
                self.stdout.write(f'Raw data task queued: {result.id}')

        if sync_mode:
            self.stdout.write(self.style.SUCCESS('All export tasks completed synchronously.'))
        else:
            self.stdout.write(self.style.SUCCESS('Export tasks have been queued.'))
