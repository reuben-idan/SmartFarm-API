from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views.market_price_views import MarketPriceViewSet

app_name = 'prices'

router = DefaultRouter()
router.register(r'market-prices', MarketPriceViewSet, basename='marketprice')

urlpatterns = [
    path('', include(router.urls)),
    
    # Additional endpoints
    path('market-prices/latest/', MarketPriceViewSet.as_view({'get': 'latest'}), name='marketprice-latest'),
    path('market-prices/trends/', MarketPriceViewSet.as_view({'get': 'trends'}), name='marketprice-trends'),
]
