/**
 * Campus Mobility & Shuttle Network Configuration
 * Lovely Professional University (LPU)
 */

export const SHUTTLE_ROUTES = [
  {
    id: 'route-yellow',
    name: 'Avenue Express (Line 1)',
    shortName: 'Line 1',
    color: '#f59e0b',
    secondaryColor: '#d97706',
    description: 'Main Gate 1 ↔ UniMall ↔ CS Block 38 ↔ UniHospital',
    operatingHours: '06:30 AM – 10:30 PM',
    frequency: 'Every 4–6 mins',
    fare: '₹10 / Free with Student ID',
    // Realistic path waypoints traversing LPU main central avenues
    waypoints: [
      [31.251500, 75.700800], // Main Gate 1
      [31.252400, 75.702100], // Admin Welcome Circle
      [31.253400, 75.703600], // UniMall & Student Plaza
      [31.254200, 75.704800], // Central Lawn Crossing
      [31.254800, 75.706100], // Block 38 (CS / Tech Hub)
      [31.255500, 75.704000], // North Academic Junction
      [31.255000, 75.702000], // UniHospital (Block 30)
    ],
  },
  {
    id: 'route-green',
    name: 'Hostel & Stadium Circuit (Line 2)',
    shortName: 'Line 2',
    color: '#10b981',
    secondaryColor: '#059669',
    description: 'UniMall ↔ ATM Hub ↔ Boys Hostels (BH 4/5/6) ↔ Stadium',
    operatingHours: '06:00 AM – 10:00 PM',
    frequency: 'Every 6–8 mins',
    fare: '₹10 / Free with Student ID',
    // Waypoints connecting student residential blocks and sports complex
    waypoints: [
      [31.253400, 75.703600], // UniMall
      [31.254000, 75.704000], // Block 32 ATM Hub
      [31.248830, 75.699498], // Boys Hostel 4 (BH-4)
      [31.248711, 75.703386], // Boys Hostel 5 (BH-5)
      [31.249200, 75.705500], // Boys Hostel 6 (BH-6)
      [31.257000, 75.708000], // Shanti Devi Stadium
    ],
  },
];

export const SHUTTLE_STOPS = [
  {
    id: 'stop-1',
    name: 'Main Gate 1 E-Rickshaw Bay',
    code: 'STOP-G1',
    latitude: 31.251500,
    longitude: 75.700800,
    routeIds: ['route-yellow'],
    intervalText: 'Next in ~3 min',
    landmark: 'Opposite Main Entrance Security Post',
  },
  {
    id: 'stop-2',
    name: 'UniMall & Central Plaza Hub',
    code: 'STOP-UM',
    latitude: 31.253400,
    longitude: 75.703600,
    routeIds: ['route-yellow', 'route-green'],
    intervalText: 'Next in ~2 min',
    landmark: 'Central Avenue Food Court & Banking',
  },
  {
    id: 'stop-3',
    name: 'Computer Science Dept (Block 38)',
    code: 'STOP-B38',
    latitude: 31.254800,
    longitude: 75.706100,
    routeIds: ['route-yellow'],
    intervalText: 'Next in ~5 min',
    landmark: 'Block 38 East Porch',
  },
  {
    id: 'stop-4',
    name: 'UniHospital Emergency Stop',
    code: 'STOP-HOSP',
    latitude: 31.255000,
    longitude: 75.702000,
    routeIds: ['route-yellow'],
    intervalText: 'Next in ~4 min',
    landmark: 'Block 30 Emergency Ambulance Drop-off',
  },
  {
    id: 'stop-5',
    name: 'Campus Banking & ATM Hub (Block 32)',
    code: 'STOP-B32',
    latitude: 31.254000,
    longitude: 75.704000,
    routeIds: ['route-green'],
    intervalText: 'Next in ~5 min',
    landmark: 'Block 32 Retail Banking Avenue',
  },
  {
    id: 'stop-6',
    name: 'Boys Hostels Hub (BH 4 / 5 / 6)',
    code: 'STOP-BH',
    latitude: 31.248800,
    longitude: 75.701500,
    routeIds: ['route-green'],
    intervalText: 'Next in ~4 min',
    landmark: 'Central Boys Hostel Quadrangle',
  },
  {
    id: 'stop-7',
    name: 'Shanti Devi Sports Stadium',
    code: 'STOP-STD',
    latitude: 31.257000,
    longitude: 75.708000,
    routeIds: ['route-green'],
    intervalText: 'Next in ~6 min',
    landmark: 'Indoor Stadium Main Entrance',
  },
];

export const EMERGENCY_FACILITIES = {
  hospital: {
    name: 'UniHospital & Health Center (Block 30)',
    building: 'Block 30',
    latitude: 31.255000,
    longitude: 75.702000,
    phone: '+91 1824 517111',
    description: '24/7 Campus Hospital with ER, trauma ward, doctors on duty, and ambulance fleet.',
    type: 'medical',
  },
  security: {
    name: 'Campus Security Main Command (Gate 1)',
    building: 'Gate 1 Command Post',
    latitude: 31.251500,
    longitude: 75.700800,
    phone: '+91 1824 517100',
    description: '24/7 Security Operations Room, emergency patrols, and campus police liaison.',
    type: 'security',
  },
  womenSafety: {
    name: 'Women Safety & Proctorial Cell',
    building: 'Block 32 Admin Wing',
    latitude: 31.254000,
    longitude: 75.704000,
    phone: '+91 1824 517000',
    description: 'Confidential 24/7 women safety assistance, escort support, and counseling.',
    type: 'support',
  },
};

