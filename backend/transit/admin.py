from django.contrib import admin
from .models import ShuttleRoute, ShuttleStop, ShuttleVehicle, EmergencyPost


@admin.register(ShuttleRoute)
class ShuttleRouteAdmin(admin.ModelAdmin):
    list_display = ('name', 'short_name', 'color', 'frequency', 'operating_hours', 'fare', 'is_active', 'updated_at')
    list_filter = ('is_active',)
    search_fields = ('name', 'short_name', 'description')
    list_editable = ('is_active', 'frequency', 'fare')


@admin.register(ShuttleStop)
class ShuttleStopAdmin(admin.ModelAdmin):
    list_display = ('name', 'order', 'code', 'route', 'latitude', 'longitude', 'interval_text', 'landmark', 'is_active')
    list_display_links = ('name',)
    list_filter = ('route', 'is_active')
    search_fields = ('name', 'code', 'landmark')
    list_editable = ('order', 'latitude', 'longitude', 'interval_text', 'is_active')


@admin.register(ShuttleVehicle)
class ShuttleVehicleAdmin(admin.ModelAdmin):
    list_display = ('vehicle_number', 'driver_name', 'route', 'speed_kmh', 'status', 'current_latitude', 'current_longitude', 'last_ping')
    list_filter = ('status', 'route')
    search_fields = ('vehicle_number', 'driver_name', 'driver_phone')
    list_editable = ('status', 'speed_kmh', 'current_latitude', 'current_longitude')


@admin.register(EmergencyPost)
class EmergencyPostAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'building', 'phone', 'latitude', 'longitude', 'is_active')
    list_filter = ('category', 'is_active')
    search_fields = ('name', 'building', 'phone')
    list_editable = ('phone', 'is_active')
