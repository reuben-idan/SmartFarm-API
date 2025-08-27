import random
from datetime import date, timedelta
from django.core.management.base import BaseCommand
from faker import Faker

from crops.models import Crop, Season
from prices.models import MarketPrice


COMMON_CROPS = [
    "Maize",
    "Beans",
    "Wheat",
    "Rice",
    "Potato",
]

REGIONS = [
    "Nairobi",
    "Kisumu",
    "Mombasa",
    "Nakuru",
    "Eldoret",
]


class Command(BaseCommand):
    help = "Seed market prices for common crops across regions. Deterministic via --seed."

    def add_arguments(self, parser):
        parser.add_argument("--seed", type=int, default=42, help="Random seed for determinism")
        parser.add_argument("--days", type=int, default=30, help="Number of past days to generate")
        parser.add_argument("--clear", action="store_true", help="Clear existing MarketPrice entries before seeding")

    def handle(self, *args, **options):
        seed = options["seed"]
        days = options["days"]
        clear = options["clear"]

        fake = Faker()
        Faker.seed(seed)
        random.seed(seed)

        if clear:
            MarketPrice.objects.all().delete()

        # Ensure crops exist
        crops = []
        for name in COMMON_CROPS:
            crop, _ = Crop.objects.get_or_create(
                name=name,
                defaults={
                    "season": Season.MAJOR,
                    "soil_type": "loamy",
                    "regions": REGIONS,
                    "recommended_inputs": {"fertilizer": "NPK"},
                    "maturity_days": random.randint(60, 180),
                },
            )
            crops.append(crop)

        today = date.today()
        created = 0

        for crop in crops:
            # baseline price per crop to keep values plausible
            base_price = random.uniform(10, 200)
            for region in REGIONS:
                price = base_price * random.uniform(0.8, 1.2)
                for i in range(days):
                    the_date = today - timedelta(days=i)
                    # small day-to-day variation
                    price = max(1.0, price * random.uniform(0.98, 1.02))
                    MarketPrice.objects.update_or_create(
                        crop=crop,
                        region=region,
                        date=the_date,
                        defaults={"price": round(price, 2)},
                    )
                    created += 1

        self.stdout.write(self.style.SUCCESS(f"Seeded market prices. Entries affected ~{created}"))
