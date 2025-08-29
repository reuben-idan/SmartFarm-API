from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType
from django.conf import settings

class Command(BaseCommand):
    help = 'Creates default user groups with appropriate permissions'

    def handle(self, *args, **options):
        # Define default groups and their permissions
        groups = {
            'Farmers': {
                'permissions': [
                    ('add_crop', 'crops'),
                    ('change_crop', 'crops'),
                    ('view_crop', 'crops'),
                    ('add_yield', 'yields'),
                    ('view_yield', 'yields'),
                    ('view_marketprice', 'prices'),
                ]
            },
            'Agronomists': {
                'permissions': [
                    ('view_crop', 'crops'),
                    ('change_crop', 'crops'),
                    ('view_yield', 'yields'),
                    ('view_marketprice', 'prices'),
                    ('add_recommendation', 'recommendations'),
                    ('change_recommendation', 'recommendations'),
                ]
            },
            'Suppliers': {
                'permissions': [
                    ('add_marketprice', 'prices'),
                    ('change_marketprice', 'prices'),
                    ('view_marketprice', 'prices'),
                ]
            },
            'Extension Officers': {
                'permissions': [
                    ('view_crop', 'crops'),
                    ('view_yield', 'yields'),
                    ('view_marketprice', 'prices'),
                    ('add_recommendation', 'recommendations'),
                    ('change_recommendation', 'recommendations'),
                ]
            },
        }

        # Create groups and assign permissions
        for group_name, group_data in groups.items():
            group, created = Group.objects.get_or_create(name=group_name)
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created group: {group_name}'))
            
            # Clear existing permissions
            group.permissions.clear()
            
            # Add new permissions
            for codename, app_label in group_data['permissions']:
                try:
                    content_type = ContentType.objects.get(app_label=app_label)
                    permission = Permission.objects.get(
                        content_type=content_type,
                        codename=codename
                    )
                    group.permissions.add(permission)
                except (ContentType.DoesNotExist, Permission.DoesNotExist):
                    self.stdout.write(
                        self.style.WARNING(
                            f'Permission {codename} in app {app_label} not found. Skipping.'
                        )
                    )
            
            self.stdout.write(
                self.style.SUCCESS(f'Assigned permissions to {group_name} group')
            )
        
        self.stdout.write(self.style.SUCCESS('Successfully created default groups and permissions'))
