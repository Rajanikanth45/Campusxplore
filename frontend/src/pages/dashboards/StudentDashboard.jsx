import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Compass, ArrowRight, BookOpen, AlertTriangle, MapPin, Sparkles } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import facilityService from '../../services/facilityService';
import Badge from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    facilityService.getFacilities({ pageSize: 3 })
      .then((facData) => {
        if (isMounted) {
          setFacilities(facData.results || []);
        }
      })
      .catch((err) => {
        console.error('Failed to load dashboard data:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left w-full">
      {/* Welcome Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950 rounded-3xl p-6 sm:p-9 border border-indigo-500/20 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute inset-0 bg-dot-grid opacity-30 pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              Student Portal
            </span>
            <span className="text-xs text-slate-300 font-medium">Academic Session</span>
          </div>
          <h1 className="font-display text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Welcome, {user?.first_name || 'Student'}!
          </h1>
          <p className="text-sm text-indigo-100/80 max-w-xl leading-relaxed">
            Explore facilities, track live campus e-rickshaws, navigate blocks, and manage your reported issues at Lovely Professional University.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <Link
            to="/reports"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/15 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-semibold text-sm transition-all"
          >
            <AlertTriangle className="w-4 h-4 text-amber-300" />
            <span>My Reported Issues</span>
          </Link>

          <Link
            to="/facilities"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-indigo-50 text-indigo-950 font-semibold text-sm transition-all shadow-lg shadow-black/20"
          >
            <Building2 className="w-4 h-4 text-indigo-600" />
            <span>Browse Facilities</span>
          </Link>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Link
          to="/facilities"
          className="group bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-xl hover:shadow-orange-500/5 hover:-translate-y-0.5 hover:border-orange-200 dark:hover:border-orange-700 transition-all space-y-3 block"
        >
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-md shadow-orange-500/25 group-hover:scale-105 transition-transform">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
              Campus Facilities
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
              Locate lecture halls, laboratories, food courts, and campus study spaces.
            </p>
          </div>
          <div className="inline-flex items-center text-xs font-semibold text-orange-600 dark:text-orange-400 pt-1">
            <span>View all directory</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          to="/map"
          className="group bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-xl hover:shadow-sky-500/5 hover:-translate-y-0.5 hover:border-sky-200 dark:hover:border-sky-700 transition-all space-y-3 block"
        >
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#0f1e3d] to-sky-700 flex items-center justify-center text-white shadow-md shadow-sky-500/25 group-hover:scale-105 transition-transform">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
              Interactive Map &amp; Shuttles
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
              Live GPS walking routes, e-rickshaw stops, and one-tap Emergency SOS navigation.
            </p>
          </div>
          <div className="inline-flex items-center text-xs font-semibold text-sky-600 dark:text-sky-400 pt-1">
            <span>Explore Campus Map</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          to="/reports"
          className="group bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-xl hover:shadow-amber-500/5 hover:-translate-y-0.5 hover:border-amber-200 dark:hover:border-amber-700 transition-all space-y-3 block"
        >
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md shadow-amber-500/25 group-hover:scale-105 transition-transform">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
              Reported Issues
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
              Track status updates, inspection progress, and resolution history for your reports.
            </p>
          </div>
          <div className="inline-flex items-center text-xs font-semibold text-amber-600 dark:text-amber-400 pt-1">
            <span>View my reports</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      {/* Featured Campus Facilities Preview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-orange-500" />
            <span>Featured Campus Spots</span>
          </h2>
          <Link
            to="/facilities"
            className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
          >
            <span>See full list</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-10 flex justify-center">
            <Spinner size="md" />
          </div>
        ) : facilities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {facilities.map((facility) => (
              <Link
                key={facility.id}
                to={`/facilities/${facility.id}`}
                className="group bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-lg hover:-translate-y-0.5 hover:border-orange-200 dark:hover:border-orange-700 transition-all space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-semibold text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-950/50 border border-orange-100 dark:border-orange-800/60 px-2.5 py-0.5 rounded-full">
                      {facility.category?.name || 'Campus Spot'}
                    </span>
                    <Badge variant="success" size="xs">Active</Badge>
                  </div>
                  <h4 className="font-display font-bold text-slate-900 dark:text-white text-base group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                    {facility.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-orange-500" />
                    {facility.building}
                  </p>
                </div>
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 group-hover:text-orange-600 inline-flex items-center pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span>View location details</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500 py-4">No facilities registered yet.</p>
        )}
      </div>
    </div>
  );
}
