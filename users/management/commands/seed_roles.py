from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType
from django.conf import settings


class Command(BaseCommand):
    help = 'Creates the default user roles and permissions'

    ROLES = [
        'farmer',
        'agronomist',
        'supplier',
        'extension_officer',
        'admin'
    ]

    def handle(self, *args, **options):
        for role in self.ROLES:
            group, created = Group.objects.get_or_create(name=role)
            if created:
                self.stdout.write(self.style.SUCCESS(f'Successfully created {role} group'))
            else:
                self.stdout.write(self.style.WARNING(f'{role} group already exists'))
        
        # Assign all permissions to admin group
        admin_group = Group.objects.get(name='admin')
        admin_group.permissions.set(Permission.objects.all())
        self.stdout.write(self.style.SUCCESS('Assigned all permissions to admin group'))
        
        self.stdout.write(self.style.SUCCESS('Successfully created all roles'))
