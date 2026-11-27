import React, { useEffect, useState, useCallback } from 'react';
import { Calendar, Clock, Building2, Plus, XCircle, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import bookingService from '../services/bookingService';
import facilityService from '../services/facilityService';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Badge from '../components/common/Badge';
import Alert from '../components/common/Alert';

const STATUS_BADGE = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
  CANCELLED: 'default',
};

export default function BookingsPage() {
  const { user } = useAuth();
  const canDecide = user?.role === 'FACULTY' || user?.role === 'ADMIN';

  const [bookings, setBookings] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    facility: '',
    title: '',
    purpose: '',
    date: new Date().toISOString().split('T')[0],
    start_time: '10:00',
    end_time: '11:00',
  });
  const [bookedSlots, setBookedSlots] = useState([]);

  useEffect(() => {
    if (!form.facility || !form.date) {
      setBookedSlots([]);
      return;
    }
    let active = true;
    bookingService
      .getBookedSlots(form.facility, form.date)
      .then((slots) => {
        if (active) setBookedSlots(Array.isArray(slots) ? slots : []);
      })
      .catch(() => {
        if (active) setBookedSlots([]);
      });
    return () => {
      active = false;
    };
  }, [form.facility, form.date, bookings]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [bData, fData] = await Promise.all([
        bookingService.getBookings(),
        facilityService.getAllFacilities(),
      ]);
      setBookings(Array.isArray(bData) ? bData : bData?.results || []);
      setFacilities(fData?.facilities || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load venue bookings.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMsg(null);

    if (!form.facility || !form.title.trim() || !form.date || !form.start_time || !form.end_time) {
      setFormError('Please fill in all required booking fields.');
      return;
    }

    setSubmitting(true);
    try {
      await bookingService.createBooking({
        facility: Number(form.facility),
        title: form.title.trim(),
        purpose: form.purpose.trim(),
        date: form.date,
        start_time: form.start_time,
        end_time: form.end_time,
      });
      setSuccessMsg('Booking request submitted! Slot reserved pending approval.');
      setForm((prev) => ({ ...prev, title: '', purpose: '' }));
      loadData();
    } catch (err) {
      const data = err.response?.data;
      const msg =
        data?.non_field_errors?.[0] ||
        data?.date?.[0] ||
        data?.end_time?.[0] ||
        data?.facility?.[0] ||
        data?.detail ||
        'Could not create booking. Check for time slot conflicts.';
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id) => {
    try {
      await bookingService.cancelBooking(id);
      setSuccessMsg('Booking cancelled.');
      loadData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to cancel booking.');
    }
  };

  const handleDecide = async (id, status) => {
    try {
      await bookingService.decideBooking(id, status);
      setSuccessMsg(`Booking ${status.toLowerCase()}.`);
      loadData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update booking.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left w-full">
      <div className="space-y-1">
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Campus Venue & Hall Bookings
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Reserve seminar halls, labs, and sports courts with automatic time-slot conflict detection.
        </p>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      {successMsg && <Alert type="success" message={successMsg} onClose={() => setSuccessMsg(null)} />}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Create Booking Form */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4 self-start"
        >
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Plus className="w-5 h-5 text-orange-500" />
            <span>Request a Venue Slot</span>
          </h2>

          {formError && <Alert type="error" message={formError} onClose={() => setFormError(null)} />}

          <div className="space-y-1.5">
            <label htmlFor="booking-facility" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Facility / Venue <span className="text-rose-500">*</span>
            </label>
            <select
              id="booking-facility"
              value={form.facility}
              onChange={(e) => setForm({ ...form, facility: e.target.value })}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-orange-500"
              required
            >
              <option value="">Select a facility...</option>
              {facilities.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.building})
                </option>
              ))}
            </select>
          </div>

          <Input
            id="booking-title"
            label="Event / Session Title"
            placeholder="e.g. Robotics Club Workshop"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              id="booking-date"
              type="date"
              label="Date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />
            <Input
              id="booking-start"
              type="time"
              label="Start"
              value={form.start_time}
              onChange={(e) => setForm({ ...form, start_time: e.target.value })}
              required
            />
            <Input
              id="booking-end"
              type="time"
              label="End"
              value={form.end_time}
              onChange={(e) => setForm({ ...form, end_time: e.target.value })}
              required
            />
          </div>

          {/* Available / Occupied Slots Preview */}
          {form.facility && form.date && (
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 p-3 space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Already Booked on {form.date}
              </span>
              {bookedSlots.length === 0 ? (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  All time slots are currently open!
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {bookedSlots.map((s) => (
                    <span
                      key={s.id}
                      className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                    >
                      {s.start_time?.slice(0, 5)} – {s.end_time?.slice(0, 5)} ({s.status})
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="booking-purpose" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Purpose / Notes
            </label>
            <textarea
              id="booking-purpose"
              rows={2}
              value={form.purpose}
              onChange={(e) => setForm({ ...form, purpose: e.target.value })}
              placeholder="Expected attendees, equipment needed..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <Button type="submit" variant="primary" isLoading={submitting} icon={Calendar} className="w-full">
            Submit Booking Request
          </Button>
        </form>

        {/* Bookings List */}
        <div className="lg:col-span-7 space-y-4">
          {loading ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-10 flex items-center justify-center gap-2 text-slate-500">
              <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
              <span className="text-sm">Loading bookings...</span>
            </div>
          ) : bookings.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-10 text-center space-y-2">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="font-display font-bold text-slate-800 dark:text-white">No Bookings Yet</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Use the form to reserve a campus hall, lab, or sports facility.
              </p>
            </div>
          ) : (
            bookings.map((b) => (
              <div
                key={b.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={STATUS_BADGE[b.status] || 'default'} size="xs">
                      {b.status}
                    </Badge>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-orange-500" />
                      {b.facility_detail?.name} ({b.facility_detail?.building})
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-slate-900 dark:text-white text-base">
                    {b.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> {b.date}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {b.start_time?.slice(0, 5)} – {b.end_time?.slice(0, 5)}
                    </span>
                    {canDecide && <span>By: {b.user_name}</span>}
                  </div>
                  {b.purpose && <p className="text-xs text-slate-600 dark:text-slate-400">{b.purpose}</p>}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {canDecide && b.status === 'PENDING' && (
                    <>
                      <Button size="sm" variant="primary" icon={CheckCircle2} onClick={() => handleDecide(b.id, 'APPROVED')}>
                        Approve
                      </Button>
                      <Button size="sm" variant="danger" icon={AlertTriangle} onClick={() => handleDecide(b.id, 'REJECTED')}>
                        Reject
                      </Button>
                    </>
                  )}
                  {(b.status === 'PENDING' || b.status === 'APPROVED') && (
                    <Button size="sm" variant="secondary" icon={XCircle} onClick={() => handleCancel(b.id)}>
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
