from django.core.management.base import BaseCommand
from apps.crops.models import Crop

class Command(BaseCommand):
    help = 'Seed database with common crop data'

    def handle(self, *args, **options):
        crops = [
            {
                'name': 'Maize',
                'variety': 'DK 777',
                'planting_season': 'Long Rains',
                'growing_period_days': 120,
                'water_requirements_mm': 500,
                'soil_type': 'Loamy',
                'fertilizer_recommendation': 'NPK 23:23:0 at planting, CAN at 6 weeks',
                'pest_disease_management': 'Control fall armyworm with appropriate pesticides',
                'harvesting_instructions': 'Harvest when moisture content is below 15%',
                'yield_per_hectare': 40,  # in 90kg bags
                'price_per_kilogram': 30,  # KES
                'is_active': True
            },
            {
                'name': 'Beans',
                'variety': 'Mwitemania',
                'planting_season': 'Short Rains',
                'growing_period_days': 90,
                'water_requirements_mm': 400,
                'soil_type': 'Well-drained',
                'fertilizer_recommendation': 'DAP at planting',
                'pest_disease_management': 'Control aphids and bean flies',
                'harvesting_instructions': 'Harvest when pods are dry',
                'yield_per_hectare': 15,  # in 90kg bags
                'price_per_kilogram': 100,  # KES
                'is_active': True
            },
            {
                'name': 'Tea',
                'variety': 'TRFK 301/4',
                'planting_season': 'Year-round',
                'growing_period_days': 90,  # between flushes
                'water_requirements_mm': 1200,
                'soil_type': 'Volcanic',
                'fertilizer_recommendation': 'NPK 26:5:5 + TE',
                'pest_disease_management': 'Control tea mosquito bug and red spider mite',
                'harvesting_instructions': 'Pluck two leaves and a bud',
                'yield_per_hectare': 2500,  # kg made tea
                'price_per_kilogram': 50,  # KES (farm gate)
                'is_active': True
            }
        ]

        created_count = 0
        for crop_data in crops:
            _, created = Crop.objects.get_or_create(
                name=crop_data['name'],
                defaults=crop_data
            )
            if created:
                created_count += 1

        self.stdout.write(
            self.style.SUCCESS(f'Successfully seeded {created_count} crops')
        )
