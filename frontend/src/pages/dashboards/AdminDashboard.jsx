import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Layers,
  AlertTriangle,
  Users,
  CheckCircle2,
  Clock,
  Truck,
  ShieldCheck,
  LayoutGrid,
  Calendar,
  Map as MapIcon,
  ArrowRight,
  Download,
  XCircle,
  TrendingUp,
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import facilityService from '../../services/facilityService';
import studentService from '../../services/studentService';
import reportService from '../../services/reportService';
import bookingService from '../../services/bookingService';
import Spinner from '../../components/common/Spinner';
import Badge from '../../components/common/Badge';
import FacilityManagementSection from '../../components/admin/FacilityManagementSection';
import CategoryManagementSection from '../../components/admin/CategoryManagementSection';
import StudentManagementSection from '../../components/admin/StudentManagementSection';
import ReportManagementSection from '../../components/reports/ReportManagementSection';
import TransitManagementSection from '../../components/admin/TransitManagementSection';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();

  // Metrics State
  const [totalFacilities, setTotalFacilities] = useState(0);
  const [totalCategories, setTotalCategories] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [pendingReports, setPendingReports] = useState(0);
  const [resolvedReports, setResolvedReports] = useState(0);
  const [bookings, setBookings] = useState([]);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Active Navigation Tab: 'overview' | 'facilities' | 'categories' | 'complaints' | 'students' | 'transit' | 'bookings'
  const [activeTab, setActiveTab] = useState('overview');

  const loadMetrics = useCallback(async () => {
    try {
      const [facData, catData, studentData, pendingData, resolvedData, bookingData] = await Promise.all([
        facilityService.getFacilities({ pageSize: 1 }),
        facilityService.getCategories(),
        studentService.getStudents({ pageSize: 1 }),
        reportService.getReports({ status: 'PENDING', pageSize: 1 }),
        reportService.getReports({ status: 'RESOLVED', pageSize: 1 }),
        bookingService.getBookings().catch(() => []),
      ]);

      setTotalFacilities(facData.count || 0);
      setTotalCategories(catData?.length || 0);
      setTotalStudents(studentData.count || 0);
      setPendingReports(pendingData.count || 0);
      setResolvedReports(resolvedData.count || 0);
      setBookings(Array.isArray(bookingData) ? bookingData : bookingData?.results || []);
    } catch (err) {
      console.error('Failed to load admin metrics:', err);
    } finally {
      setLoadingMetrics(false);
    }
  }, []);

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  const pendingBookings = bookings.filter((b) => b.status === 'PENDING');
  const totalDecisions = pendingReports + resolvedReports;
  const resolutionRate = totalDecisions > 0 ? Math.round((resolvedReports / totalDecisions) * 100) : 100;

  const handleBookingDecision = async (id, status) => {
    try {
      await bookingService.decideBooking(id, status);
      showToast(`Booking ${status.toLowerCase()} & user notified.`, 'success');
      loadMetrics();
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to update booking.', 'error');
    }
  };

  const handleExportFacilitiesCsv = async () => {
    setExporting(true);
    try {
      const data = await facilityService.getAllFacilities();
      const rows = data?.facilities || [];
      const header = ['ID', 'Name', 'Category', 'Building', 'Latitude', 'Longitude', 'Opening Hours', 'Contact', 'Active'];
      const csvLines = [
        header.join(','),
        ...rows.map((f) =>
          [
            f.id,
            `"${(f.name || '').replace(/"/g, '""')}"`,
            `"${(f.category?.name || '').replace(/"/g, '""')}"`,
            `"${(f.building || '').replace(/"/g, '""')}"`,
            f.latitude ?? '',
            f.longitude ?? '',
            `"${(f.opening_hours || '').replace(/"/g, '""')}"`,
            `"${(f.contact_number || '').replace(/"/g, '""')}"`,
            f.is_active ? 'Yes' : 'No',
          ].join(',')
        ),
      ];
      const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `campusxplore-facilities-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      showToast(`Exported ${rows.length} facilities to CSV.`, 'success');
    } catch {
      showToast('Failed to export facilities.', 'error');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left w-full">
      {/* Welcome Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0f1e3d] via-slate-900 to-slate-950 rounded-3xl p-6 sm:p-9 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute inset-0 bg-dot-grid opacity-25 pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/20 border border-orange-400/30 text-orange-200 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-orange-300" />
              System Administrator
            </span>
            <span className="text-xs text-slate-400 font-medium">Privileged Session</span>
          </div>
          <h1 className="font-display text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Administrator Command Center
          </h1>
          <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
            Signed in as <strong className="text-white">{user?.email}</strong>. Manage campus facilities, venue bookings, transit e-rickshaws, student accounts, and complaint resolutions.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportFacilitiesCsv}
            disabled={exporting}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/15 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm backdrop-blur-md transition-all cursor-pointer disabled:opacity-60"
          >
            <Download className="w-4 h-4 text-emerald-300" />
            <span>{exporting ? 'Exporting...' : 'Export CSV'}</span>
          </button>

          <Link
            to="/map"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-orange-500/25"
          >
            <MapIcon className="w-4 h-4" />
            <span>Open Live Map</span>
          </Link>
        </div>
      </div>

      {/* 6 KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div
          onClick={() => setActiveTab('facilities')}
          className={`bg-white dark:bg-slate-900 p-4 rounded-2xl border shadow-xs space-y-2 cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg ${
            activeTab === 'facilities' ? 'border-orange-400 ring-2 ring-orange-500/15' : 'border-slate-200/80 dark:border-slate-800 hover:border-orange-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Facilities</span>
            <Building2 className="w-4 h-4 text-orange-500" />
          </div>
          <div className="font-display text-2xl font-extrabold text-slate-900 dark:text-white">
            {loadingMetrics ? <Spinner size="sm" /> : totalFacilities}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Campus spots</p>
        </div>

        <div
          onClick={() => setActiveTab('categories')}
          className={`bg-white dark:bg-slate-900 p-4 rounded-2xl border shadow-xs space-y-2 cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg ${
            activeTab === 'categories' ? 'border-emerald-400 ring-2 ring-emerald-500/15' : 'border-slate-200/80 dark:border-slate-800 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Categories</span>
            <Layers className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="font-display text-2xl font-extrabold text-slate-900 dark:text-white">
            {loadingMetrics ? <Spinner size="sm" /> : totalCategories}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Taxonomies</p>
        </div>

        <div
          onClick={() => setActiveTab('students')}
          className={`bg-white dark:bg-slate-900 p-4 rounded-2xl border shadow-xs space-y-2 cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg ${
            activeTab === 'students' ? 'border-sky-400 ring-2 ring-sky-500/15' : 'border-slate-200/80 dark:border-slate-800 hover:border-sky-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Students</span>
            <Users className="w-4 h-4 text-sky-500" />
          </div>
          <div className="font-display text-2xl font-extrabold text-slate-900 dark:text-white">
            {loadingMetrics ? <Spinner size="sm" /> : totalStudents}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Registered</p>
        </div>

        <div
          onClick={() => setActiveTab('complaints')}
          className={`bg-white dark:bg-slate-900 p-4 rounded-2xl border shadow-xs space-y-2 cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg ${
            activeTab === 'complaints' ? 'border-amber-400 ring-2 ring-amber-500/15' : 'border-slate-200/80 dark:border-slate-800 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Pending Issues</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="font-display text-2xl font-extrabold text-amber-600">
            {loadingMetrics ? <Spinner size="sm" /> : pendingReports}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Needs triage</p>
        </div>

        <div
          onClick={() => setActiveTab('complaints')}
          className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2 cursor-pointer hover:border-emerald-300 hover:-translate-y-0.5 hover:shadow-lg transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="font-display text-2xl font-extrabold text-emerald-600">
            {loadingMetrics ? <Spinner size="sm" /> : resolvedReports}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">{resolutionRate}% rate</p>
        </div>

        <div
          onClick={() => setActiveTab('bookings')}
          className={`bg-white dark:bg-slate-900 p-4 rounded-2xl border shadow-xs space-y-2 cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg ${
            activeTab === 'bookings' ? 'border-purple-400 ring-2 ring-purple-500/15' : 'border-slate-200/80 dark:border-slate-800 hover:border-purple-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Bookings</span>
            <Calendar className="w-4 h-4 text-purple-500" />
          </div>
          <div className="font-display text-2xl font-extrabold text-purple-600 dark:text-purple-400">
            {loadingMetrics ? <Spinner size="sm" /> : pendingBookings.length}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Pending approval</p>
        </div>
      </div>

      {/* Pill Navigation Tabs */}
      <div className="bg-white/80 dark:bg-slate-900/90 backdrop-blur-sm p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-1 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-gradient-to-r from-[#0f1e3d] to-slate-800 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800'
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          <span>Portal Overview</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('facilities')}
          className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'facilities'
              ? 'bg-orange-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Facilities</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('bookings')}
          className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'bookings'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Bookings</span>
          {pendingBookings.length > 0 && (
            <span className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeTab === 'bookings' ? 'bg-white/25 text-white' : 'bg-purple-100 text-purple-800'
            }`}>
              {pendingBookings.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'categories'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Categories</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('complaints')}
          className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'complaints'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Complaints</span>
          {pendingReports > 0 && (
            <span className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeTab === 'complaints' ? 'bg-white/25 text-white' : 'bg-amber-100 text-amber-800'
            }`}>
              {pendingReports}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('students')}
          className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'students'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Students</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('transit')}
          className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'transit'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Transit &amp; E-Rickshaws</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Operations Analytics & Pending Approvals Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Resolution Health Card */}
              <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    Issue Resolution Health
                  </span>
                  <span className="text-lg font-extrabold text-emerald-600">{resolutionRate}%</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                    style={{ width: `${resolutionRate}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  <strong className="text-slate-800 dark:text-white">{resolvedReports}</strong> resolved out of{' '}
                  <strong className="text-slate-800 dark:text-white">{totalDecisions}</strong> tracked maintenance tickets.
                </p>
              </div>

              {/* Pending Bookings Quick Queue */}
              <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-purple-500" />
                    Pending Venue Booking Approvals ({pendingBookings.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('bookings')}
                    className="text-xs font-semibold text-orange-600 hover:text-orange-700 cursor-pointer"
                  >
                    View all →
                  </button>
                </div>

                {pendingBookings.length === 0 ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400 py-3">
                    No pending booking requests right now.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {pendingBookings.slice(0, 3).map((b) => (
                      <div
                        key={b.id}
                        className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-800 text-xs"
                      >
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 dark:text-white truncate">{b.title}</div>
                          <div className="text-slate-500 dark:text-slate-400 truncate">
                            {b.facility_detail?.name} • {b.date} ({b.start_time?.slice(0, 5)}–{b.end_time?.slice(0, 5)})
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleBookingDecision(b.id, 'APPROVED')}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => handleBookingDecision(b.id, 'REJECTED')}
                            className="px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick-Launch Control Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <button
                type="button"
                onClick={() => setActiveTab('facilities')}
                className="group text-left bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-xl hover:-translate-y-0.5 hover:border-orange-300 transition-all space-y-3 cursor-pointer"
              >
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-md">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">Facility Management</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Add, edit, or deactivate campus buildings, blocks, and GPS coordinates.</p>
                </div>
                <span className="inline-flex items-center text-xs font-semibold text-orange-600">
                  Open Facilities <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('transit')}
                className="group text-left bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-xl hover:-translate-y-0.5 hover:border-amber-300 transition-all space-y-3 cursor-pointer"
              >
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">Transit &amp; E-Rickshaws</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Manage routes, ordered stops, live vehicles, emergency posts, and fleet simulation.</p>
                </div>
                <span className="inline-flex items-center text-xs font-semibold text-amber-600">
                  Open Transit Controls <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('complaints')}
                className="group text-left bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-xl hover:-translate-y-0.5 hover:border-rose-300 transition-all space-y-3 cursor-pointer"
              >
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center text-white shadow-md">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">Complaint Management</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Triage, update statuses, and resolve campus maintenance issue reports.</p>
                </div>
                <span className="inline-flex items-center text-xs font-semibold text-rose-600">
                  Open Reports ({pendingReports} pending) <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('bookings')}
                className="group text-left bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-xl hover:-translate-y-0.5 hover:border-purple-300 transition-all space-y-3 cursor-pointer"
              >
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white shadow-md">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">Venue Bookings</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Approve or reject auditorium, lab, and sports facility booking requests.</p>
                </div>
                <span className="inline-flex items-center text-xs font-semibold text-purple-600">
                  Manage Bookings ({pendingBookings.length} pending) <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('students')}
                className="group text-left bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-xl hover:-translate-y-0.5 hover:border-sky-300 transition-all space-y-3 cursor-pointer"
              >
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-md">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">Student Directory</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">View registered student accounts and their submitted report counts.</p>
                </div>
                <span className="inline-flex items-center text-xs font-semibold text-sky-600">
                  View Students ({totalStudents}) <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>

              <Link
                to="/map"
                className="group text-left bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-xl hover:-translate-y-0.5 hover:border-indigo-300 transition-all space-y-3 block"
              >
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#0f1e3d] to-slate-700 flex items-center justify-center text-white shadow-md">
                  <MapIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">Live Campus Map</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Inspect all markers, live e-rickshaw routes, and Emergency SOS fast-paths.</p>
                </div>
                <span className="inline-flex items-center text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Open Map <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </div>
          </div>
        )}

        {activeTab === 'facilities' && (
          <FacilityManagementSection onMetricUpdate={loadMetrics} />
        )}

        {activeTab === 'bookings' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                  Venue &amp; Hall Booking Requests
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Review all campus facility reservations and approve or reject pending requests.
                </p>
              </div>
              <Link
                to="/bookings"
                className="text-xs font-semibold text-orange-600 hover:text-orange-700"
              >
                Open Full Bookings Page →
              </Link>
            </div>

            {bookings.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 py-8 text-center">
                No venue bookings found.
              </p>
            ) : (
              <div className="space-y-3">
                {bookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant={
                            b.status === 'APPROVED'
                              ? 'success'
                              : b.status === 'PENDING'
                              ? 'warning'
                              : b.status === 'REJECTED'
                              ? 'danger'
                              : 'default'
                          }
                          size="xs"
                        >
                          {b.status}
                        </Badge>
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                          {b.facility_detail?.name} ({b.facility_detail?.building})
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{b.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {b.date} • {b.start_time?.slice(0, 5)} – {b.end_time?.slice(0, 5)} • Requested by {b.user_name}
                      </p>
                    </div>

                    {b.status === 'PENDING' && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleBookingDecision(b.id, 'APPROVED')}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => handleBookingDecision(b.id, 'REJECTED')}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'categories' && (
          <CategoryManagementSection onMetricUpdate={loadMetrics} />
        )}

        {activeTab === 'complaints' && (
          <div id="admin-reports-management">
            <ReportManagementSection
              role="ADMIN"
              title="Campus Issue Reports & Incident Management"
              description="Master administrator control center to inspect, filter, search, transition operational statuses, or permanently delete issue reports across all university facilities."
            />
          </div>
        )}

        {activeTab === 'students' && (
          <StudentManagementSection />
        )}

        {activeTab === 'transit' && (
          <TransitManagementSection />
        )}
      </div>
    </div>
  );
}
