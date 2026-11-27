import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, GraduationCap, ArrowRight, Layers, AlertTriangle, Sparkles } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import facilityService from '../../services/facilityService';
import Badge from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';
import ReportManagementSection from '../../components/reports/ReportManagementSection';

export default function FacultyDashboard() {
  const { user } = useAuth();
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    facilityService
      .getFacilities({ pageSize: 4 })
      .then((data) => {
        if (isMounted) {
          setFacilities(data.results || []);
        }
      })
      .catch((err) => {
        console.error('Failed to load faculty facilities:', err);
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
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-950 to-indigo-950 rounded-3xl p-6 sm:p-9 border border-purple-500/20 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute inset-0 bg-dot-grid opacity-30 pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-200 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-purple-300" />
              Faculty Portal
            </span>
            <span className="text-xs text-slate-300 font-medium">University Staff</span>
          </div>
          <h1 className="font-display text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Welcome, Professor {user?.first_name || user?.email}!
          </h1>
          <p className="text-sm text-purple-100/80 max-w-xl leading-relaxed">
            Access departmental buildings, academic lecture halls, and oversee campus maintenance operations.
          </p>
        </div>

        <Link
          to="/facilities"
          className="relative z-10 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-purple-50 text-purple-950 font-semibold text-sm transition-all shadow-lg shadow-black/20 self-start md:self-auto"
        >
          <Building2 className="w-4 h-4 text-purple-600" />
          <span>Campus Directory</span>
        </Link>
      </div>

      {/* Quick Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <Link
          to="/facilities?category=Academic"
          className="group bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:shadow-purple-500/5 hover:-translate-y-0.5 hover:border-purple-200 transition-all space-y-3 block"
        >
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/25 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
              Academic Facilities
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mt-1">
              Quickly locate department blocks, faculty lounges, and examination halls.
            </p>
          </div>
          <div className="inline-flex items-center text-xs font-semibold text-purple-600 pt-1">
            <span>Filter academic blocks</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          to="/facilities"
          className="group bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-0.5 hover:border-indigo-200 transition-all space-y-3 block"
        >
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
              Campus Infrastructure
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mt-1">
              Browse verified campus blocks with coordinate metadata and contact details.
            </p>
          </div>
          <div className="inline-flex items-center text-xs font-semibold text-indigo-600 pt-1">
            <span>All facilities</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <a
          href="#reports-management"
          className="group bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:shadow-amber-500/5 hover:-translate-y-0.5 hover:border-amber-200 transition-all space-y-3 block sm:col-span-2 lg:col-span-1"
        >
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md shadow-amber-500/25 group-hover:scale-105 transition-transform">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
              Facility Operations
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mt-1">
              Review reported maintenance issues, inspect tickets, and dispatch repairs.
            </p>
          </div>
          <div className="inline-flex items-center text-xs font-semibold text-amber-600 pt-1">
            <span>Manage reports</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </a>
      </div>

      {/* Campus Issue Reports Management Section */}
      <div id="reports-management">
        <ReportManagementSection
          role="FACULTY"
          title="Campus Issue Reports Management"
          description="Inspect submitted campus reports across all university facilities, review reported details, and update operational status."
        />
      </div>

      {/* Facilities Preview */}
      <div className="space-y-4">
        <h2 className="font-display text-lg font-bold text-slate-900">Campus Infrastructure Directory</h2>
        {loading ? (
          <div className="py-8 flex justify-center">
            <Spinner size="md" />
          </div>
        ) : facilities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {facilities.map((facility) => (
              <Link
                key={facility.id}
                to={`/facilities/${facility.id}`}
                className="group bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-lg hover:-translate-y-0.5 hover:border-indigo-200 transition-all space-y-2 flex flex-col justify-between"
              >
                <div>
                  <Badge variant="primary" size="xs">
                    {facility.category?.name || 'Facility'}
                  </Badge>
                  <h4 className="font-display font-bold text-slate-900 text-sm mt-2 group-hover:text-indigo-700 transition-colors">
                    {facility.name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">{facility.building}</p>
                </div>
                <span className="text-xs font-semibold text-purple-600 group-hover:text-purple-700 pt-2 border-t border-slate-100 inline-flex items-center">
                  <span>Inspect</span>
                  <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No facilities available.</p>
        )}
      </div>
    </div>
  );
}
