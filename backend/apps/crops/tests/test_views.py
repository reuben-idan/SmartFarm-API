from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from django.contrib.auth import get_user_model
from ..models import Crop, Season

User = get_user_model()

class CropViewSetTest(APITestCase):
    """Test the CropViewSet."""
    
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_superuser('admin@test.com', 'testpass123')
        self.user = User.objects.create_user('user@test.com', 'testpass123')
        self.crop = Crop.objects.create(
            name='Maize',
            season=Season.MAJOR,
            soil_type='Loamy',
            regions=['East Africa'],
            recommended_inputs={},
            maturity_days=90
        )
        self.list_url = reverse('crops:crop-list')
        self.detail_url = reverse('crops:crop-detail', args=[self.crop.id])
        self.seasons_url = reverse('crops:crop-seasons')

    def test_list_crops(self):
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    def test_retrieve_crop(self):
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Maize')

    def test_create_crop_unauthorized(self):
        self.client.force_authenticate(user=self.user)
        data = {'name': 'Beans', 'season': Season.MINOR, 'maturity_days': 60}
        response = self.client.post(self.list_url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_crop_authorized(self):
        self.client.force_authenticate(user=self.admin)
        data = {
            'name': 'Beans',
            'season': Season.MINOR,
            'soil_type': 'Sandy',
            'regions': ['East Africa'],
            'maturity_days': 60
        }
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Crop.objects.count(), 2)

    def test_seasons_endpoint(self):
        response = self.client.get(self.seasons_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)  # major, minor, all
