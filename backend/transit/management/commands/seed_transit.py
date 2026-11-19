from decimal import Decimal
from django.core.management.base import BaseCommand
from transit.models import ShuttleRoute, ShuttleStop, ShuttleVehicle


class Command(BaseCommand):
    help = 'Seeds initial campus E-Rickshaw routes, stops, and vehicles.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('Starting transit data seeding...'))

        # 1. Routes
        r1, _ = ShuttleRoute.objects.update_or_create(
            name='Avenue Express (Line 1)',
            defaults={
                'short_name': 'Line 1',
                'color': '#f59e0b',
                'secondary_color': '#d97706',
                'description': 'Main Gate 1 ↔ UniMall ↔ CS Block 38 ↔ UniHospital',
                'operating_hours': '06:30 AM – 10:30 PM',
                'frequency': 'Every 4–6 mins',
                'fare': '₹10 / Free with Student ID',
                'waypoints': [
                    [31.251500, 75.700800],
                    [31.252400, 75.702100],
                    [31.253400, 75.703600],
                    [31.254200, 75.704800],
                    [31.254800, 75.706100],
                    [31.255500, 75.704000],
                    [31.255000, 75.702000],
                ],
                'is_active': True,
            }
        )

        r2, _ = ShuttleRoute.objects.update_or_create(
            name='Hostel & Stadium Circuit (Line 2)',
            defaults={
                'short_name': 'Line 2',
                'color': '#10b981',
                'secondary_color': '#059669',
                'description': 'UniMall ↔ ATM Hub ↔ Boys Hostels (BH 4/5/6) ↔ Stadium',
                'operating_hours': '06:00 AM – 10:00 PM',
                'frequency': 'Every 6–8 mins',
                'fare': '₹10 / Free with Student ID',
                'waypoints': [
                    [31.253400, 75.703600],
                    [31.254000, 75.704000],
                    [31.248830, 75.699498],
                    [31.248711, 75.703386],
                    [31.249200, 75.705500],
                    [31.257000, 75.708000],
                ],
                'is_active': True,
            }
        )

        # 2. Stops
        stops_data = [
            {
                'name': 'Main Gate 1 E-Rickshaw Bay',
                'code': 'STOP-G1',
                'route': r1,
                'latitude': Decimal('31.251500'),
                'longitude': Decimal('75.700800'),
                'interval_text': 'Next in ~3 min',
                'landmark': 'Opposite Main Entrance Security Post',
            },
            {
                'name': 'UniMall & Central Plaza Hub',
                'code': 'STOP-UM',
                'route': r1,
                'latitude': Decimal('31.253400'),
                'longitude': Decimal('75.703600'),
                'interval_text': 'Next in ~2 min',
                'landmark': 'Central Avenue Food Court & Banking',
            },
            {
                'name': 'Computer Science Dept (Block 38)',
                'code': 'STOP-B38',
                'route': r1,
                'latitude': Decimal('31.254800'),
                'longitude': Decimal('75.706100'),
                'interval_text': 'Next in ~5 min',
                'landmark': 'Block 38 East Porch',
            },
            {
                'name': 'UniHospital Emergency Stop',
                'code': 'STOP-HOSP',
                'route': r1,
                'latitude': Decimal('31.255000'),
                'longitude': Decimal('75.702000'),
                'interval_text': 'Next in ~4 min',
                'landmark': 'Block 30 Emergency Ambulance Drop-off',
            },
            {
                'name': 'Campus Banking & ATM Hub (Block 32)',
                'code': 'STOP-B32',
                'route': r2,
                'latitude': Decimal('31.254000'),
                'longitude': Decimal('75.704000'),
                'interval_text': 'Next in ~5 min',
                'landmark': 'Block 32 Retail Banking Avenue',
            },
            {
                'name': 'Boys Hostels Hub (BH 4 / 5 / 6)',
                'code': 'STOP-BH',
                'route': r2,
                'latitude': Decimal('31.248800'),
                'longitude': Decimal('75.701500'),
                'interval_text': 'Next in ~4 min',
                'landmark': 'Central Boys Hostel Quadrangle',
            },
            {
                'name': 'Shanti Devi Sports Stadium',
                'code': 'STOP-STD',
                'route': r2,
                'latitude': Decimal('31.257000'),
                'longitude': Decimal('75.708000'),
                'interval_text': 'Next in ~6 min',
                'landmark': 'Indoor Stadium Main Entrance',
            },
        ]

        for s in stops_data:
            ShuttleStop.objects.update_or_create(
                code=s['code'],
                defaults=s
            )

        # 3. Initial Vehicles
        vehicles_data = [
            {
                'vehicle_number': 'Rickshaw #4 (PB08-ER-104)',
                'driver_name': 'Ramesh Kumar',
                'driver_phone': '+91 98765 43210',
                'route': r1,
                'current_latitude': Decimal('31.252400'),
                'current_longitude': Decimal('75.702100'),
                'speed_kmh': 16,
                'status': 'ACTIVE',
            },
            {
                'vehicle_number': 'Rickshaw #9 (PB08-ER-109)',
                'driver_name': 'Sukhwinder Singh',
                'driver_phone': '+91 98765 43211',
                'route': r1,
                'current_latitude': Decimal('31.254800'),
                'current_longitude': Decimal('75.706100'),
                'speed_kmh': 14,
                'status': 'ACTIVE',
            },
            {
                'vehicle_number': 'Rickshaw #14 (PB08-ER-114)',
                'driver_name': 'Gurpreet Singh',
                'driver_phone': '+91 98765 43212',
                'route': r2,
                'current_latitude': Decimal('31.249200'),
                'current_longitude': Decimal('75.705500'),
                'speed_kmh': 18,
                'status': 'ACTIVE',
            },
        ]

        for v in vehicles_data:
            ShuttleVehicle.objects.update_or_create(
                vehicle_number=v['vehicle_number'],
                defaults=v
            )

        self.stdout.write(self.style.SUCCESS('Transit seeding completed successfully!'))

