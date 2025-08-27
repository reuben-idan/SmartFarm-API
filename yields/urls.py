from django.urls import path
from .views import YieldForecastView

urlpatterns = [
    path('forecast/', YieldForecastView.as_view(), name='yield-forecast'),
]
