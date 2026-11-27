from decimal import Decimal
from django.test import override_settings
from rest_framework import status
from rest_framework.test import APITestCase
from accounts.models import User, Role
from .models import ShuttleRoute, ShuttleStop, ShuttleVehicle


class TransitSecurityAndAPITests(APITestCase):
    def setUp(self):
        self.student = User.objects.create_user(
            email='student.transit@lpu.in',
            password='CampusPassword@2026',
            first_name='Test',
        )
        self.admin = User.objects.create_superuser(
            email='admin.transit@lpu.in',
            password='AdminPassword@2026',
        )
        self.route = ShuttleRoute.objects.create(
            name='Test Line',
            short_name='L1',
            is_active=True,
        )
        self.stop = ShuttleStop.objects.create(
            name='Gate 1 Stop',
            code='TEST-G1',
            route=self.route,
            latitude=Decimal('31.251500'),
            longitude=Decimal('75.700800'),
            order=1,
        )
        self.vehicle = ShuttleVehicle.objects.create(
            vehicle_number='PB08-TEST-01',
            driver_name='Driver One',
            route=self.route,
        )

    def test_public_can_read_active_routes_and_stops(self):
        res = self.client.get('/api/transit/routes/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 1)

    def test_student_cannot_create_route(self):
        self.client.force_authenticate(user=self.student)
        res = self.client.post('/api/transit/routes/', {'name': 'Hack Line', 'short_name': 'HL'})
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_anonymous_cannot_update_vehicle_location(self):
        res = self.client.post(
            f'/api/transit/vehicles/{self.vehicle.id}/update_location/',
            {'latitude': '31.252000', 'longitude': '75.702000'},
        )
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    @override_settings(IOT_DEVICE_TOKEN='test-iot-secret')
    def test_iot_token_can_update_vehicle_location(self):
        res = self.client.post(
            f'/api/transit/vehicles/{self.vehicle.id}/update_location/',
            {'latitude': '31.252000', 'longitude': '75.702000', 'speed_kmh': 20},
            HTTP_X_IOT_DEVICE_TOKEN='test-iot-secret',
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.vehicle.refresh_from_db()
        self.assertEqual(self.vehicle.speed_kmh, 20)
