"""
Tests for the YieldForecastViewSet API endpoints.
"""
from datetime import date, timedelta
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.farmers.models import FarmerProfile
from apps.yields.models import YieldForecast, YieldMethod, Season

User = get_user_model()


class YieldForecastViewSetTests(APITestCase):
    """Test cases for YieldForecastViewSet."""

    def setUp(self):
        # Create test users
        self.admin_user = User.objects.create_superuser(
            email='admin@example.com',
            password='testpass123',
            first_name='Admin',
            last_name='User'
        )
        self.regular_user = User.objects.create_user(
            email='user@example.com',
            password='testpass123',
            first_name='Regular',
            last_name='User'
        )

        # Create farmer profiles
        self.farmer1 = FarmerProfile.objects.create(
            user=self.regular_user,
            phone_number='+1234567890',
            region='Test Region',
            district='Test District',
            village='Test Village',
            farm_size=5.5,
            is_verified=True
        )

        # Create seasons
        self.current_season = Season.objects.create(
            name='2023/2024',
            start_date=date(2023, 9, 1),
            end_date=date(2024, 8, 31),
            is_current=True
        )
        
        # Create yield methods
        self.method1 = YieldMethod.objects.create(
            name='Traditional',
            description='Traditional farming methods'
        )
        self.method2 = YieldMethod.objects.create(
            name='Modern',
            description='Modern farming techniques'
        )

        # Create yield forecasts
        self.yield1 = YieldForecast.objects.create(
            farmer=self.farmer1,
            season=self.current_season,
            method=self.method1,
            crop_type='Maize',
            expected_yield=1000.0,
            unit='kg',
            forecast_date=date.today(),
            harvest_date=date.today() + timedelta(days=90),
            status='pending',
            confidence=0.8
        )

        self.yield2 = YieldForecast.objects.create(
            farmer=self.farmer1,
            season=self.current_season,
            method=self.method2,
            crop_type='Beans',
            expected_yield=500.0,
            unit='kg',
            forecast_date=date.today(),
            harvest_date=date.today() + timedelta(days=100),
            status='in_progress',
            confidence=0.9
        )

        # URL for the API
        self.list_url = reverse('yieldforecast-list')

    def test_list_yield_forecasts_authenticated(self):
        ""Test that authenticated users can list yield forecasts.""
        self.client.force_authenticate(user=self.regular_user)
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 2)

    def test_list_yield_forecasts_unauthenticated(self):
        ""Test that unauthenticated users cannot list yield forecasts.""
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_retrieve_yield_forecast(self):
        ""Test retrieving a yield forecast.""
        self.client.force_authenticate(user=self.regular_user)
        url = reverse('yieldforecast-detail', args=[self.yield1.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['crop_type'], 'Maize')

    def test_filter_yield_forecasts_by_crop_type(self):
        ""Test filtering yield forecasts by crop type.""
        self.client.force_authenticate(user=self.regular_user)
        response = self.client.get(f"{self.list_url}?crop_type=Maize")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['crop_type'], 'Maize')

    def test_filter_yield_forecasts_by_status(self):
        ""Test filtering yield forecasts by status.""
        self.client.force_authenticate(user=self.regular_user)
        response = self.client.get(f"{self.list_url}?status=in_progress")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['status'], 'in_progress')

    def test_search_yield_forecasts(self):
        ""Test searching yield forecasts.""
        self.client.force_authenticate(user=self.regular_user)
        response = self.client.get(f"{self.list_url}?search=Maize")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['crop_type'], 'Maize')

    def test_ordering_yield_forecasts(self):
        ""Test ordering yield forecasts by expected yield.""
        self.client.force_authenticate(user=self.regular_user)
        response = self.client.get(f"{self.list_url}?ordering=expected_yield")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(float(response.data['results'][0]['expected_yield']), 500.0)
        self.assertEqual(float(response.data['results'][1]['expected_yield']), 1000.0)

    def test_yield_forecast_statistics(self):
        ""Test the yield forecast statistics endpoint.""
        self.client.force_authenticate(user=self.regular_user)
        url = f"{reverse('yieldforecast-statistics')}?season={self.current_season.id}"
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_expected_yield', response.data)
        self.assertIn('average_yield_per_farmer', response.data)
        self.assertIn('crop_distribution', response.data)

    def test_yield_forecast_trends(self):
        ""Test the yield forecast trends endpoint.""
        self.client.force_authenticate(user=self.regular_user)
        url = f"{reverse('yieldforecast-trends')}?days=30"
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('trends', response.data)
