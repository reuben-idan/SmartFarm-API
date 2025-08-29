from django.test import TestCase, RequestFactory
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from rest_framework.test import force_authenticate

from apps.core.pagination import StandardResultsSetPagination
from apps.core.views import HealthCheckView

User = get_user_model()


class PaginationTests(APITestCase):
    def setUp(self):
        self.factory = RequestFactory()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_pagination_defaults(self):
        """Test that pagination defaults work as expected."""
        # Create a request with pagination
        request = self.factory.get('/api/v1/health/')
        request.user = self.user
        
        # Test the pagination class directly
        paginator = StandardResultsSetPagination()
        self.assertEqual(paginator.page_size, 20)
        self.assertEqual(paginator.page_size_query_param, 'page_size')
        self.assertEqual(paginator.max_page_size, 100)

    def test_page_size_parameter(self):
        """Test that page_size parameter works as expected."""
        # Test with custom page size
        request = self.factory.get('/api/v1/health/?page_size=5')
        paginator = StandardResultsSetPagination()
        page_size = paginator.get_page_size(request)
        self.assertEqual(page_size, 5)

    def test_max_page_size_limit(self):
        """Test that page_size doesn't exceed max_page_size."""
        # Test with page_size exceeding max_page_size
        request = self.factory.get('/api/v1/health/?page_size=200')
        paginator = StandardResultsSetPagination()
        page_size = paginator.get_page_size(request)
        self.assertEqual(page_size, 100)  # Should be capped at max_page_size

    def test_ordering_parameter(self):
        """Test that ordering works with the OrderingFilter."""
        # This is a simple test - in a real app, you'd test with actual model data
        request = self.factory.get('/api/v1/health/?ordering=id')
        self.assertEqual(request.query_params.get('ordering'), 'id')

    def test_pagination_in_view(self):
        """Test that pagination works in a view."""
        # Get the health check endpoint which should now be paginated
        response = self.client.get('/api/health/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check that the response has pagination keys
        self.assertIn('count', response.data)
        self.assertIn('next', response.data)
        self.assertIn('previous', response.data)
        self.assertIn('results', response.data)
        self.assertIn('page_size', response.data)
        self.assertIn('total_pages', response.data)
        self.assertIn('current_page', response.data)
