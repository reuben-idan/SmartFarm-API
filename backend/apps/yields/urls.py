from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views.yield_views import YieldForecastViewSet

app_name = 'yields'

router = DefaultRouter()
router.register(r'forecasts', YieldForecastViewSet, basename='yieldforecast')

urlpatterns = [
    path('', include(router.urls)),
    
    # Additional endpoints
    path('stats/', YieldForecastViewSet.as_view({'get': 'stats'}), name='yield-stats'),
    path('trends/', YieldForecastViewSet.as_view({'get': 'trends'}), name='yield-trends'),
]
