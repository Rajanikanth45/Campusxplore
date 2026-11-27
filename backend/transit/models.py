from decimal import Decimal
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.translation import gettext_lazy as _


class ShuttleRoute(models.Model):
    """
    Campus E-Rickshaw & Shuttle Transit Route (e.g. Avenue Express, Hostel Circuit).
    """
    name = models.CharField(max_length=150, help_text=_('Route name e.g. Avenue Express (Line 1)'))
    short_name = models.CharField(max_length=50, default='Line 1')
    color = models.CharField(max_length=20, default='#f59e0b', help_text=_('Hex color e.g. #f59e0b'))
    secondary_color = models.CharField(max_length=20, default='#d97706')
    description = models.TextField(blank=True, default='')
    operating_hours = models.CharField(max_length=100, default='06:30 AM – 10:30 PM')
    frequency = models.CharField(max_length=100, default='Every 4–6 mins')
    fare = models.CharField(max_length=100, default='₹10 / Free with Student ID')
    waypoints = models.JSONField(
        default=list,
        blank=True,
        help_text=_('Ordered list of [latitude, longitude] pairs defining the route polyline')
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('Shuttle Route')
        verbose_name_plural = _('Shuttle Routes')
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.short_name})"

    @property
    def stop_coordinates(self):
        """
        Ordered list of [latitude, longitude] pairs of all active stops on this route.
        Ensures the route line always connects all stops dynamically.
        """
        stops = self.stops.filter(is_active=True).order_by('order', 'id')
        return [[float(s.latitude), float(s.longitude)] for s in stops]


class ShuttleStop(models.Model):
    """
    Designated physical pickup/drop-off point for campus e-rickshaws.
    """
    name = models.CharField(max_length=150, help_text=_('Stop name e.g. Main Gate 1 E-Rickshaw Bay'))
    code = models.CharField(max_length=30, unique=True, help_text=_('Unique code e.g. STOP-G1'))
    route = models.ForeignKey(
        ShuttleRoute,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='stops',
        help_text=_('Primary route serving this stop')
    )
    latitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        validators=[MinValueValidator(Decimal('-90.0')), MaxValueValidator(Decimal('90.0'))],
        help_text=_('Latitude coordinate between -90.0 and 90.0')
    )
    longitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        validators=[MinValueValidator(Decimal('-180.0')), MaxValueValidator(Decimal('180.0'))],
        help_text=_('Longitude coordinate between -180.0 and 180.0')
    )
    interval_text = models.CharField(max_length=50, default='Next in ~4 min')
    landmark = models.CharField(max_length=200, blank=True, default='')
    order = models.PositiveIntegerField(
        default=1,
        help_text=_('Sequence order of this stop along the route (1, 2, 3...)')
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('Shuttle Stop')
        verbose_name_plural = _('Shuttle Stops')
        ordering = ['order', 'name']
        indexes = [
            models.Index(fields=['route', 'is_active', 'order']),
        ]

    def __str__(self):
        return f"{self.name} ({self.code})"


class ShuttleVehicle(models.Model):
    """
    Individual registered E-Rickshaw vehicle with real-time GPS tracking.
    """
    STATUS_CHOICES = [
        ('ACTIVE', _('Active / On Duty')),
        ('OFF_DUTY', _('Off Duty')),
        ('CHARGING', _('Charging at Hub')),
        ('MAINTENANCE', _('Under Maintenance')),
    ]

    vehicle_number = models.CharField(max_length=50, unique=True, help_text=_('e.g. Rickshaw #4 (PB08-ER-104)'))
    driver_name = models.CharField(max_length=100)
    driver_phone = models.CharField(max_length=30, blank=True, default='')
    route = models.ForeignKey(
        ShuttleRoute,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='vehicles',
        help_text=_('Currently assigned transit route')
    )
    current_latitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True,
        validators=[MinValueValidator(Decimal('-90.0')), MaxValueValidator(Decimal('90.0'))]
    )
    current_longitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True,
        validators=[MinValueValidator(Decimal('-180.0')), MaxValueValidator(Decimal('180.0'))]
    )
    speed_kmh = models.IntegerField(default=15, help_text=_('Current speed in km/h'))
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    last_ping = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('E-Rickshaw Vehicle')
        verbose_name_plural = _('E-Rickshaw Vehicles')
        ordering = ['vehicle_number']
        indexes = [
            models.Index(fields=['status', 'route']),
        ]

    def __str__(self):
        return f"{self.vehicle_number} - {self.driver_name} ({self.status})"


class EmergencyPost(models.Model):
    """
    Database-backed campus emergency post / medical center / security station for SOS fast-path.
    """
    CATEGORY_CHOICES = [
        ('MEDICAL', _('Medical / Hospital')),
        ('SECURITY', _('Security Post')),
        ('AMBULANCE', _('Ambulance Dispatch')),
    ]

    name = models.CharField(max_length=150)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='MEDICAL')
    building = models.CharField(max_length=120, blank=True, default='')
    phone = models.CharField(max_length=40)
    description = models.TextField(blank=True, default='')
    latitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        validators=[MinValueValidator(Decimal('-90.0')), MaxValueValidator(Decimal('90.0'))],
    )
    longitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        validators=[MinValueValidator(Decimal('-180.0')), MaxValueValidator(Decimal('180.0'))],
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('Emergency Post')
        verbose_name_plural = _('Emergency Posts')
        ordering = ['category', 'name']

    def __str__(self):
        return f"{self.name} ({self.category})"

