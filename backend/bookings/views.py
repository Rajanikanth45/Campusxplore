from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from accounts.models import Role
from core.models import Notification
from .models import Booking, BookingStatus
from .serializers import BookingSerializer


class BookingViewSet(viewsets.ModelViewSet):
    """
    Campus venue/room booking API with slot-conflict detection.
    - Students see only their own bookings.
    - Faculty & Admins see all bookings and can approve/reject.
    - Any authenticated user can cancel their own pending/approved booking.
    """
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        user = self.request.user
        qs = Booking.objects.select_related('facility', 'user').all()
        if getattr(user, 'role', None) not in (Role.FACULTY, Role.ADMIN):
            qs = qs.filter(user=user)
        status_param = self.request.query_params.get('status')
        if status_param:
            qs = qs.filter(status=status_param)
        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user, status=BookingStatus.PENDING)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        booking = self.get_object()
        if booking.user != request.user and getattr(request.user, 'role', None) != Role.ADMIN:
            return Response({'detail': 'Not permitted.'}, status=status.HTTP_403_FORBIDDEN)
        if booking.status in (BookingStatus.REJECTED, BookingStatus.CANCELLED):
            return Response({'detail': 'Booking is already closed.'}, status=status.HTTP_400_BAD_REQUEST)
        booking.status = BookingStatus.CANCELLED
        booking.save(update_fields=['status', 'updated_at'])
        return Response(BookingSerializer(booking).data)

    @action(detail=True, methods=['post'])
    def decide(self, request, pk=None):
        if getattr(request.user, 'role', None) not in (Role.FACULTY, Role.ADMIN):
            return Response({'detail': 'Faculty or Admin privileges required.'}, status=status.HTTP_403_FORBIDDEN)
        booking = self.get_object()
        new_status = request.data.get('status')
        if new_status not in (BookingStatus.APPROVED, BookingStatus.REJECTED):
            return Response({'detail': 'Status must be APPROVED or REJECTED.'}, status=status.HTTP_400_BAD_REQUEST)
        booking.status = new_status
        booking.save(update_fields=['status', 'updated_at'])

        Notification.objects.create(
            user=booking.user,
            title=f"Booking {new_status.title()}: {booking.title}",
            message=f"Your booking for {booking.facility.name} on {booking.date} was {new_status.lower()}.",
            link='/bookings',
        )
        return Response(BookingSerializer(booking).data)

    @action(detail=False, methods=['get'])
    def booked_slots(self, request):
        """
        Return occupied time ranges (without user PII) for a given facility & date.
        """
        facility_id = request.query_params.get('facility')
        date_str = request.query_params.get('date')
        if not facility_id or not date_str:
            return Response([], status=status.HTTP_200_OK)
        slots = Booking.objects.filter(
            facility_id=facility_id,
            date=date_str,
            status__in=[BookingStatus.PENDING, BookingStatus.APPROVED],
        ).order_by('start_time').values('id', 'start_time', 'end_time', 'status')
        return Response(list(slots))
