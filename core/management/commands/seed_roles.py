from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType
from django.db import transaction

class Command(BaseCommand):
    help = 'Seed database with default roles and permissions'

    def handle(self, *args, **options):
        with transaction.atomic():
            # Create or get groups
            farmer_group, created = Group.objects.get_or_create(name='farmer')
            supplier_group, _ = Group.objects.get_or_create(name='supplier')
            agronomist_group, _ = Group.objects.get_or_create(name='agronomist')
            extension_group, _ = Group.objects.get_or_create(name='extension_officer')
            
            # Get all permissions for each app
            apps = ['farmers', 'crops', 'prices', 'suppliers', 'yields', 'support']
            for app in apps:
                content_types = ContentType.objects.filter(app_label=app)
                for ct in content_types:
                    permissions = Permission.objects.filter(content_type=ct)
                    for perm in permissions:
                        if app == 'farmers':
                            farmer_group.permissions.add(perm)
                        if app in ['suppliers', 'prices']:
                            supplier_group.permissions.add(perm)
                        if app in ['crops', 'yields']:
                            agronomist_group.permissions.add(perm)
                        extension_group.permissions.add(perm)  # Extension officers get all permissions

            self.stdout.write(self.style.SUCCESS('Successfully seeded roles and permissions'))
