import React, { useState, useEffect } from 'react';
import { X, Navigation } from 'lucide-react';
import Button from '../common/Button';
import Alert from '../common/Alert';

export default function RouteModal({
  isOpen,
  onClose,
  onSuccess,
  route = null,
  transitService,
}) {
  const isEditing = Boolean(route);

  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('Line 1');
  const [color, setColor] = useState('#f59e0b');
  const [operatingHours, setOperatingHours] = useState('06:30 AM – 10:30 PM');
  const [frequency, setFrequency] = useState('Every 4–6 mins');
  const [fare, setFare] = useState('₹10 / Free with Student ID');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (route) {
      setName(route.name || '');
      setShortName(route.short_name || 'Line 1');
      setColor(route.color || '#f59e0b');
      setOperatingHours(route.operating_hours || '06:30 AM – 10:30 PM');
      setFrequency(route.frequency || 'Every 4–6 mins');
      setFare(route.fare || '₹10 / Free with Student ID');
      setDescription(route.description || '');
      setIsActive(route.is_active !== undefined ? route.is_active : true);
    } else {
      setName('');
      setShortName('Line 3');
      setColor('#3b82f6');
      setOperatingHours('07:00 AM – 09:30 PM');
      setFrequency('Every 5–8 mins');
      setFare('₹10 / Free with Student ID');
      setDescription('');
      setIsActive(true);
    }
    setError(null);
    setValidationErrors({});
  }, [route, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = 'Route name is required.';
    if (!shortName.trim()) errs.shortName = 'Short line label is required.';
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
      short_name: shortName.trim(),
      color: color.trim() || '#f59e0b',
      operating_hours: operatingHours.trim(),
      frequency: frequency.trim(),
      fare: fare.trim(),
      description: description.trim(),
      is_active: isActive,
    };

    try {
      if (isEditing) {
        await transitService.updateRoute(route.id, payload);
      } else {
        await transitService.createRoute(payload);
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save transit route.');
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
            <div
              className="p-2 rounded-lg text-white"
              style={{ backgroundColor: color || '#f59e0b' }}
            >
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {isEditing ? 'Edit Transit Route' : 'Add New Transit Route'}
              </h2>
              <p className="text-xs text-slate-500">
                Define internal campus lines, frequencies, and operating schedules
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Route Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Avenue Express (Line 1)"
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              {validationErrors.name && (
                <p className="mt-1 text-xs text-rose-600">{validationErrors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Short Code <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={shortName}
                onChange={(e) => setShortName(e.target.value)}
                placeholder="e.g. Line 1"
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Map Polyline Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-10 h-10 rounded border border-slate-300 cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm font-mono rounded-lg border border-slate-300 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Frequency / Interval
              </label>
              <input
                type="text"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                placeholder="e.g. Every 4–6 mins"
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Operating Hours
              </label>
              <input
                type="text"
                value={operatingHours}
                onChange={(e) => setOperatingHours(e.target.value)}
                placeholder="e.g. 06:30 AM – 10:30 PM"
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Fare / Pass Policy
              </label>
              <input
                type="text"
                value={fare}
                onChange={(e) => setFare(e.target.value)}
                placeholder="₹10 / Free with Student ID"
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Route Path Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Main Gate 1 ↔ UniMall ↔ CS Block 38 ↔ UniHospital"
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="is_active_route"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
            />
            <label htmlFor="is_active_route" className="text-xs font-medium text-slate-700 select-none">
              Active Route (Dispatched and plotted on campus map)
            </label>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : isEditing ? 'Update Route' : 'Create Route'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

