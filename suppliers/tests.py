from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Supplier

User = get_user_model()


class SupplierAPITest(APITestCase):
    def setUp(self):
        # Users
        self.user1 = User.objects.create_user(username='user1', email='u1@example.com', password='pass12345')
        self.user2 = User.objects.create_user(username='user2', email='u2@example.com', password='pass12345')
        self.staff = User.objects.create_user(username='staff', email='staff@example.com', password='pass12345', is_staff=True)

        # Tokens
        self.user1_token = str(RefreshToken.for_user(self.user1).access_token)
        self.user2_token = str(RefreshToken.for_user(self.user2).access_token)
        self.staff_token = str(RefreshToken.for_user(self.staff).access_token)

        # URLs
        self.list_url = reverse('supplier-list')

        # Seed data
        self.s1 = Supplier.objects.create(
            owner=self.user1,
            name='Green Agro Depot',
            product_list=[{"name": "Urea", "unit": "kg", "price": 25.5}, {"name": "DAP", "unit": "kg"}],
            location='Nairobi',
            phone='+254700000',
        )
        self.s2 = Supplier.objects.create(
            owner=self.user2,
            name='Seed World',
            product_list=[{"name": "Maize Seed", "unit": "bag"}],
            location='Kisumu',
            phone='+254711111',
        )

    def auth(self, token: str):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

    def test_public_can_list_and_retrieve_but_cannot_create(self):
        # List
        res = self.client.get(self.list_url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(res.data['count'], 2)

        # Retrieve
        detail_url = reverse('supplier-detail', args=[self.s1.id])
        res = self.client.get(detail_url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['id'], self.s1.id)

        # Create should be unauthorized
        payload = {
            'name': 'Agri Hub',
            'product_list': [{"name": "NPK", "unit": "kg", "price": 18.0}],
            'location': 'Nakuru',
            'phone': '+254722222',
        }
        res = self.client.post(self.list_url, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_owner_can_create_and_update_own_supplier(self):
        self.auth(self.user1_token)
        payload = {
            'name': 'Owner Shop',
            'product_list': [{"name": "Lime", "unit": "kg"}],
            'location': 'Eldoret',
            'phone': '+254733333',
        }
        res = self.client.post(self.list_url, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data['owner'], self.user1.id)

        detail_url = reverse('supplier-detail', args=[self.s1.id])
        patch_payload = {'phone': '+254700999'}
        res = self.client.patch(detail_url, patch_payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.s1.refresh_from_db()
        self.assertEqual(self.s1.phone, '+254700999')

    def test_non_owner_cannot_modify_others(self):
        self.auth(self.user2_token)
        detail_url = reverse('supplier-detail', args=[self.s1.id])
        res = self.client.patch(detail_url, {'location': 'Mombasa'}, format='json')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

        res = self.client.delete(detail_url)
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_staff_can_modify_any(self):
        self.auth(self.staff_token)
        detail_url = reverse('supplier-detail', args=[self.s1.id])
        res = self.client.patch(detail_url, {'location': 'Thika'}, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.s1.refresh_from_db()
        self.assertEqual(self.s1.location, 'Thika')

    def test_search_by_name_and_product(self):
        # search by supplier name
        res = self.client.get(self.list_url, {'search': 'Seed'})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        names = [r['name'] for r in res.data['results']]
        self.assertIn('Seed World', names)

        # search by product name in product_list
        res = self.client.get(self.list_url, {'search': 'Urea'})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        names = [r['name'] for r in res.data['results']]
        self.assertIn('Green Agro Depot', names)

    def test_filter_by_location(self):
        res = self.client.get(self.list_url, {'location': 'Nairobi'})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        results = res.data['results']
        self.assertTrue(all('Nairobi' in s['location'] for s in results))

    def test_validation_of_product_list_schema(self):
        self.auth(self.user1_token)
        # Missing required name
        bad_payload = {
            'name': 'Bad Shop',
            'product_list': [{"unit": "kg"}],
            'location': 'Kitale',
            'phone': '+254744444',
        }
        res = self.client.post(self.list_url, bad_payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('product_list', res.data)
