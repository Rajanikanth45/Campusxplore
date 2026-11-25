from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.throttling import SimpleRateThrottle
from accounts.models import Role
from .models import ShuttleRoute, ShuttleStop, ShuttleVehicle
from .serializers import (
    ShuttleRouteSerializer,
    ShuttleStopSerializer,
    ShuttleVehicleSerializer,
    VehicleLocationUpdateSerializer,
)


class LocationUpdateThrottle(SimpleRateThrottle):
    """60 location pings per minute per IP — prevents GPS spoofing floods."""
    scope = 'location_update'

    def get_cache_key(self, request, view):
        return self.cache_format % {
            'scope': self.scope,
            'ident': self.get_ident(request),
        }


class IsAdminOrPublicReadOnly(permissions.BasePermission):
    """
    Public read access for campus map users; Admin write access for transit operators.
    """
    message = 'Administrative credentials required to modify campus transit settings.'

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_authenticated and request.user.role == Role.ADMIN)


class IsIoTDeviceOrAdmin(permissions.BasePermission):
    """
    Restricts location-update pings to:
      1. Authenticated admin users (for testing/manual override), OR
      2. Requests that supply the shared IoT device token header:
         X-IoT-Device-Token: <value from IOT_DEVICE_TOKEN env var>
    This prevents anonymous actors from spoofing e-rickshaw positions.
    """
    message = 'Valid IoT device token or admin credentials required.'

    def has_permission(self, request, view):
        from django.conf import settings
        # Allow admins to push location updates directly
        if request.user and request.user.is_authenticated and request.user.role == Role.ADMIN:
            return True
        # Allow IoT device token header (shared secret for onboard GPS units)
        iot_token = getattr(settings, 'IOT_DEVICE_TOKEN', None)
        if iot_token:
            supplied = request.META.get('HTTP_X_IOT_DEVICE_TOKEN', '')
            return bool(supplied and supplied == iot_token)
        # If no IOT_DEVICE_TOKEN is configured, fall back to requiring admin
        return False


class ShuttleRouteViewSet(viewsets.ModelViewSet):
    queryset = ShuttleRoute.objects.all().order_by('name')
    serializer_class = ShuttleRouteSerializer
    permission_classes = [IsAdminOrPublicReadOnly]
    pagination_class = None

    def get_queryset(self):
        qs = super().get_queryset()
        if not (self.request.user and self.request.user.is_authenticated and self.request.user.role == Role.ADMIN):
            qs = qs.filter(is_active=True)
        return qs


class ShuttleStopViewSet(viewsets.ModelViewSet):
    queryset = ShuttleStop.objects.select_related('route').all().order_by('name')
    serializer_class = ShuttleStopSerializer
    permission_classes = [IsAdminOrPublicReadOnly]
    pagination_class = None

    def get_queryset(self):
        qs = super().get_queryset()
        route_id = self.request.query_params.get('route')
        if route_id:
            qs = qs.filter(route_id=route_id)
        if not (self.request.user and self.request.user.is_authenticated and self.request.user.role == Role.ADMIN):
            qs = qs.filter(is_active=True)
        return qs


class ShuttleVehicleViewSet(viewsets.ModelViewSet):
    queryset = ShuttleVehicle.objects.select_related('route').all().order_by('vehicle_number')
    serializer_class = ShuttleVehicleSerializer
    permission_classes = [IsAdminOrPublicReadOnly]
    pagination_class = None

    def get_queryset(self):
        qs = super().get_queryset()
        status_param = self.request.query_params.get('status')
        route_id = self.request.query_params.get('route')
        if status_param:
            qs = qs.filter(status=status_param)
        if route_id:
            qs = qs.filter(route_id=route_id)
        return qs

    @action(detail=True, methods=['post'], permission_classes=[IsIoTDeviceOrAdmin],
            throttle_classes=[LocationUpdateThrottle])
    def update_location(self, request, pk=None):
        """
        IoT / Driver GPS Tracking Ping Endpoint.
        Accepts: { latitude: 31.2534, longitude: 75.7036, speed_kmh: 18 }
        Updates the vehicle's real-time position immediately.
        """
        vehicle = self.get_object()
        serializer = VehicleLocationUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        vehicle.current_latitude = serializer.validated_data['latitude']
        vehicle.current_longitude = serializer.validated_data['longitude']
        if 'speed_kmh' in serializer.validated_data:
            vehicle.speed_kmh = serializer.validated_data['speed_kmh']
        vehicle.save(update_fields=['current_latitude', 'current_longitude', 'speed_kmh', 'last_ping'])

        return Response(ShuttleVehicleSerializer(vehicle).data, status=status.HTTP_200_OK)

