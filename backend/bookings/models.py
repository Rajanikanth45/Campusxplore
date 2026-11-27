from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _


class BookingStatus(models.TextChoices):
    PENDING = 'PENDING', _('Pending')
    APPROVED = 'APPROVED', _('Approved')
    REJECTED = 'REJECTED', _('Rejected')
    CANCELLED = 'CANCELLED', _('Cancelled')


class Booking(models.Model):
    """
    Campus facility/venue booking with time-slot conflict detection.
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='bookings',
    )
    facility = models.ForeignKey(
        'facilities.Facility',
        on_delete=models.PROTECT,
        related_name='bookings',
    )
    title = models.CharField(max_length=150)
    purpose = models.TextField(blank=True, default='')
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    status = models.CharField(
        max_length=20,
        choices=BookingStatus.choices,
        default=BookingStatus.PENDING,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date', 'start_time']
        indexes = [
            models.Index(fields=['facility', 'date', 'status']),
            models.Index(fields=['user', '-created_at']),
        ]

    def __str__(self):
        return f"{self.title} @ {self.facility.name} ({self.date} {self.start_time}-{self.end_time})"
