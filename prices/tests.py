from datetime import date, timedelta
from django.urls import reverse
from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status

from crops.models import Crop, Season
from prices.models import MarketPrice


class MarketPriceAPITest(APITestCase):
    def setUp(self):
        # Create crops
        self.maize = Crop.objects.create(
            name="Maize",
            season=Season.MAJOR,
            soil_type="loamy",
            regions=["Nairobi", "Kisumu"],
            recommended_inputs={"fertilizer": "NPK"},
            maturity_days=120,
        )
        self.beans = Crop.objects.create(
            name="Beans",
            season=Season.MINOR,
            soil_type="clay",
            regions=["Nairobi", "Mombasa"],
            recommended_inputs={"fertilizer": "DAP"},
            maturity_days=90,
        )

        # Create market prices with varying dates and regions
        today = date.today()
        self.p1 = MarketPrice.objects.create(crop=self.maize, region="Nairobi", price=100.50, date=today - timedelta(days=2))
        self.p2 = MarketPrice.objects.create(crop=self.maize, region="Nairobi", price=101.00, date=today - timedelta(days=1))
        self.p3 = MarketPrice.objects.create(crop=self.maize, region="Kisumu", price=98.75, date=today)
        self.p4 = MarketPrice.objects.create(crop=self.beans, region="Mombasa", price=80.00, date=today - timedelta(days=3))
        self.list_url = reverse('marketprice-list')

    def test_ordering_by_date_desc(self):
        res = self.client.get(self.list_url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        dates = [item['date'] for item in res.data['results']]
        # Ensure descending order
        self.assertEqual(dates, sorted(dates, reverse=True))

    def test_filter_by_crop_id(self):
        res = self.client.get(self.list_url, {"crop": self.maize.id})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        crop_ids = {item['crop'] for item in res.data['results']}
        self.assertEqual(crop_ids, {self.maize.id})

    def test_filter_by_crop_name(self):
        res = self.client.get(self.list_url, {"crop_name": "Beans"})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        names = {item['crop_name'] for item in res.data['results']}
        self.assertEqual(names, {"Beans"})

    def test_filter_by_region(self):
        res = self.client.get(self.list_url, {"region": "Nairobi"})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        regions = {item['region'] for item in res.data['results']}
        self.assertEqual(regions, {"Nairobi"})

    def test_filter_by_date_range(self):
        today = date.today()
        start = (today - timedelta(days=2)).isoformat()
        end = (today - timedelta(days=1)).isoformat()
        res = self.client.get(self.list_url, {"date_after": start, "date_before": end})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        dates = {item['date'] for item in res.data['results']}
        self.assertTrue(all(start <= d <= end for d in dates))
