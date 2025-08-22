from rest_framework.routers import DefaultRouter
from .views import HelpRequestViewSet

router = DefaultRouter()
router.register(r'', HelpRequestViewSet, basename='support')

urlpatterns = router.urls
