import React, { useState, useEffect, useCallback } from 'react';
import {
  Truck,
  MapPin,
  Navigation,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Radio,
  Search,
  ExternalLink,
  Info,
  Clock,
  IndianRupee,
  RefreshCw,
} from 'lucide-react';
import transitService from '../../services/transitService';
import StopModal from './StopModal';
import RouteModal from './RouteModal';
import VehicleModal from './VehicleModal';
import Spinner from '../common/Spinner';
import Badge from '../common/Badge';

export default function TransitManagementSection() {
  const [activeSubTab, setActiveSubTab] = useState('stops'); // 'stops' | 'routes' | 'vehicles' | 'how_tracking_works'

  // Data states
  const [routes, setRoutes] = useState([]);
  const [stops, setStops] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRouteFilter, setSelectedRouteFilter] = useState('');

  // Modals
  const [isStopModalOpen, setIsStopModalOpen] = useState(false);
  const [editingStop, setEditingStop] = useState(null);

  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);

  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);

  // Live Ping Simulator state
  const [pingStatus, setPingStatus] = useState({});

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [rData, sData, vData] = await Promise.all([
        transitService.getRoutes(),
        transitService.getStops(),
        transitService.getVehicles(),
      ]);
      setRoutes(rData || []);
      setStops(sData || []);
      setVehicles(vData || []);
    } catch (err) {
      console.error('Failed to load transit records:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handlers for Stops
  const handleOpenAddStop = () => {
    setEditingStop(null);
    setIsStopModalOpen(true);
  };

  const handleOpenEditStop = (stop) => {
    setEditingStop(stop);
    setIsStopModalOpen(true);
  };

  const handleDeleteStop = async (stopId, stopName) => {
    if (window.confirm(`Are you sure you want to delete stop "${stopName}"?`)) {
      try {
        await transitService.deleteStop(stopId);
        loadData();
      } catch (err) {
        alert('Failed to delete stop: ' + (err.response?.data?.detail || err.message));
      }
    }
  };

  // Handlers for Routes
  const handleOpenAddRoute = () => {
    setEditingRoute(null);
    setIsRouteModalOpen(true);
  };

  const handleOpenEditRoute = (route) => {
    setEditingRoute(route);
    setIsRouteModalOpen(true);
  };

  const handleDeleteRoute = async (routeId, routeName) => {
    if (window.confirm(`Are you sure you want to delete route "${routeName}"? Stops attached to it will become unassigned.`)) {
      try {
        await transitService.deleteRoute(routeId);
        loadData();
      } catch (err) {
        alert('Failed to delete route: ' + (err.response?.data?.detail || err.message));
      }
    }
  };

  // Handlers for Vehicles
  const handleOpenAddVehicle = () => {
    setEditingVehicle(null);
    setIsVehicleModalOpen(true);
  };

  const handleOpenEditVehicle = (veh) => {
    setEditingVehicle(veh);
    setIsVehicleModalOpen(true);
  };

  const handleDeleteVehicle = async (vehId, vehNum) => {
    if (window.confirm(`Are you sure you want to delete vehicle "${vehNum}"?`)) {
      try {
        await transitService.deleteVehicle(vehId);
        loadData();
      } catch (err) {
        alert('Failed to delete vehicle: ' + (err.response?.data?.detail || err.message));
      }
    }
  };

  // Test Ping GPS location simulation
  const handleSimulateGpsPing = async (vehicle) => {
    try {
      setPingStatus((prev) => ({ ...prev, [vehicle.id]: 'pinging' }));
      // Small random delta to simulate slight vehicle movement (~10-20 meters)
      const latDelta = (Math.random() - 0.5) * 0.0006;
      const lngDelta = (Math.random() - 0.5) * 0.0006;
      const newLat = (parseFloat(vehicle.current_latitude || 31.253400) + latDelta).toFixed(6);
      const newLng = (parseFloat(vehicle.current_longitude || 75.703600) + lngDelta).toFixed(6);
      const randomSpeed = Math.floor(12 + Math.random() * 10);

      await transitService.updateVehicleLocation(vehicle.id, {
        latitude: parseFloat(newLat),
        longitude: parseFloat(newLng),
        speed_kmh: randomSpeed,
      });

      setPingStatus((prev) => ({
        ...prev,
        [vehicle.id]: `Pinged! Lat: ${newLat}, Lng: ${newLng} (${randomSpeed} km/h)`,
      }));
      await loadData();
    } catch (err) {
      setPingStatus((prev) => ({
        ...prev,
        [vehicle.id]: 'Ping error: ' + (err.response?.data?.detail || err.message),
      }));
    }
  };

  // Filtered stops (sorted by route order)
  const filteredStops = stops
    .filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.landmark && s.landmark.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesRoute = selectedRouteFilter ? String(s.route) === String(selectedRouteFilter) : true;
      return matchesSearch && matchesRoute;
    })
    .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));

  return (
    <div className="space-y-6 text-left">
      {/* Top Banner / Summary */}
      <div className="bg-linear-to-r from-amber-500/10 via-orange-500/10 to-emerald-500/10 border border-amber-200/80 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white uppercase tracking-wider flex items-center gap-1">
              <Truck className="w-3.5 h-3.5" />
              Transit Control System
            </span>
            <span className="text-xs text-slate-500 font-medium">LPU Campus Mobility</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            E-Rickshaw Fleet, Routes & Stops Management
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl">
            Control all designated stops, internal routes, operational schedules, and live IoT GPS tracking directly from this dashboard. No code modification required.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-3">
          <div className="bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-xs text-center">
            <div className="text-xs font-semibold text-slate-500">Lines</div>
            <div className="text-lg font-black text-amber-600">{routes.length}</div>
          </div>
          <div className="bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-xs text-center">
            <div className="text-xs font-semibold text-slate-500">Stops</div>
            <div className="text-lg font-black text-slate-800">{stops.length}</div>
          </div>
          <div className="bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-xs text-center">
            <div className="text-xs font-semibold text-slate-500">Fleet</div>
            <div className="text-lg font-black text-emerald-600">{vehicles.length}</div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveSubTab('stops')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeSubTab === 'stops'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Stops ({stops.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('routes')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeSubTab === 'routes'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          <Navigation className="w-4 h-4" />
          <span>Routes & Schedules ({routes.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('vehicles')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeSubTab === 'vehicles'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>E-Rickshaws & Tracking ({vehicles.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('how_tracking_works')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ml-auto ${
            activeSubTab === 'how_tracking_works'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700'
          }`}
        >
          <Info className="w-4 h-4" />
          <span>How Live Tracking Works</span>
        </button>
      </div>

      {/* Loading Spinner */}
      {loading && (
        <div className="py-12 flex justify-center items-center">
          <Spinner size="lg" />
        </div>
      )}

      {/* SUBTAB 1: STOPS MANAGEMENT */}
      {!loading && activeSubTab === 'stops' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex flex-1 items-center gap-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search stop name, code or landmark..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <select
                value={selectedRouteFilter}
                onChange={(e) => setSelectedRouteFilter(e.target.value)}
                className="text-xs sm:text-sm px-3 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">All Lines</option>
                {routes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={loadData}
                title="Refresh"
                className="p-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleOpenAddStop}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs sm:text-sm transition-colors shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add E-Rickshaw Stop</span>
              </button>
            </div>
          </div>

          {/* Stops Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm text-slate-600">
                <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3 font-semibold text-center w-12">Seq #</th>
                    <th className="py-3 px-4 font-semibold">Stop Details</th>
                    <th className="py-3 px-3 font-semibold">Code</th>
                    <th className="py-3 px-3 font-semibold">Assigned Line</th>
                    <th className="py-3 px-3 font-semibold">GPS Coordinates</th>
                    <th className="py-3 px-3 font-semibold">Arrival Interval</th>
                    <th className="py-3 px-3 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStops.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-8 text-center text-slate-400">
                        No stops match your query. Click "Add E-Rickshaw Stop" above to create one.
                      </td>
                    </tr>
                  ) : (
                    filteredStops.map((stop) => (
                      <tr key={stop.id} className="hover:bg-amber-50/30 transition-colors">
                        <td className="py-3 px-3 text-center">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold text-xs">
                            {stop.order || '-'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-900">
                          <div className="flex items-center gap-2">
                            <span className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
                              <MapPin className="w-3.5 h-3.5" />
                            </span>
                            <div>
                              <div className="font-bold text-slate-800">{stop.name}</div>
                              {stop.landmark && (
                                <div className="text-[11px] text-slate-500">{stop.landmark}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 font-mono text-xs font-bold text-slate-700">
                          {stop.code}
                        </td>
                        <td className="py-3 px-3">
                          {stop.route_name ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-100 text-amber-800">
                              {stop.route_name}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs italic">Unassigned</span>
                          )}
                        </td>
                        <td className="py-3 px-3 font-mono text-xs text-slate-600">
                          {parseFloat(stop.latitude).toFixed(6)}, {parseFloat(stop.longitude).toFixed(6)}
                        </td>
                        <td className="py-3 px-3 font-medium text-slate-700">
                          {stop.interval_text}
                        </td>
                        <td className="py-3 px-3">
                          {stop.is_active ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3" /> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                              <XCircle className="w-3 h-3" /> Inactive
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEditStop(stop)}
                              title="Edit Stop & Coordinates"
                              className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteStop(stop.id, stop.name)}
                              title="Delete Stop"
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: ROUTES MANAGEMENT */}
      {!loading && activeSubTab === 'routes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Configured Transit Routes & Schedules</h3>
              <p className="text-xs text-slate-500">Each route plots on the map and coordinates shuttle intervals</p>
            </div>
            <button
              type="button"
              onClick={handleOpenAddRoute}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs sm:text-sm transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Route</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {routes.map((route) => (
              <div
                key={route.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4 hover:shadow-md transition-shadow relative overflow-hidden"
              >
                <div
                  className="absolute top-0 left-0 right-0 h-1.5"
                  style={{ backgroundColor: route.color || '#f59e0b' }}
                />

                <div className="flex items-start justify-between gap-3 pt-1">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="px-2 py-0.5 rounded text-[11px] font-bold text-white shadow-2xs"
                        style={{ backgroundColor: route.color || '#f59e0b' }}
                      >
                        {route.short_name}
                      </span>
                      <h4 className="font-bold text-slate-900 text-base">{route.name}</h4>
                    </div>
                    {route.description && (
                      <p className="text-xs text-slate-600">{route.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEditRoute(route)}
                      className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      title="Edit Route"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteRoute(route.id, route.name)}
                      className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Route"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Timing
                    </span>
                    <span className="font-semibold text-slate-800">{route.operating_hours}</span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block flex items-center gap-1">
                      <Radio className="w-3 h-3" /> Frequency
                    </span>
                    <span className="font-semibold text-slate-800">{route.frequency}</span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block flex items-center gap-1">
                      <IndianRupee className="w-3 h-3" /> Fare
                    </span>
                    <span className="font-semibold text-slate-800">{route.fare}</span>
                  </div>
                </div>

                {/* Assigned Stops count & status */}
                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                  <span className="text-slate-500">
                    Assigned Stops: <strong className="text-slate-700">{route.stops?.length || 0}</strong>
                  </span>
                  {route.is_active ? (
                    <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full text-[11px]">
                      ● Active Route
                    </span>
                  ) : (
                    <span className="text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded-full text-[11px]">
                      ● Inactive
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 3: VEHICLES & LIVE TRACKING */}
      {!loading && activeSubTab === 'vehicles' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900">E-Rickshaw Fleet & Live IoT GPS Pings</h3>
              <p className="text-xs text-slate-500">
                Track drivers, speeds, coordinates, and test live GPS updates
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenAddVehicle}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Register New E-Rickshaw</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vehicles.map((veh) => (
              <div
                key={veh.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4 hover:shadow-md transition-shadow relative"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{veh.vehicle_number}</h4>
                      <p className="text-xs text-slate-500">
                        Driver: <strong>{veh.driver_name}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEditVehicle(veh)}
                      className="p-1 text-slate-400 hover:text-emerald-600 rounded"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteVehicle(veh.id, veh.vehicle_number)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Route Line:</span>
                    <span className="font-semibold text-slate-800">
                      {veh.route_name || 'Depot / Unassigned'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Live GPS Pin:</span>
                    <span className="font-mono text-[11px] font-semibold text-indigo-700">
                      {veh.current_latitude && veh.current_longitude
                        ? `${parseFloat(veh.current_latitude).toFixed(6)}, ${parseFloat(veh.current_longitude).toFixed(6)}`
                        : 'No signal'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Speed / Status:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-700">{veh.speed_kmh} km/h</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        veh.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : veh.status === 'CHARGING'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}>
                        {veh.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1 border-t border-slate-200">
                    <span>Last Ping:</span>
                    <span>{veh.last_ping ? new Date(veh.last_ping).toLocaleTimeString() : 'N/A'}</span>
                  </div>
                </div>

                {/* Simulate GPS Ping Button for Admin */}
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => handleSimulateGpsPing(veh)}
                    disabled={pingStatus[veh.id] === 'pinging'}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs transition-colors shadow-2xs"
                  >
                    <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                    <span>Simulate Real-time GPS Ping</span>
                  </button>
                  {pingStatus[veh.id] && (
                    <div className="text-[11px] text-center text-emerald-700 font-mono">
                      {pingStatus[veh.id]}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 4: HOW LIVE TRACKING WORKS EXPLANATION */}
      {!loading && activeSubTab === 'how_tracking_works' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 uppercase tracking-wider">
              Technical Architecture & Flow
            </span>
            <h3 className="text-xl font-bold text-slate-900 mt-2">
              How Live GPS Tracking Works in CampusXplore
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              Here is how e-rickshaws send their coordinates to the map in production vs demo mode.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="w-8 h-8 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center text-sm">
                1
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Hardware / Mobile Ping</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Each e-rickshaw has either an <strong>AIS-140 GPS device</strong> with a SIM card or the driver's phone with a Driver PWA app. Every 3–5 seconds, it queries the GPS satellite and sends an HTTP POST request to:
              </p>
              <code className="block bg-slate-900 text-amber-400 p-2 rounded text-[11px] font-mono">
                POST /api/transit/vehicles/{'{id}'}/update_location/<br />
                {JSON.stringify({ latitude: 31.2534, longitude: 75.7036, speed_kmh: 18 }, null, 0)}
              </code>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm">
                2
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Django Backend & PostgreSQL</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                The Django REST API view <code>update_location</code> validates the coordinates and updates the vehicle's row in PostgreSQL:
              </p>
              <ul className="text-xs text-slate-600 list-disc list-inside space-y-1">
                <li><code>current_latitude</code> & <code>current_longitude</code></li>
                <li><code>speed_kmh</code></li>
                <li><code>last_ping = timezone.now()</code></li>
              </ul>
              <p className="text-xs text-slate-500">
                Data persists in the database and is indexed for ultra-fast reads.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm">
                3
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Interactive Leaflet Map Display</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                The student's browser map automatically polls the <code>/api/transit/vehicles/</code> endpoint or receives smooth position interpolation along the route's waypoints.
              </p>
              <p className="text-xs text-slate-600 leading-relaxed">
                Passengers see the rickshaw icon glide smoothly along Jalandhar-Delhi G.T. Road and campus internal avenues with live arrival estimates (ETA).
              </p>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <Radio className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 space-y-1">
              <strong>Admin Testing Tip:</strong> You can test this right now without real hardware! Switch to the <strong>"E-Rickshaws & Tracking"</strong> tab above and click <strong>"Simulate Real-time GPS Ping"</strong>. The backend will update the coordinates in PostgreSQL and the map will reflect the new position immediately!
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <StopModal
        isOpen={isStopModalOpen}
        onClose={() => setIsStopModalOpen(false)}
        onSuccess={loadData}
        stop={editingStop}
        routes={routes}
        transitService={transitService}
      />

      <RouteModal
        isOpen={isRouteModalOpen}
        onClose={() => setIsRouteModalOpen(false)}
        onSuccess={loadData}
        route={editingRoute}
        transitService={transitService}
      />

      <VehicleModal
        isOpen={isVehicleModalOpen}
        onClose={() => setIsVehicleModalOpen(false)}
        onSuccess={loadData}
        vehicle={editingVehicle}
        routes={routes}
        transitService={transitService}
      />
    </div>
  );
}

