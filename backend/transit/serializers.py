from rest_framework import serializers
from .models import ShuttleRoute, ShuttleStop, ShuttleVehicle


class ShuttleRouteSerializer(serializers.ModelSerializer):
    stops_count = serializers.IntegerField(source='stops.count', read_only=True)
    vehicles_count = serializers.IntegerField(source='vehicles.count', read_only=True)
    stop_coordinates = serializers.ReadOnlyField()

    class Meta:
        model = ShuttleRoute
        fields = [
            'id',
            'name',
            'short_name',
            'color',
            'secondary_color',
            'description',
            'operating_hours',
            'frequency',
            'fare',
            'waypoints',
            'stop_coordinates',
            'is_active',
            'stops_count',
            'vehicles_count',
            'created_at',
            'updated_at',
        ]


class ShuttleStopSerializer(serializers.ModelSerializer):
    route_name = serializers.CharField(source='route.name', read_only=True)
    route_color = serializers.CharField(source='route.color', read_only=True)

    class Meta:
        model = ShuttleStop
        fields = [
            'id',
            'name',
            'code',
            'route',
            'route_name',
            'route_color',
            'order',
            'latitude',
            'longitude',
            'interval_text',
            'landmark',
            'is_active',
            'created_at',
            'updated_at',
        ]


class ShuttleVehicleSerializer(serializers.ModelSerializer):
    route_name = serializers.CharField(source='route.name', read_only=True)
    route_color = serializers.CharField(source='route.color', read_only=True)

    class Meta:
        model = ShuttleVehicle
        fields = [
            'id',
            'vehicle_number',
            'driver_name',
            'driver_phone',
            'route',
            'route_name',
            'route_color',
            'current_latitude',
            'current_longitude',
            'speed_kmh',
            'status',
            'last_ping',
            'created_at',
        ]


class VehicleLocationUpdateSerializer(serializers.Serializer):
    latitude = serializers.DecimalField(max_digits=9, decimal_places=6)
    longitude = serializers.DecimalField(max_digits=9, decimal_places=6)
    speed_kmh = serializers.IntegerField(required=False, default=15)

