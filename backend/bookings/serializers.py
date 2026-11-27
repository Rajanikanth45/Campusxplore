from django.utils import timezone
from rest_framework import serializers
from facilities.models import Facility
from .models import Booking, BookingStatus


class BookingFacilitySummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Facility
        fields = ('id', 'name', 'building')


class BookingSerializer(serializers.ModelSerializer):
    facility_detail = BookingFacilitySummarySerializer(source='facility', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = (
            'id',
            'facility',
            'facility_detail',
            'user_email',
            'user_name',
            'title',
            'purpose',
            'date',
            'start_time',
            'end_time',
            'status',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('id', 'user_email', 'user_name', 'status', 'created_at', 'updated_at')

    def get_user_name(self, obj):
        full = f"{obj.user.first_name} {obj.user.last_name}".strip()
        return full or obj.user.email

    def validate(self, attrs):
        facility = attrs.get('facility')
        date = attrs.get('date')
        start_time = attrs.get('start_time')
        end_time = attrs.get('end_time')

        if facility and not facility.is_active:
            raise serializers.ValidationError({'facility': 'Cannot book an inactive facility.'})

        if date and date < timezone.localdate():
            raise serializers.ValidationError({'date': 'Booking date cannot be in the past.'})

        if start_time and end_time and end_time <= start_time:
            raise serializers.ValidationError({'end_time': 'End time must be after start time.'})

        # Slot-overlap conflict detection against PENDING or APPROVED bookings
        if facility and date and start_time and end_time:
            conflicts = Booking.objects.filter(
                facility=facility,
                date=date,
                status__in=[BookingStatus.PENDING, BookingStatus.APPROVED],
                start_time__lt=end_time,
                end_time__gt=start_time,
            )
            if self.instance:
                conflicts = conflicts.exclude(pk=self.instance.pk)
            if conflicts.exists():
                c = conflicts.first()
                raise serializers.ValidationError({
                    'non_field_errors': (
                        f"Time slot conflict: '{facility.name}' is already booked on {date} "
                        f"from {c.start_time.strftime('%H:%M')} to {c.end_time.strftime('%H:%M')}."
                    )
                })

        return attrs
