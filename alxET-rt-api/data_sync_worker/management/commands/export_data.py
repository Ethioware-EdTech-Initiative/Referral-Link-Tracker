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

    def handle(self, *args, **options):
        export_type = options['type']

        if export_type in ['metrics', 'all']:
            self.stdout.write('Starting daily metrics calculation...')
            result = calculate_daily_metrics.delay()
            self.stdout.write(f'Daily metrics task queued: {result.id}')

        if export_type in ['daily', 'all']:
            self.stdout.write('Starting daily aggregates export...')
            result = export_daily_aggregates.delay()
            self.stdout.write(f'Daily aggregates task queued: {result.id}')

        if export_type in ['raw', 'all']:
            self.stdout.write('Starting raw data export...')
            result = export_raw_data.delay()
            self.stdout.write(f'Raw data task queued: {result.id}')

        self.stdout.write(self.style.SUCCESS('Export tasks have been queued.'))
