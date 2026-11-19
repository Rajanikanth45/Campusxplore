import React, { useState, useEffect } from 'react';
import { X, MapPin } from 'lucide-react';
import Button from '../common/Button';
import Alert from '../common/Alert';

export default function StopModal({
  isOpen,
  onClose,
  onSuccess,
  stop = null,
  routes = [],
  transitService,
}) {
  const isEditing = Boolean(stop);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [routeId, setRouteId] = useState('');
  const [order, setOrder] = useState('1');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [intervalText, setIntervalText] = useState('Next in ~4 min');
  const [landmark, setLandmark] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (stop) {
      setName(stop.name || '');
      setCode(stop.code || '');
      setRouteId(stop.route ? String(stop.route) : (routes[0]?.id ? String(routes[0].id) : ''));
      setOrder(stop.order !== undefined && stop.order !== null ? String(stop.order) : '1');
      setLatitude(stop.latitude !== null && stop.latitude !== undefined ? String(stop.latitude) : '');
      setLongitude(stop.longitude !== null && stop.longitude !== undefined ? String(stop.longitude) : '');
      setIntervalText(stop.interval_text || 'Next in ~4 min');
      setLandmark(stop.landmark || '');
      setIsActive(stop.is_active !== undefined ? stop.is_active : true);
    } else {
      setName('');
      setCode(`STOP-${Math.floor(100 + Math.random() * 900)}`);
      setRouteId(routes.length > 0 ? String(routes[0].id) : '');
      setOrder(String((routes[0]?.stops_count || 0) + 1));
      setLatitude('31.253400');
      setLongitude('75.703600');
      setIntervalText('Next in ~4 min');
      setLandmark('');
      setIsActive(true);
    }
    setError(null);
    setValidationErrors({});
  }, [stop, routes, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = 'Stop name is required.';
    if (!code.trim()) errs.code = 'Stop code is required.';
    if (!latitude || isNaN(Number(latitude))) errs.latitude = 'Valid latitude coordinate is required (e.g. 31.253400).';
    if (!longitude || isNaN(Number(longitude))) errs.longitude = 'Valid longitude coordinate is required (e.g. 75.703600).';
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
      name: name.trim(),
      code: code.trim(),
      route: routeId ? parseInt(routeId, 10) : null,
      order: parseInt(order, 10) || 1,
      latitude: parseFloat(latitude).toFixed(6),
      longitude: parseFloat(longitude).toFixed(6),
      interval_text: intervalText.trim() || 'Next in ~4 min',
      landmark: landmark.trim(),
      is_active: isActive,
    };

    try {
      if (isEditing) {
        await transitService.updateStop(stop.id, payload);
      } else {
        await transitService.createStop(payload);
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      const serverErr = err.response?.data;
      if (typeof serverErr === 'object') {
        const fieldErrors = {};
        Object.entries(serverErr).forEach(([k, v]) => {
          fieldErrors[k] = Array.isArray(v) ? v[0] : String(v);
        });
        setValidationErrors(fieldErrors);
        setError('Please review the form errors below.');
      } else {
        setError(err.response?.data?.detail || 'Failed to save E-Rickshaw stop.');
      }
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
            <div className="p-2 bg-amber-500 text-white rounded-lg">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {isEditing ? 'Edit E-Rickshaw Stop' : 'Add New E-Rickshaw Stop'}
              </h2>
              <p className="text-xs text-slate-500">
                Designate campus pickup bay coordinates & line assignment
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
                Stop Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. UniMall & Central Plaza Hub"
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
              {validationErrors.name && (
                <p className="mt-1 text-xs text-rose-600">{validationErrors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Stop Code <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. STOP-UM"
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
              />
              {validationErrors.code && (
                <p className="mt-1 text-xs text-rose-600">{validationErrors.code}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Assigned Route Line
              </label>
              <select
                value={routeId}
                onChange={(e) => setRouteId(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
              >
                <option value="">(No specific route)</option>
                {routes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Stop Sequence / Order in Route Line (1, 2, 3...)
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={order}
                onChange={(e) => setOrder(e.target.value)}
                placeholder="1"
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <p className="mt-1 text-[11px] text-slate-500">
                Determines the order in which the route line connects the stops.
              </p>
            </div>
          </div>

          {/* GPS Coordinates */}
          <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-600" />
                Stop GPS Coordinates (Leaflet Map Pin)
              </span>
              <span className="text-[10px] text-amber-800 font-medium">LPU Campus Zone</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                  Latitude <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="31.253400"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                />
                {validationErrors.latitude && (
                  <p className="mt-1 text-[11px] text-rose-600">{validationErrors.latitude}</p>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                  Longitude <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="75.703600"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                />
                {validationErrors.longitude && (
                  <p className="mt-1 text-[11px] text-rose-600">{validationErrors.longitude}</p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Estimated Interval / Frequency
              </label>
              <input
                type="text"
                value={intervalText}
                onChange={(e) => setIntervalText(e.target.value)}
                placeholder="Next in ~4 min"
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Landmark / Pillar / Bay
              </label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="e.g. Near Block 38 East Porch"
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="is_active_stop"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
            />
            <label htmlFor="is_active_stop" className="text-xs font-medium text-slate-700 select-none">
              Active Stop (Visible on campus passenger map & ETA boards)
            </label>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : isEditing ? 'Update Stop' : 'Create Stop'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

