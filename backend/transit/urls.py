from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ShuttleRouteViewSet, ShuttleStopViewSet, ShuttleVehicleViewSet, EmergencyPostViewSet

router = DefaultRouter()
router.register(r'routes', ShuttleRouteViewSet, basename='shuttle-route')
router.register(r'stops', ShuttleStopViewSet, basename='shuttle-stop')
router.register(r'vehicles', ShuttleVehicleViewSet, basename='shuttle-vehicle')
router.register(r'emergency', EmergencyPostViewSet, basename='emergency-post')

urlpatterns = [
    path('', include(router.urls)),
]

