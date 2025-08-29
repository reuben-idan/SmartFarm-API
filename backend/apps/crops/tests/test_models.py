from django.test import TestCase
from django.core.exceptions import ValidationError
from ..models import Crop, Season


class CropModelTest(TestCase):
    """Test the Crop model."""
    
    def setUp(self):
        self.crop_data = {
            'name': 'Maize',
            'season': Season.MAJOR,
            'soil_type': 'Loamy',
            'regions': ['East Africa', 'West Africa'],
            'recommended_inputs': {'fertilizer': 'NPK', 'water': 'Moderate'},
            'maturity_days': 90
        }
    
    def test_create_crop(self):
        """Test creating a new crop."""
        crop = Crop.objects.create(**self.crop_data)
        self.assertEqual(crop.name, 'Maize')
        self.assertEqual(crop.season, 'major')
        self.assertEqual(crop.soil_type, 'Loamy')
        self.assertEqual(crop.regions, ['East Africa', 'West Africa'])
        self.assertEqual(crop.recommended_inputs, {'fertilizer': 'NPK', 'water': 'Moderate'})
        self.assertEqual(crop.maturity_days, 90)
    
    def test_clean_regions(self):
        """Test that regions are properly cleaned."""
        # Test with empty strings and whitespace
        crop = Crop(**self.crop_data)
        crop.regions = ['', ' East Africa ', '  ', 'West Africa']
        crop.full_clean()
        self.assertEqual(crop.regions, ['East Africa', 'West Africa'])
    
    def test_clean_recommended_inputs(self):
        """Test that recommended_inputs must be a dictionary."""
        crop = Crop(**self.crop_data)
        crop.recommended_inputs = 'not a dict'
        with self.assertRaises(ValidationError):
            crop.full_clean()
    
    def test_season_validation(self):
        """Test that only valid seasons can be used."""
        crop = Crop(**self.crop_data)
        crop.season = 'invalid_season'
        with self.assertRaises(ValidationError):
            crop.full_clean()
    
    def test_string_representation(self):
        """Test the string representation of the crop."""
        crop = Crop.objects.create(**self.crop_data)
        self.assertEqual(str(crop), 'Maize')


class SeasonModelTest(TestCase):
    """Test the Season model choices."""
    
    def test_season_choices(self):
        """Test that season choices are correctly defined."""
        self.assertEqual(len(Season.choices), 3)
        self.assertEqual(Season.MAJOR, 'major')
        self.assertEqual(Season.MINOR, 'minor')
        self.assertEqual(Season.ALL, 'all')
