import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  LocateFixed,
  Loader2,
  Footprints,
  ExternalLink,
  X,
  Compass,
  Siren,
  HeartPulse,
} from 'lucide-react';
import L from 'leaflet';
import { SHUTTLE_ROUTES, SHUTTLE_STOPS } from '../../data/shuttleData';
import transitService from '../../services/transitService';
import EmergencySosModal from './EmergencySosModal';

/**
 * Sanitize a string value before injecting into innerHTML to prevent XSS.
 * Escapes HTML special characters: &, <, >, ", '
 */
function escHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Stable campus center coordinates for LPU
const DEFAULT_LPU_CENTER = [31.2530, 75.7045];

/**
 * Validate GPS coordinates against physical boundaries and integrity rules.
 * Rejects null, undefined, empty strings, NaN, non-finite values,
 * coordinates outside physical limits (-90..90 lat, -180..180 lng),
 * and origin clamps (0, 0).
 */
function isValidCoordinate(latitude, longitude) {
  if (latitude === null || latitude === undefined || longitude === null || longitude === undefined) {
    return false;
  }
  if (typeof latitude === 'string' && latitude.trim() === '') return false;
  if (typeof longitude === 'string' && longitude.trim() === '') return false;

  const lat = Number(latitude);
  const lng = Number(longitude);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
  if (lat < -90 || lat > 90) return false;
  if (lng < -180 || lng > 180) return false;
  if (lat === 0 && lng === 0) return false;

  return true;
}

/**
 * Calculate great-circle distance between two GPS coordinates using Haversine formula (meters).
 */
function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

function formatDistance(meters) {
  if (meters < 1000) return `${meters} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

function formatDuration(seconds) {
  const mins = Math.max(1, Math.round(seconds / 60));
  if (mins < 60) return `~${mins} min walk`;
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  return `~${hrs} hr ${remMins} min walk`;
}

// Distinct category color mappings for custom marker pins
const CATEGORY_COLORS = {
  academic: { bg: '#2563eb', border: '#1d4ed8', text: '#ffffff', label: 'Academic' }, // Sapphire Blue
  library: { bg: '#7c3aed', border: '#6d28d9', text: '#ffffff', label: 'Library' },   // Purple
  sports: { bg: '#16a34a', border: '#15803d', text: '#ffffff', label: 'Sports' },     // Emerald Green
  recreation: { bg: '#16a34a', border: '#15803d', text: '#ffffff', label: 'Sports' },
  food: { bg: '#ea580c', border: '#c2410c', text: '#ffffff', label: 'Food & Dining' }, // Orange
  cafeteria: { bg: '#ea580c', border: '#c2410c', text: '#ffffff', label: 'Food & Dining' },
  dining: { bg: '#ea580c', border: '#c2410c', text: '#ffffff', label: 'Food & Dining' },
  healthcare: { bg: '#dc2626', border: '#b91c1c', text: '#ffffff', label: 'Healthcare' }, // Crimson Red
  hospital: { bg: '#dc2626', border: '#b91c1c', text: '#ffffff', label: 'Healthcare' },
  medical: { bg: '#dc2626', border: '#b91c1c', text: '#ffffff', label: 'Healthcare' },
  bank: { bg: '#bdd906ff', border: '#b45309', text: '#ffffff', label: 'Banking & ATM' },  // Amber Gold
  atm: { bg: '#bdd906ff', border: '#b45309', text: '#ffffff', label: 'Banking & ATM' },
  laboratory: { bg: '#0284c7', border: '#0369a1', text: '#ffffff', label: 'Labs' },     // Sky Blue
  lab: { bg: '#0284c7', border: '#0369a1', text: '#ffffff', label: 'Labs' },
  admin: { bg: '#4338ca', border: '#3730a3', text: '#ffffff', label: 'Admin' },         // Deep Indigo
  washroom: { bg: '#0891b2', border: '#0e7490', text: '#ffffff', label: 'Washrooms' },  // Cyan/Teal
  water: { bg: '#06b6d4', border: '#0891b2', text: '#ffffff', label: 'Drinking Water' },
  parking: { bg: '#475569', border: '#334155', text: '#ffffff', label: 'Parking' },     // Slate Charcoal
  hostel: { bg: '#c026d3', border: '#a21caf', text: '#ffffff', label: 'Hostel' },       // Fuchsia Pink
  default: { bg: '#6366f1', border: '#4f46e5', text: '#ffffff', label: 'Other' },
};

function getCategoryColor(categoryName = '') {
  const normalized = (categoryName || '').toLowerCase().trim();
  for (const [key, val] of Object.entries(CATEGORY_COLORS)) {
    if (key !== 'default' && normalized.includes(key)) {
      return val;
    }
  }
  return CATEGORY_COLORS.default;
}

function createPinIcon(facility, isMiniMap = false, isSelected = false) {
  const categoryName = facility.category?.name || facility.category_name;
  const color = getCategoryColor(categoryName);

  // Compact, proportional icon dimensions
  const width = isMiniMap ? 18 : (isSelected ? 26 : 21);
  const height = isMiniMap ? 23 : (isSelected ? 33 : 27);
  const iconSize = [width, height];
  const iconAnchor = [width / 2, height];

  const svgPin = `
    <div style="position: relative; width: ${width}px; height: ${height}px; display: flex; align-items: center; justify-content: center; cursor: pointer; filter: drop-shadow(0 2px 3px rgba(0,0,0,0.25)); transform: ${isSelected ? 'scale(1.15)' : 'scale(1)'}; transition: transform 0.15s ease;">
      <svg width="${width}" height="${height}" viewBox="0 0 24 30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 0C5.37258 0 0 5.37258 0 12C0 19.5 12 30 12 30C12 30 24 19.5 24 12C24 5.37258 18.6274 0 12 0Z" fill="${color.bg}" stroke="${isSelected ? '#facc15' : color.border}" stroke-width="${isSelected ? '2.5' : '1.5'}"/>
        <circle cx="12" cy="11" r="4.5" fill="white" />
        <circle cx="12" cy="11" r="2.5" fill="${color.bg}" />
      </svg>
    </div>
  `;

  return L.divIcon({
    className: 'custom-map-marker',
    html: svgPin,
    iconSize,
    iconAnchor,
    popupAnchor: [0, -(height - 2)],
  });
}

function createRickshawIcon(name) {
  return L.divIcon({
    className: 'custom-rickshaw-marker',
    html: `
      <div style="
        display: flex; align-items: center; gap: 4px;
        background: #f59e0b;
        border: 2px solid #ffffff;
        padding: 2.5px 8px;
        border-radius: 9999px;
        font-size: 11px;
        font-weight: 800;
        color: #0f172a;
        box-shadow: 0 3px 8px rgba(0,0,0,0.35);
        cursor: pointer;
        white-space: nowrap;
      ">
        <span style="font-size: 14px;">🛺</span>
        <span>${name}</span>
      </div>
    `,
    iconSize: [120, 26],
    iconAnchor: [60, 13],
  });
}

export default function CampusMap({
  facilities = [],
  selectedFacilityId = null,
  onMarkerSelect = null,
  height = '100%',
  initialCenter = DEFAULT_LPU_CENTER,
  initialZoom = 16,
  isMiniMap = false,
  tileUrl = import.meta.env.VITE_MAP_TILE_URL || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution = import.meta.env.VITE_MAP_TILE_ATTRIBUTION || '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
}) {
  const [tileError, setTileError] = useState(false);
  const [locating, setLocating] = useState(false);
  const [routeLoading, setRouteLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [activeRoute, setActiveRoute] = useState(null);
  const [selectedDestinationId, setSelectedDestinationId] = useState('');
  const [showShuttles, setShowShuttles] = useState(false);
  const [isSosOpen, setIsSosOpen] = useState(false);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const markerMapRef = useRef(new Map());
  const userLocationLayerRef = useRef(null);
  const userCoordsRef = useRef(null);
  const routeLayerRef = useRef(null);
  const shuttleLayerRef = useRef(null);
  const rickshawIntervalRef = useRef(null);
  const navigate = useNavigate();

  // Clear active route from map
  const clearRoute = useCallback(() => {
    if (routeLayerRef.current) {
      routeLayerRef.current.remove();
      routeLayerRef.current = null;
    }
    setActiveRoute(null);
    setSelectedDestinationId('');
  }, []);

  // Draw polyline on the map
  const drawRoute = useCallback((origin, destinationFacility, routeCoords, distanceMeters, durationSeconds, isFallback) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (routeLayerRef.current) {
      routeLayerRef.current.remove();
      routeLayerRef.current = null;
    }

    const isEmergency = Boolean(
      destinationFacility?.type === 'medical' ||
      destinationFacility?.type === 'security' ||
      destinationFacility?.isEmergency ||
      (destinationFacility?.name || '').toLowerCase().includes('hospital')
    );

    // Outer glow / outline for visibility
    const glowLine = L.polyline(routeCoords, {
      color: isEmergency ? '#fee2e2' : '#ffffff',
      weight: isEmergency ? 10 : 8,
      opacity: 0.9,
      lineCap: 'round',
      lineJoin: 'round',
    });

    // Inner route line
    const mainLine = L.polyline(routeCoords, {
      color: isEmergency ? '#dc2626' : '#4f46e5',
      weight: isEmergency ? 6 : 5,
      opacity: 0.95,
      dashArray: isFallback ? '6, 8' : undefined,
      lineCap: 'round',
      lineJoin: 'round',
    });

    const group = L.layerGroup([glowLine, mainLine]);
    group.addTo(map);
    routeLayerRef.current = group;

    // Smoothly fit map to show entire path between user and destination
    map.fitBounds(L.latLngBounds(routeCoords), {
      padding: [70, 70],
      maxZoom: 18,
    });

    setActiveRoute({
      facility: destinationFacility,
      origin,
      destination: {
        lat: parseFloat(destinationFacility.latitude),
        lng: parseFloat(destinationFacility.longitude),
      },
      formattedDistance: formatDistance(distanceMeters),
      formattedDuration: formatDuration(durationSeconds),
      isFallback,
      isEmergency,
    });
    setSelectedDestinationId(String(destinationFacility.id));
  }, []);

  // Request or fetch GPS and compute walking route to a target facility
  const handleGetDirections = useCallback((destinationFacility) => {
    if (!isValidCoordinate(destinationFacility?.latitude, destinationFacility?.longitude)) {
      setLocationError('This facility does not have valid GPS coordinates.');
      return;
    }

    const destLat = parseFloat(destinationFacility.latitude);
    const destLng = parseFloat(destinationFacility.longitude);

    const proceedWithRoute = async (originCoords) => {
      setRouteLoading(true);
      setLocationError(null);

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4500);

        const url = `https://router.project-osrm.org/route/v1/walking/${originCoords.lng},${originCoords.lat};${destLng},${destLat}?overview=full&geometries=geojson`;
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        const data = await res.json();
        if (data.code === 'Ok' && data.routes && data.routes[0]) {
          const route = data.routes[0];
          // OSRM GeoJSON coords are [lng, lat], Leaflet expects [lat, lng]
          const latLngs = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
          drawRoute(originCoords, destinationFacility, latLngs, route.distance, route.duration, false);
        } else {
          throw new Error('OSRM route unavailable');
        }
      } catch {
        // Fallback: direct line with Haversine formula distance
        const dist = calculateDistanceMeters(originCoords.lat, originCoords.lng, destLat, destLng);
        const estDuration = Math.round(dist / 1.25); // average walking speed 4.5 km/h
        const directLine = [
          [originCoords.lat, originCoords.lng],
          [destLat, destLng],
        ];
        drawRoute(originCoords, destinationFacility, directLine, dist, estDuration, true);
      } finally {
        setRouteLoading(false);
      }
    };

    if (userCoordsRef.current) {
      proceedWithRoute(userCoordsRef.current);
    } else {
      if (!navigator.geolocation) {
        setLocationError('Geolocation is not supported by your browser.');
        return;
      }
      setLocating(true);
      setLocationError(null);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          const coords = { lat: latitude, lng: longitude, accuracy };
          userCoordsRef.current = coords;

          const map = mapInstanceRef.current;
          if (map) {
            if (userLocationLayerRef.current) {
              userLocationLayerRef.current.remove();
            }
            const userIcon = L.divIcon({
              className: '',
              html: `<div style="
                width:18px; height:18px;
                background:#2563eb;
                border:3px solid white;
                border-radius:50%;
                box-shadow:0 0 0 4px rgba(37,99,235,0.3);
              "></div>`,
              iconSize: [18, 18],
              iconAnchor: [9, 9],
            });
            const userMarker = L.marker([latitude, longitude], { icon: userIcon })
              .bindPopup('<div class="p-2 text-sm font-semibold text-slate-800">📍 You are here</div>', { closeButton: false });
            const accuracyCircle = L.circle([latitude, longitude], {
              radius: accuracy,
              color: '#2563eb',
              fillColor: '#2563eb',
              fillOpacity: 0.1,
              weight: 1,
            });
            const layer = L.layerGroup([accuracyCircle, userMarker]);
            layer.addTo(map);
            userLocationLayerRef.current = layer;
          }

          setLocating(false);
          proceedWithRoute(coords);
        },
        (err) => {
          setLocating(false);
          if (err.code === 1) setLocationError('Location access was denied. Please allow location access in your browser to get directions.');
          else setLocationError('Unable to detect current GPS location. Please try again.');
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, [drawRoute]);

  // Locate user on map
  const handleLocateMe = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const coords = { lat: latitude, lng: longitude, accuracy };
        userCoordsRef.current = coords;
        const map = mapInstanceRef.current;
        if (!map) { setLocating(false); return; }

        // Remove previous user location layer
        if (userLocationLayerRef.current) {
          userLocationLayerRef.current.remove();
        }

        // Blue dot icon for user
        const userIcon = L.divIcon({
          className: '',
          html: `<div style="
            width:18px; height:18px;
            background:#2563eb;
            border:3px solid white;
            border-radius:50%;
            box-shadow:0 0 0 4px rgba(37,99,235,0.3);
          "></div>`,
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        });

        const userMarker = L.marker([latitude, longitude], { icon: userIcon })
          .bindPopup('<div class="p-2 text-sm font-semibold text-slate-800">📍 You are here</div>', { closeButton: false });

        const accuracyCircle = L.circle([latitude, longitude], {
          radius: accuracy,
          color: '#2563eb',
          fillColor: '#2563eb',
          fillOpacity: 0.1,
          weight: 1,
        });

        const layer = L.layerGroup([accuracyCircle, userMarker]);
        layer.addTo(map);
        userLocationLayerRef.current = layer;

        map.setView([latitude, longitude], 17, { animate: true });
        userMarker.openPopup();
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        if (err.code === 1) setLocationError('Location access denied. Please allow location in your browser.');
        else if (err.code === 2) setLocationError('Location unavailable. Try again.');
        else setLocationError('Could not get your location. Try again.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  // Stabilize scalar center values to prevent accidental remounts
  const centerLat = initialCenter?.[0] ?? DEFAULT_LPU_CENTER[0];
  const centerLng = initialCenter?.[1] ?? DEFAULT_LPU_CENTER[1];

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Bounds around LPU campus with modest buffer
    const campusBounds = [
      [31.235, 75.685], // South-West
      [31.270, 75.725], // North-East
    ];

    const map = L.map(mapContainerRef.current, {
      center: [centerLat, centerLng],
      zoom: initialZoom,
      minZoom: 14,
      maxZoom: 19,
      maxBounds: campusBounds,
      maxBoundsViscosity: 0.8,
      zoomControl: !isMiniMap,
      scrollWheelZoom: !isMiniMap,
      attributionControl: true,
    });

    // Configurable Tile Layer with OpenStreetMap default
    const tileLayer = L.tileLayer(tileUrl, {
      attribution,
      maxZoom: 19,
      crossOrigin: true,
    }).addTo(map);

    const handleTileError = () => {
      setTileError(true);
    };

    tileLayer.on('tileerror', handleTileError);

    // Marker Layer Group
    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;
    mapInstanceRef.current = map;

    // Ensure map tiles resize correctly once container dimensions settle
    const resizeTimer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    const markerMap = markerMapRef.current;

    return () => {
      clearTimeout(resizeTimer);
      tileLayer.off('tileerror', handleTileError);
      if (shuttleLayerRef.current) {
        shuttleLayerRef.current.remove();
        shuttleLayerRef.current = null;
      }
      if (rickshawIntervalRef.current) {
        clearInterval(rickshawIntervalRef.current);
        rickshawIntervalRef.current = null;
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersLayerRef.current = null;
        markerMap.clear();
      }
    };
  }, [tileUrl, attribution, centerLat, centerLng, initialZoom, isMiniMap]);

  // Shuttle & E-Rickshaw Layer Effect (Loads from database API with fallback)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (!showShuttles) {
      if (shuttleLayerRef.current) {
        shuttleLayerRef.current.remove();
        shuttleLayerRef.current = null;
      }
      if (rickshawIntervalRef.current) {
        clearInterval(rickshawIntervalRef.current);
        rickshawIntervalRef.current = null;
      }
      return;
    }

    let isMounted = true;
    const group = L.layerGroup();
    shuttleLayerRef.current = group;
    group.addTo(map);

    const initTransitLayer = async () => {
      let activeRoutes = SHUTTLE_ROUTES;
      let activeStops = SHUTTLE_STOPS;
      let activeVehicles = [];

      try {
        const [rRes, sRes, vRes] = await Promise.all([
          transitService.getRoutes(),
          transitService.getStops(),
          transitService.getVehicles(),
        ]);
        if (rRes && rRes.length > 0) activeRoutes = rRes;
        if (sRes && sRes.length > 0) activeStops = sRes;
        if (vRes && vRes.length > 0) activeVehicles = vRes;
      } catch (err) {
        console.warn('Using local shuttle data fallback:', err);
      }

      if (!isMounted) return;

      // 1. Render Shuttle Routes (Drawn directly connecting assigned stops in order)
      const routePathsMap = new Map();

      for (const route of activeRoutes) {
        // Find all active stops assigned to this route, sorted by order
        const routeStops = activeStops
          .filter(
            (s) =>
              (String(s.route) === String(route.id) ||
                String(s.route_id) === String(route.id) ||
                (route.name && s.route_name === route.name)) &&
              s.is_active
          )
          .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));

        let stopCoords = [];
        if (routeStops.length >= 2) {
          stopCoords = routeStops.map((s) => [parseFloat(s.latitude), parseFloat(s.longitude)]);
        } else if (route.stop_coordinates && route.stop_coordinates.length >= 2) {
          stopCoords = route.stop_coordinates;
        } else if (route.waypoints && route.waypoints.length >= 2) {
          stopCoords = route.waypoints;
        } else {
          stopCoords = [DEFAULT_LPU_CENTER];
        }

        // Render base polyline connecting all stops
        const glow = L.polyline(stopCoords, {
          color: '#ffffff',
          weight: 7,
          opacity: 0.85,
        });

        const line = L.polyline(stopCoords, {
          color: route.color || '#f59e0b',
          weight: 4.5,
          dashArray: '8, 8',
          opacity: 0.95,
        });

        const popupHtml = `
          <div class="p-3 font-sans max-w-[260px] text-slate-800">
            <div class="flex items-center gap-2">
              <span style="background-color: ${route.color || '#f59e0b'};" class="w-3 h-3 rounded-full inline-block"></span>
              <span class="font-extrabold text-xs uppercase tracking-wider" style="color: ${route.secondary_color || route.color || '#f59e0b'}">
                ${route.name}
              </span>
            </div>
            <p class="text-xs font-semibold text-slate-900 mt-1.5 leading-snug">${route.description || ''}</p>
            <div class="mt-2.5 pt-2 border-t border-slate-100 text-[11px] space-y-1 text-slate-600">
              <div>⏱️ Frequency: <strong class="text-slate-900">${route.frequency}</strong></div>
              <div>🕒 Operating Hours: <strong class="text-slate-900">${route.operating_hours || route.operatingHours}</strong></div>
              <div>🎫 Fare: <strong class="text-slate-900">${route.fare}</strong></div>
              <div>🚏 Connected Stops: <strong class="text-slate-900">${routeStops.length} stops</strong></div>
            </div>
          </div>
        `;
        line.bindPopup(popupHtml, { className: 'rounded-xl shadow-lg' });

        group.addLayer(glow);
        group.addLayer(line);
        routePathsMap.set(route.id, stopCoords);

        // Background road snapping via OSRM to curve along campus streets smoothly
        if (stopCoords.length >= 2) {
          (async () => {
            try {
              const coordsParam = stopCoords.map(([lat, lng]) => `${lng},${lat}`).join(';');
              const ctrl = new AbortController();
              const tid = setTimeout(() => ctrl.abort(), 2500);
              const osrmRes = await fetch(
                `https://router.project-osrm.org/route/v1/driving/${coordsParam}?overview=full&geometries=geojson`,
                { signal: ctrl.signal }
              );
              clearTimeout(tid);
              if (osrmRes.ok) {
                const osrmData = await osrmRes.json();
                if (osrmData.routes && osrmData.routes[0]?.geometry?.coordinates?.length > 0) {
                  const snapped = osrmData.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
                  if (isMounted) {
                    glow.setLatLngs(snapped);
                    line.setLatLngs(snapped);
                    routePathsMap.set(route.id, snapped);
                  }
                }
              }
            } catch {
              // Graceful fallback to direct stop-to-stop line
            }
          })();
        }
      }

      // 2. Add Shuttle Stops
      activeStops.forEach((stop) => {
        const stopLat = parseFloat(stop.latitude);
        const stopLng = parseFloat(stop.longitude);
        if (!isValidCoordinate(stopLat, stopLng)) return;

        const stopIcon = L.divIcon({
          className: 'custom-shuttle-stop',
          html: `
            <div style="
              width: 26px; height: 26px;
              border-radius: 50%;
              background: #0f172a;
              border: 2px solid #ffffff;
              color: #ffffff;
              display: flex; align-items: center; justify-content: center;
              font-size: 12px;
              box-shadow: 0 3px 8px rgba(0,0,0,0.35);
              cursor: pointer;
              transition: transform 0.15s ease;
            ">🚏</div>
          `,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });

        const stopMarker = L.marker([stopLat, stopLng], { icon: stopIcon });

        const popupDiv = document.createElement('div');
        popupDiv.className = 'p-3 font-sans max-w-[240px] text-slate-800';
        popupDiv.innerHTML = `
          <div class="flex items-center justify-between gap-2">
            <span class="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 tracking-wider">
              ${escHtml(stop.code || 'STOP')}
            </span>
            <span class="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              ${escHtml(stop.interval_text || stop.intervalText || 'Next in ~4 min')}
            </span>
          </div>
          <div class="font-bold text-sm text-slate-900 mt-1.5">${escHtml(stop.name)}</div>
          <div class="text-xs text-slate-500 mt-0.5">${escHtml(stop.landmark || '')}</div>
          <div class="mt-3 pt-2 border-t border-slate-100">
            <button type="button" class="nav-stop-btn w-full py-1.5 px-3 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
              <span>Get Directions to Stop ➔</span>
            </button>
          </div>
        `;

        popupDiv.querySelector('.nav-stop-btn').addEventListener('click', () => {
          stopMarker.closePopup();
          handleGetDirections({
            name: stop.name,
            building: stop.landmark || stop.code,
            latitude: stopLat,
            longitude: stopLng,
          });
        });

        stopMarker.bindPopup(popupDiv, { className: 'rounded-xl shadow-lg' });
        group.addLayer(stopMarker);
      });

      // 3. E-Rickshaws (Plotted from Database Vehicles)
      const vehicleMarkers = [];

      if (activeVehicles.length > 0) {
        activeVehicles.forEach((veh, vIdx) => {
          const rPath = routePathsMap.get(veh.route) || routePathsMap.get(veh.route_id) || [];
          let vLat = parseFloat(veh.current_latitude);
          let vLng = parseFloat(veh.current_longitude);

          if ((!isValidCoordinate(vLat, vLng) || isNaN(vLat)) && rPath.length > 0) {
            vLat = rPath[vIdx % rPath.length][0];
            vLng = rPath[vIdx % rPath.length][1];
          }
          if (!isValidCoordinate(vLat, vLng) || isNaN(vLat)) {
            vLat = 31.253400;
            vLng = 75.703600;
          }

          const marker = L.marker([vLat, vLng], {
            icon: createRickshawIcon(veh.vehicle_number || 'E-Rickshaw'),
          });
          const vPopup = `
            <div class="p-2.5 font-sans text-xs text-slate-800">
              <div class="font-bold text-sm text-slate-900">${veh.vehicle_number}</div>
              <div class="text-slate-500 mt-0.5">Driver: <strong>${veh.driver_name}</strong></div>
              <div class="text-slate-500">Route: <strong>${veh.route_name || 'Assigned Line'}</strong></div>
              <div class="text-slate-500">Speed: <strong>${veh.speed_kmh} km/h</strong></div>
              <div class="text-[10px] text-emerald-700 font-bold mt-1">● Live GPS Tracked</div>
            </div>
          `;
          marker.bindPopup(vPopup);
          group.addLayer(marker);
          vehicleMarkers.push({ marker, vehId: veh.id, baseLat: vLat, baseLng: vLng, routePath: rPath });
        });
      } else {
        // Fallback default 3 demo rickshaws
        const rickshaw1 = L.marker([31.252400, 75.702100], { icon: createRickshawIcon('Rickshaw #4') });
        const rickshaw2 = L.marker([31.254800, 75.706100], { icon: createRickshawIcon('Rickshaw #9') });
        const rickshaw3 = L.marker([31.249200, 75.705500], { icon: createRickshawIcon('Rickshaw #14') });
        group.addLayer(rickshaw1);
        group.addLayer(rickshaw2);
        group.addLayer(rickshaw3);
        vehicleMarkers.push(
          { marker: rickshaw1, baseLat: 31.252400, baseLng: 75.702100 },
          { marker: rickshaw2, baseLat: 31.254800, baseLng: 75.706100 },
          { marker: rickshaw3, baseLat: 31.249200, baseLng: 75.705500 }
        );
      }

      // Movement ticker to simulate live GPS tracking & periodically poll backend for fresh IoT coordinates
      let step = 0;
      let pollCounter = 0;
      rickshawIntervalRef.current = setInterval(async () => {
        step = (step + 1) % 40;
        const progress = step / 40;
        pollCounter++;

        // Every 5 seconds (10 ticks * 500ms or 2.5 ticks * 2000ms), check if admin or IoT pinged new coordinates
        if (pollCounter % 4 === 0) {
          try {
            const freshVehicles = await transitService.getVehicles();
            if (freshVehicles && freshVehicles.length > 0) {
              freshVehicles.forEach((fv) => {
                const vm = vehicleMarkers.find((item) => item.vehId === fv.id);
                if (vm && fv.current_latitude && fv.current_longitude) {
                  vm.baseLat = parseFloat(fv.current_latitude);
                  vm.baseLng = parseFloat(fv.current_longitude);
                }
              });
            }
          } catch {
            // Ignore polling errors
          }
        }

        // Smooth subtle vehicle movement around their current GPS track
        vehicleMarkers.forEach((vm, idx) => {
          const deltaLat = Math.sin((progress * Math.PI * 2) + idx) * 0.0004;
          const deltaLng = Math.cos((progress * Math.PI * 2) + idx) * 0.0004;
          vm.marker.setLatLng([vm.baseLat + deltaLat, vm.baseLng + deltaLng]);
        });
      }, 2000);
    };

    initTransitLayer();

    return () => {
      isMounted = false;
      if (shuttleLayerRef.current) {
        shuttleLayerRef.current.remove();
        shuttleLayerRef.current = null;
      }
      if (rickshawIntervalRef.current) {
        clearInterval(rickshawIntervalRef.current);
        rickshawIntervalRef.current = null;
      }
    };
  }, [showShuttles, handleGetDirections]);

  // Update Markers when facilities or selectedFacilityId change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();
    markerMapRef.current.clear();

    const validFacilities = facilities.filter((f) => isValidCoordinate(f.latitude, f.longitude));

    if (validFacilities.length === 0) return;

    const latLngBounds = [];

    validFacilities.forEach((facility) => {
      const lat = parseFloat(facility.latitude);
      const lon = parseFloat(facility.longitude);
      const isSelected = String(facility.id) === String(selectedFacilityId);

      const icon = createPinIcon(facility, isMiniMap, isSelected);
      const marker = L.marker([lat, lon], { icon });

      // Safe DOM construction for popup to prevent HTML injection
      const categoryName = facility.category?.name || facility.category_name || 'General';
      const categoryColor = getCategoryColor(categoryName);
      const popupDiv = document.createElement('div');
      popupDiv.className = 'p-3 font-sans max-w-[260px] text-slate-800';

      // 1. Header Row (Name + Status Badge)
      const headerRow = document.createElement('div');
      headerRow.className = 'flex items-start justify-between gap-2';

      const titleEl = document.createElement('div');
      titleEl.className = 'font-semibold text-sm text-slate-900 leading-snug';
      titleEl.textContent = facility.name || 'Unnamed Facility';
      headerRow.appendChild(titleEl);

      const statusBadge = document.createElement('span');
      statusBadge.className = facility.is_active
        ? 'inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-800 shrink-0'
        : 'inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-rose-100 text-rose-800 shrink-0';
      statusBadge.textContent = facility.is_active ? 'Active' : 'Inactive';
      headerRow.appendChild(statusBadge);
      popupDiv.appendChild(headerRow);

      // 2. Category Pill
      const catContainer = document.createElement('div');
      catContainer.className = 'mt-1';
      const catBadge = document.createElement('span');
      catBadge.className = 'inline-block text-[11px] font-medium px-2 py-0.5 rounded-full text-white';
      catBadge.style.backgroundColor = categoryColor.bg;
      catBadge.textContent = categoryName;
      catContainer.appendChild(catBadge);
      popupDiv.appendChild(catContainer);

      // 3. Building Info (safe textContent)
      if (facility.building) {
        const bldgEl = document.createElement('div');
        bldgEl.className = 'text-xs text-slate-500 mt-1 flex items-center gap-1';

        const bldgName = document.createElement('span');
        bldgName.className = 'font-medium text-slate-700';
        bldgName.textContent = facility.building;
        bldgEl.appendChild(bldgName);

        if (facility.floor) {
          const floorSpan = document.createElement('span');
          floorSpan.textContent = `• Floor ${facility.floor}`;
          bldgEl.appendChild(floorSpan);
        }
        popupDiv.appendChild(bldgEl);
      }

      // 4. Operating Hours (safe textContent)
      if (facility.operating_hours) {
        const hoursEl = document.createElement('div');
        hoursEl.className = 'text-[11px] text-slate-500 mt-1 truncate';
        hoursEl.textContent = `🕒 ${facility.operating_hours}`;
        popupDiv.appendChild(hoursEl);
      }

      // 5. Action Buttons with query string preservation in state
      if (!isMiniMap) {
        const actionRow = document.createElement('div');
        actionRow.className = 'mt-2.5 pt-2 border-t border-slate-100 flex flex-col gap-1.5';

        // 1. Get Walking Directions Button
        const dirBtn = document.createElement('button');
        dirBtn.type = 'button';
        dirBtn.className = 'w-full py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer';
        dirBtn.innerHTML = `<span>🧭 Get Walking Route</span>`;
        dirBtn.addEventListener('click', () => {
          marker.closePopup();
          handleGetDirections(facility);
        });
        actionRow.appendChild(dirBtn);

        // 2. View Details Button
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'view-facility-btn w-full py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer';
        btn.innerHTML = `<span>View Details →</span>`;

        btn.addEventListener('click', () => {
          if (onMarkerSelect) {
            onMarkerSelect(facility);
          }
          navigate(`/facilities/${facility.id}`, {
            state: {
              fromMap: true,
              mapSearch: window.location.search || '',
            },
          });
        });

        actionRow.appendChild(btn);
        popupDiv.appendChild(actionRow);
      }

      marker.bindPopup(popupDiv, {
        closeButton: true,
        className: 'rounded-xl shadow-lg',
      });

      marker.on('click', () => {
        if (onMarkerSelect) {
          onMarkerSelect(facility);
        }
      });

      markersLayer.addLayer(marker);
      markerMapRef.current.set(String(facility.id), marker);
      latLngBounds.push([lat, lon]);
    });

    // Auto-center or fit bounds
    if (selectedFacilityId && markerMapRef.current.has(String(selectedFacilityId))) {
      const selectedMarker = markerMapRef.current.get(String(selectedFacilityId));
      const targetLatLng = selectedMarker.getLatLng();
      map.setView(targetLatLng, Math.max(map.getZoom(), 17), { animate: true });
      selectedMarker.openPopup();
    } else if (isMiniMap && validFacilities.length === 1) {
      const f = validFacilities[0];
      map.setView([parseFloat(f.latitude), parseFloat(f.longitude)], 17);
    } else if (latLngBounds.length > 1 && !isMiniMap) {
      // Fit bounds to display all filtered markers smoothly
      map.fitBounds(latLngBounds, { padding: [50, 50], maxZoom: 17 });
    }
  }, [facilities, selectedFacilityId, isMiniMap, onMarkerSelect, navigate, handleGetDirections]);

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-slate-200 shadow-sm" style={{ height }}>
      {tileError && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-[1000] px-3 py-1.5 rounded-lg bg-amber-500/95 text-white text-xs font-medium shadow-md flex items-center gap-1.5 pointer-events-none">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>Map tiles could not be loaded. Please check your network connection.</span>
        </div>
      )}

      {/* Top Map Action Bar */}
      {!isMiniMap && (
        <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          {/* Quick Navigate Destination Selector */}
          <div className="flex items-center gap-2 w-full sm:w-auto max-w-xs sm:max-w-sm pointer-events-auto">
            <div className="w-full bg-white/95 backdrop-blur-md rounded-xl shadow-md border border-slate-200/90 px-3 py-2 flex items-center gap-2">
              <Compass className="w-4 h-4 text-indigo-600 shrink-0" />
              <select
                value={selectedDestinationId}
                onChange={(e) => {
                  const facId = e.target.value;
                  if (!facId) {
                    clearRoute();
                    return;
                  }
                  const targetFac = facilities.find((f) => String(f.id) === String(facId));
                  if (targetFac) {
                    handleGetDirections(targetFac);
                  }
                }}
                className="w-full text-xs font-semibold text-slate-700 bg-transparent border-none focus:outline-hidden cursor-pointer"
              >
                <option value="">Quick Navigate: Select Facility...</option>
                {facilities.filter((f) => isValidCoordinate(f.latitude, f.longitude)).map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} {f.building ? `(${f.building})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Shuttle Layer Toggle & Emergency SOS Buttons */}
          <div className="flex items-center gap-2 pointer-events-auto ml-auto">
            {/* E-Rickshaws & Shuttles Toggle */}
            <button
              type="button"
              onClick={() => setShowShuttles((prev) => !prev)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
                showShuttles
                  ? 'bg-amber-500 text-slate-900 border-2 border-amber-300 ring-2 ring-amber-400/40'
                  : 'bg-white/95 backdrop-blur-md text-slate-700 hover:text-slate-900 border border-slate-200 hover:bg-white'
              }`}
              title="Toggle campus shuttle routes and designated e-rickshaw stands"
            >
              <span className="text-sm">🛺</span>
              <span className="hidden sm:inline">Shuttles & E-Rickshaws</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${showShuttles ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {showShuttles ? 'LIVE' : 'OFF'}
              </span>
            </button>

            {/* Emergency SOS Button */}
            <button
              type="button"
              onClick={() => setIsSosOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-lg shadow-red-500/30 border border-red-400/50 hover:scale-105 active:scale-95 transition-all cursor-pointer animate-pulse"
              title="One-Tap Campus Emergency SOS and Immediate Dispatch"
            >
              <Siren className="w-4 h-4" />
              <span>SOS Emergency</span>
            </button>
          </div>
        </div>
      )}

      {/* Route Loading Banner */}
      {!isMiniMap && routeLoading && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-[1000] px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-lg flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Calculating campus route...</span>
        </div>
      )}

      {/* Active Walking Route Card */}
      {!isMiniMap && activeRoute && (
        <div className={`absolute top-16 left-3 right-3 sm:left-4 sm:right-auto sm:max-w-sm z-[1000] bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border flex flex-col gap-2.5 transition-all ${
          activeRoute.isEmergency ? 'border-red-400 ring-2 ring-red-500/30' : 'border-indigo-100'
        }`}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm text-white ${
                activeRoute.isEmergency ? 'bg-red-600 animate-bounce' : 'bg-indigo-600'
              }`}>
                {activeRoute.isEmergency ? <HeartPulse className="w-4 h-4" /> : <Footprints className="w-4 h-4" />}
              </div>
              <div className="min-w-0">
                <span className={`text-[10px] font-extrabold tracking-wider uppercase block ${
                  activeRoute.isEmergency ? 'text-red-600' : 'text-indigo-600'
                }`}>
                  {activeRoute.isEmergency ? '🚨 Emergency Priority Route' : 'Walking Navigation'}
                </span>
                <h4 className="text-sm font-bold text-slate-900 truncate">
                  {activeRoute.facility.name}
                </h4>
                {activeRoute.facility.building && (
                  <p className="text-xs text-slate-500 truncate">{activeRoute.facility.building}</p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={clearRoute}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Clear Route"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs ${
            activeRoute.isEmergency ? 'bg-red-50/80 border-red-100 text-red-950' : 'bg-indigo-50/80 border-indigo-100 text-slate-800'
          }`}>
            <div className="flex items-center gap-1.5 font-semibold">
              <span className={activeRoute.isEmergency ? 'text-red-600' : 'text-indigo-600'}>📍</span>
              <span>{activeRoute.formattedDistance}</span>
            </div>
            <div className={`h-3 w-px ${activeRoute.isEmergency ? 'bg-red-200' : 'bg-indigo-200'}`} />
            <div className="flex items-center gap-1.5 font-semibold">
              <span className={activeRoute.isEmergency ? 'text-red-600' : 'text-indigo-600'}>⏱️</span>
              <span>{activeRoute.formattedDuration}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-0.5">
            <a
              href={`https://www.google.com/maps/dir/?api=1&origin=${activeRoute.origin.lat},${activeRoute.origin.lng}&destination=${activeRoute.destination.lat},${activeRoute.destination.lng}&travelmode=walking`}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex-1 py-1.5 px-3 rounded-lg text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors ${
                activeRoute.isEmergency ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              <span>Live Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              type="button"
              onClick={clearRoute}
              className="py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Locate Me Button */}
      {!isMiniMap && (
        <div className="absolute bottom-6 right-3 z-[1000] flex flex-col items-end gap-2">
          <button
            onClick={handleLocateMe}
            disabled={locating}
            title="Show my location"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-200 shadow-md text-xs font-semibold text-indigo-600 hover:bg-indigo-50 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
          >
            {locating
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <LocateFixed className="w-4 h-4" />}
            {locating ? 'Locating...' : 'My Location'}
          </button>
          {locationError && (
            <div className="max-w-[220px] px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs shadow-md">
              {locationError}
            </div>
          )}
        </div>
      )}

      {/* Category Color Legend */}
      {!isMiniMap && (
        <div className="absolute bottom-4 left-3 z-[1000] hidden sm:flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl shadow-md border border-slate-200/80 text-[11px] font-medium text-slate-600">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span>Academic</span>
          <span className="text-slate-300">|</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block"></span>Library</span>
          <span className="text-slate-300">|</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-green-600 inline-block"></span>Sports</span>
          <span className="text-slate-300">|</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-orange-600 inline-block"></span>Food</span>
          <span className="text-slate-300">|</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block"></span>Health</span>
          <span className="text-slate-300">|</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-600 inline-block"></span>Bank</span>
        </div>
      )}

      {/* Emergency SOS Modal */}
      {!isMiniMap && (
        <EmergencySosModal
          isOpen={isSosOpen}
          onClose={() => setIsSosOpen(false)}
          userCoords={userCoordsRef.current}
          onFastPathTo={(dest) => handleGetDirections(dest)}
        />
      )}

      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
}
