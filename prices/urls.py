from rest_framework.routers import DefaultRouter
from .views import MarketPriceViewSet

router = DefaultRouter()
router.register(r'', MarketPriceViewSet, basename='marketprice')

urlpatterns = router.urls
