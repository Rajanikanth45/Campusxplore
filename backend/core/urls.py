from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import health_check, NotificationViewSet

router = DefaultRouter()
router.register(r'notifications', NotificationViewSet, basename='notification')

urlpatterns = [
    path('health/', health_check, name='health_check'),
    path('', include(router.urls)),
]
