"""
URL configuration for config project.
"""
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from core.views import health_check

urlpatterns = [
    path('admin/', admin.site.urls),
    path('health/', health_check, name='direct_health_check'),
    path('api/auth/', include('accounts.urls')),
    path('api/', include('facilities.urls')),
    path('api/', include('core.urls')),
    path('api/', include('reports.urls')),
    path('api/', include('bookings.urls')),
    path('api/transit/', include('transit.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
