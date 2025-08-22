from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status

from crops.models import Crop, Season

from recommendations.views import score_crop


class RecommendationScoringTest(APITestCase):
    def setUp(self):
        self.crop_match_all = Crop.objects.create(
            name="Maize",
            season=Season.MAJOR,
            soil_type="loamy",
            regions=["Nairobi"],
            recommended_inputs={"fertilizer": "NPK"},
            maturity_days=120,
        )
        self.crop_wrong_soil = Crop.objects.create(
            name="Beans",
            season=Season.MAJOR,
            soil_type="clay",
            regions=["Nairobi"],
            recommended_inputs={},
            maturity_days=100,
        )
        self.crop_far_maturity = Crop.objects.create(
            name="Rice",
            season=Season.MAJOR,
            soil_type="loamy",
            regions=["Nairobi"],
            recommended_inputs={},
            maturity_days=300,
        )

    def test_score_components(self):
        # Perfect match: +1 region +1 season +1 soil +1 maturity(=1.0) -> 4.0
        s = score_crop(self.crop_match_all, region="Nairobi", season=Season.MAJOR, soil_type="loamy")
        self.assertAlmostEqual(s, 4.0, places=3)

        # Wrong soil, maturity 100 -> maturity bonus < 1
        s2 = score_crop(self.crop_wrong_soil, region="Nairobi", season=Season.MAJOR, soil_type="loamy")
        self.assertTrue(s2 < 4.0)
        # Ensure soil mismatch reduced score by ~1 compared to same without soil filter
        s2_nosoil = score_crop(self.crop_wrong_soil, region="Nairobi", season=Season.MAJOR, soil_type=None)
        self.assertGreater(s2_nosoil, s2)

        # Very long maturity should have low maturity component
        s3 = score_crop(self.crop_far_maturity, region="Nairobi", season=Season.MAJOR, soil_type="loamy")
        self.assertTrue(s3 < 3.0)


class RecommendationEndpointTest(APITestCase):
    def setUp(self):
        # Build diverse dataset
        self.crops = []
        self.crops.append(Crop.objects.create(
            name="Maize",
            season=Season.MAJOR,
            soil_type="loamy",
            regions=["Nairobi", "Kisumu"],
            recommended_inputs={"fertilizer": "NPK"},
            maturity_days=120,
        ))
        self.crops.append(Crop.objects.create(
            name="Beans",
            season=Season.MINOR,
            soil_type="clay",
            regions=["Nairobi"],
            recommended_inputs={},
            maturity_days=90,
        ))
        self.crops.append(Crop.objects.create(
            name="Wheat",
            season=Season.ALL,
            soil_type="sandy",
            regions=["Nakuru"],
            recommended_inputs={},
            maturity_days=150,
        ))
        self.crops.append(Crop.objects.create(
            name="Rice",
            season=Season.MAJOR,
            soil_type="loamy",
            regions=["Mombasa", "Nairobi"],
            recommended_inputs={},
            maturity_days=110,
        ))
        # Ensure more than 5 exists
        for i in range(5):
            self.crops.append(Crop.objects.create(
                name=f"Crop{i}",
                season=Season.MAJOR,
                soil_type="loamy" if i % 2 == 0 else "clay",
                regions=["Nairobi"],
                recommended_inputs={},
                maturity_days=100 + i,
            ))
        self.url = reverse('recommendations')

    def test_missing_region_returns_400(self):
        res = self.client.get(self.url)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_recommendations_basic(self):
        res = self.client.get(self.url, {"region": "Nairobi"})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('results', res.json())
        # Limited to top 5
        self.assertLessEqual(len(res.json()['results']), 5)
        # All should include Nairobi in regions
        for item in res.json()['results']:
            self.assertIn("Nairobi", item['regions'])
            self.assertIn('recommended_inputs', item)
            self.assertIn('score', item)

    def test_recommendations_with_filters(self):
        res = self.client.get(self.url, {"region": "Nairobi", "season": Season.MAJOR, "soil_type": "loamy"})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        results = res.json()['results']
        self.assertTrue(all("Nairobi" in r['regions'] for r in results))
        # Expect first item to be a strong loamy + season match
        self.assertGreaterEqual(results[0]['score'], results[-1]['score'])
