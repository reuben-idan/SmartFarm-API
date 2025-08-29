""
Django management command to wait for the database to be available.
"""
import time
from django.core.management.base import BaseCommand
from django.db import connections
from django.db.utils import OperationalError


class Command(BaseCommand):
    """Django command to wait for database."""

    def handle(self, *args, **options):
        """Entrypoint for command."""
        self.stdout.write('Waiting for database...')
        db_conn = None
        max_retries = 30
        retry_count = 0

        while not db_conn and retry_count < max_retries:
            try:
                # Try to connect to the database
                db_conn = connections['default']
                db_conn.ensure_connection()
                self.stdout.write(self.style.SUCCESS('Database is available!'))
                return
            except OperationalError:
                retry_count += 1
                self.stdout.write(f'Database unavailable, waiting 1 second... (Attempt {retry_count}/{max_retries})')
                time.sleep(1)

        self.stdout.write(self.style.ERROR('Could not connect to database after maximum retries'))
        raise OperationalError('Database connection failed after maximum retries')
