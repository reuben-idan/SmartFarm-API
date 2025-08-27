from decimal import Decimal
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status

from crops.models import Crop, Season
from yields.models import YieldForecast, YieldMethod


class YieldForecastTests(APITestCase):
    def setUp(self):
        # Create crops that map to settings base yields
        self.maize = Crop.objects.create(
            name="Maize",
            season=Season.MAJOR,
            soil_type="loamy",
            regions=["Nairobi", "Kisumu"],
            recommended_inputs={},
            maturity_days=120,
        )
        self.wheat = Crop.objects.create(
            name="Wheat",
            season=Season.ALL,
            soil_type="sandy",
            regions=["Nakuru"],
            recommended_inputs={},
            maturity_days=150,
        )
        self.url = reverse('yield-forecast')

    def test_validation_missing_or_unsupported(self):
        # Missing params
        res = self.client.get(self.url)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

        # Unsupported region
        res = self.client.get(self.url, {
            'crop': 'Maize', 'region': 'Atlantis', 'season': Season.MAJOR, 'hectares': '1.0'
        })
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('region', res.json())

        # Unknown crop name
        res = self.client.get(self.url, {
            'crop': 'UnknownCrop', 'region': 'Nairobi', 'season': Season.MAJOR, 'hectares': '1.0'
        })
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

        # Hectares must be positive
        res = self.client.get(self.url, {
            'crop': 'Maize', 'region': 'Nairobi', 'season': Season.MAJOR, 'hectares': '0'
        })
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_formula_deterministic_by_name(self):
        # Settings: maize=4.0, nairobi=0.9, major=1.0; hectares=2.5 -> 4*0.9*1*2.5=9.0
        res = self.client.get(self.url, {
            'crop': 'Maize', 'region': 'Nairobi', 'season': Season.MAJOR, 'hectares': '2.50'
        })
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        data = res.json()
        self.assertEqual(data['crop'], 'Maize')
        self.assertEqual(data['region'], 'Nairobi')
        self.assertEqual(data['season'], Season.MAJOR)
        self.assertEqual(data['hectares'], '2.50')
        self.assertEqual(data['forecast_yield'], '9.00')
        self.assertIn('factors', data)
        self.assertAlmostEqual(data['factors']['base_yield_t_per_ha'], 4.0)
        self.assertAlmostEqual(data['factors']['regional_multiplier'], 0.9)
        self.assertAlmostEqual(data['factors']['season_factor'], 1.0)

    def test_formula_by_id_and_persistence(self):
        # Use wheat via id, region=nakuru(1.1), season=all(0.95), hectares=1.00 -> 3.5*1.1*0.95*1=3.6575 -> 3.66
        res = self.client.get(self.url, {
            'crop': str(self.wheat.id), 'region': 'Nakuru', 'season': Season.ALL, 'hectares': '1.00'
        })
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        data = res.json()
        self.assertEqual(data['forecast_yield'], '3.66')

        # Persistence
        self.assertEqual(YieldForecast.objects.count(), 1)
        yf = YieldForecast.objects.first()
        self.assertEqual(yf.crop_id, self.wheat.id)
        self.assertEqual(yf.crop_name, 'Wheat')
        self.assertEqual(yf.region, 'Nakuru')
        self.assertEqual(yf.season, Season.ALL)
        self.assertEqual(str(yf.hectares), '1.00')
        self.assertEqual(str(yf.forecast_yield), '3.66')
        self.assertEqual(yf.method, YieldMethod.MOCK_V1)
        self.assertIn('base_yield_t_per_ha', yf.factors)
