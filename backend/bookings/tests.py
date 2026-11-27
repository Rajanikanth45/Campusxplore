from datetime import timedelta
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase
from accounts.models import User
from facilities.models import Category, Facility
from core.models import Notification
from .models import Booking, BookingStatus


class BookingConflictAndWorkflowTests(APITestCase):
    def setUp(self):
        self.student1 = User.objects.create_user(
            email='s1@lpu.in',
            password='CampusPassword@2026',
            first_name='Student1',
        )
        self.student2 = User.objects.create_user(
            email='s2@lpu.in',
            password='CampusPassword@2026',
            first_name='Student2',
        )
        self.admin = User.objects.create_superuser(
            email='admin.book@lpu.in',
            password='AdminPassword@2026',
        )
        self.cat = Category.objects.create(name='Auditorium')
        self.facility = Facility.objects.create(
            name='Mittal Auditorium',
            category=self.cat,
            building='Block 13',
            is_active=True,
        )
        self.tomorrow = (timezone.localdate() + timedelta(days=1)).isoformat()

    def test_booking_conflict_detection(self):
        self.client.force_authenticate(user=self.student1)
        res1 = self.client.post('/api/bookings/', {
            'facility': self.facility.id,
            'title': 'Tech Talk',
            'date': self.tomorrow,
            'start_time': '10:00',
            'end_time': '12:00',
        })
        self.assertEqual(res1.status_code, status.HTTP_201_CREATED)

        # Overlapping slot (11:00 - 13:00) must be rejected
        self.client.force_authenticate(user=self.student2)
        res2 = self.client.post('/api/bookings/', {
            'facility': self.facility.id,
            'title': 'Club Meet',
            'date': self.tomorrow,
            'start_time': '11:00',
            'end_time': '13:00',
        })
        self.assertEqual(res2.status_code, status.HTTP_400_BAD_REQUEST)

        # Non-overlapping slot (12:00 - 13:00) must succeed
        res3 = self.client.post('/api/bookings/', {
            'facility': self.facility.id,
            'title': 'Club Meet',
            'date': self.tomorrow,
            'start_time': '12:00',
            'end_time': '13:00',
        })
        self.assertEqual(res3.status_code, status.HTTP_201_CREATED)

    def test_admin_decision_creates_notification(self):
        booking = Booking.objects.create(
            user=self.student1,
            facility=self.facility,
            title='Hackathon Kickoff',
            date=timezone.localdate() + timedelta(days=2),
            start_time='09:00',
            end_time='11:00',
        )
        self.client.force_authenticate(user=self.admin)
        res = self.client.post(f'/api/bookings/{booking.id}/decide/', {'status': BookingStatus.APPROVED})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(Notification.objects.filter(user=self.student1).exists())
