from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.exceptions import ValidationError
from ..models import Crop, Season
from ..serializers import CropSerializer, CropListSerializer

User = get_user_model()


class CropSerializerTest(TestCase):
    """Test the CropSerializer."""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
        
        self.crop_data = {
            'name': 'Maize',
            'season': Season.MAJOR,
            'soil_type': 'Loamy',
            'regions': ['East Africa', 'West Africa'],
            'recommended_inputs': {'fertilizer': 'NPK', 'water': 'Moderate'},
            'maturity_days': 90
        }
        
        self.crop = Crop.objects.create(**self.crop_data)
        self.serializer = CropSerializer(instance=self.crop)
    
    def test_contains_expected_fields(self):
        """Test that the serializer contains all the expected fields."""
        data = self.serializer.data
        self.assertCountEqual(
            data.keys(),
            ['id', 'name', 'season', 'soil_type', 'regions', 
             'recommended_inputs', 'maturity_days', 'created_at', 'updated_at']
        )
    
    def test_validate_season(self):
        """Test that the season is properly validated."""
        # Test valid season
        serializer = CropSerializer(data=self.crop_data)
        self.assertTrue(serializer.is_valid())
        
        # Test invalid season
        invalid_data = self.crop_data.copy()
        invalid_data['season'] = 'invalid_season'
        serializer = CropSerializer(data=invalid_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('season', serializer.errors)
    
    def test_validate_regions(self):
        """Test that regions are properly validated and cleaned."""
        # Test with empty strings and whitespace
        data = self.crop_data.copy()
        data['regions'] = ['', ' East Africa ', '  ', 'West Africa']
        serializer = CropSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        self.assertEqual(
            serializer.validated_data['regions'],
            ['East Africa', 'West Africa']
        )
        
        # Test with non-list value
        data['regions'] = 'not a list'
        serializer = CropSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('regions', serializer.errors)
    
    def test_validate_recommended_inputs(self):
        """Test that recommended_inputs must be a dictionary."""
        data = self.crop_data.copy()
        data['recommended_inputs'] = 'not a dict'
        serializer = CropSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('recommended_inputs', serializer.errors)


class CropListSerializerTest(TestCase):
    """Test the CropListSerializer."""
    
    def setUp(self):
        self.crop = Crop.objects.create(
            name='Maize',
            season=Season.MAJOR,
            soil_type='Loamy',
            regions=['East Africa'],
            recommended_inputs={},
            maturity_days=90
        )
        self.serializer = CropListSerializer(instance=self.crop)
    
    def test_contains_expected_fields(self):
        """Test that the list serializer contains only the expected fields."""
        data = self.serializer.data
        self.assertCountEqual(
            data.keys(),
            ['id', 'name', 'season', 'regions', 'maturity_days']
        )
    
    def test_read_only_fields(self):
        """Test that all fields are read-only."""
        data = self.serializer.data
        for field in data:
            self.assertIn(field, CropListSerializer.Meta.fields)
