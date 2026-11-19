import React, { useState, useEffect } from 'react';
import { X, Truck, Navigation } from 'lucide-react';
import Button from '../common/Button';
import Alert from '../common/Alert';

export default function VehicleModal({
  isOpen,
  onClose,
  onSuccess,
  vehicle = null,
  routes = [],
  transitService,
}) {
  const isEditing = Boolean(vehicle);

  const [vehicleNumber, setVehicleNumber] = useState('');
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [routeId, setRouteId] = useState('');
  const [statusVal, setStatusVal] = useState('ACTIVE');
  const [speedKmh, setSpeedKmh] = useState('15');
  const [currentLat, setCurrentLat] = useState('31.253400');
  const [currentLng, setCurrentLng] = useState('75.703600');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (vehicle) {
      setVehicleNumber(vehicle.vehicle_number || '');
      setDriverName(vehicle.driver_name || '');
      setDriverPhone(vehicle.driver_phone || '');
      setRouteId(vehicle.route ? String(vehicle.route) : (routes[0]?.id ? String(routes[0].id) : ''));
      setStatusVal(vehicle.status || 'ACTIVE');
      setSpeedKmh(String(vehicle.speed_kmh || 15));
      setCurrentLat(vehicle.current_latitude !== null && vehicle.current_latitude !== undefined ? String(vehicle.current_latitude) : '31.253400');
      setCurrentLng(vehicle.current_longitude !== null && vehicle.current_longitude !== undefined ? String(vehicle.current_longitude) : '75.703600');
    } else {
      setVehicleNumber(`Rickshaw #${Math.floor(10 + Math.random() * 89)} (PB08-ER-${Math.floor(100 + Math.random() * 899)})`);
      setDriverName('');
      setDriverPhone('+91 98765 ');
      setRouteId(routes.length > 0 ? String(routes[0].id) : '');
      setStatusVal('ACTIVE');
      setSpeedKmh('15');
      setCurrentLat('31.253400');
      setCurrentLng('75.703600');
    }
    setError(null);
    setValidationErrors({});
  }, [vehicle, routes, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!vehicleNumber.trim()) errs.vehicleNumber = 'Vehicle number / ID is required.';
    if (!driverName.trim()) errs.driverName = 'Driver name is required.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setValidationErrors(errs);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload = {
      vehicle_number: vehicleNumber.trim(),
      driver_name: driverName.trim(),
      driver_phone: driverPhone.trim(),
      route: routeId ? parseInt(routeId, 10) : null,
      status: statusVal,
      speed_kmh: parseInt(speedKmh, 10) || 15,
      current_latitude: currentLat ? parseFloat(currentLat).toFixed(6) : null,
      current_longitude: currentLng ? parseFloat(currentLng).toFixed(6) : null,
    };

    try {
      if (isEditing) {
        await transitService.updateVehicle(vehicle.id, payload);
      } else {
        await transitService.createVehicle(payload);
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save E-Rickshaw vehicle record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden text-left">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-600 text-white rounded-lg">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {isEditing ? 'Edit E-Rickshaw Vehicle' : 'Register New E-Rickshaw'}
              </h2>
              <p className="text-xs text-slate-500">
                Assign driver, transit route, and operational GPS ping tracking
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <Alert type="error" message={error} />}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Vehicle Plate / Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                placeholder="e.g. Rickshaw #4 (PB08-ER-104)"
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
              {validationErrors.vehicleNumber && (
                <p className="mt-1 text-xs text-rose-600">{validationErrors.vehicleNumber}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Driver Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                placeholder="e.g. Gurpreet Singh"
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {validationErrors.driverName && (
                <p className="mt-1 text-xs text-rose-600">{validationErrors.driverName}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Driver Contact Phone
              </label>
              <input
                type="text"
                value={driverPhone}
                onChange={(e) => setDriverPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Assigned Route Line
              </label>
              <select
                value={routeId}
                onChange={(e) => setRouteId(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="">(Unassigned / Depot)</option>
                {routes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Fleet Status
              </label>
              <select
                value={statusVal}
                onChange={(e) => setStatusVal(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="ACTIVE">Active / On Duty</option>
                <option value="OFF_DUTY">Off Duty</option>
                <option value="CHARGING">Charging at Hub</option>
                <option value="MAINTENANCE">Under Maintenance</option>
              </select>
            </div>
          </div>

          {/* Current GPS Position */}
          <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-emerald-700" />
                Live GPS Position Coordinates
              </span>
              <span className="text-[10px] text-emerald-800">IoT Ping Target</span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Latitude</label>
                <input
                  type="text"
                  value={currentLat}
                  onChange={(e) => setCurrentLat(e.target.value)}
                  placeholder="31.253400"
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 font-mono bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Longitude</label>
                <input
                  type="text"
                  value={currentLng}
                  onChange={(e) => setCurrentLng(e.target.value)}
                  placeholder="75.703600"
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 font-mono bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Speed (km/h)</label>
                <input
                  type="number"
                  value={speedKmh}
                  onChange={(e) => setSpeedKmh(e.target.value)}
                  min="0"
                  max="45"
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : isEditing ? 'Update Vehicle' : 'Register Vehicle'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

