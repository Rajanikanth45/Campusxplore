from rest_framework import serializers, viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from .models import Notification


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """
    Basic health check endpoint returning system status.
    """
    return Response(
        {
            "status": "ok",
            "message": "CampusXplore backend is running"
        },
        status=status.HTTP_200_OK
    )


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ('id', 'title', 'message', 'link', 'is_read', 'created_at')
        read_only_fields = ('id', 'title', 'message', 'link', 'created_at')


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Authenticated user's in-app notifications.
    """
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)[:30]

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        notif = Notification.objects.filter(pk=pk, user=request.user).first()
        if not notif:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        notif.is_read = True
        notif.save(update_fields=['is_read'])
        return Response(NotificationSerializer(notif).data)

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({'detail': 'All notifications marked as read.'})
