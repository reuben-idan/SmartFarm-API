from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.prices.models import MarketPrice
from apps.crops.models import Crop

class Command(BaseCommand):
    help = 'Seed database with sample market price data'

    def handle(self, *args, **options):
        # Get or create crops first
        maize, _ = Crop.objects.get_or_create(
            name='Maize',
            defaults={'variety': 'DK 777'}
        )
        beans, _ = Crop.objects.get_or_create(
            name='Beans',
            defaults={'variety': 'Mwitemania'}
        )
        tea, _ = Crop.objects.get_or_create(
            name='Tea',
            defaults={'variety': 'TRFK 301/4'}
        )

        # Sample market data (prices in KES per kg)
        market_data = [
            {'crop': maize, 'price': 32, 'market': 'Nairobi', 'date': timezone.now()},
            {'crop': maize, 'price': 28, 'market': 'Nakuru', 'date': timezone.now()},
            {'crop': beans, 'price': 110, 'market': 'Nairobi', 'date': timezone.now()},
            {'crop': beans, 'price': 95, 'market': 'Kisumu', 'date': timezone.now()},
            {'crop': tea, 'price': 55, 'market': 'Mombasa', 'date': timezone.now()},
            {'crop': tea, 'price': 50, 'market': 'Nairobi', 'date': timezone.now()},
        ]

        created_count = 0
        for data in market_data:
            _, created = MarketPrice.objects.get_or_create(
                crop=data['crop'],
                market=data['market'],
                date=data['date'].date(),
                defaults={'price': data['price']}
            )
            if created:
                created_count += 1

        self.stdout.write(
            self.style.SUCCESS(f'Successfully seeded {created_count} market prices')
        )
