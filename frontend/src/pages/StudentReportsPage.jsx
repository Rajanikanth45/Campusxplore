import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  AlertTriangle,
  Building2,
  Clock,
  Filter,
  Search,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Plus,
  ArrowUpRight,
  Layers,
  Wrench,
  Droplets,
  Zap,
  Sparkles,
  HelpCircle,
  FileText,
} from 'lucide-react';
import reportService from '../services/reportService';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import Alert from '../components/common/Alert';
import { formatDate } from '../utils/formatters';

const STATUS_FILTERS = [
  { key: '', label: 'All Reports' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'IN_PROGRESS', label: 'In Progress' },
  { key: 'RESOLVED', label: 'Resolved' },
  { key: 'REJECTED', label: 'Rejected' },
];

const ISSUE_TYPE_META = {
  MAINTENANCE: { label: 'Maintenance', icon: Wrench, bg: 'from-amber-500/15 to-orange-500/5', text: 'text-amber-600 dark:text-amber-400', ring: 'border-amber-200/70 dark:border-amber-800/50' },
  CLEANLINESS: { label: 'Cleanliness', icon: Sparkles, bg: 'from-emerald-500/15 to-teal-500/5', text: 'text-emerald-600 dark:text-emerald-400', ring: 'border-emerald-200/70 dark:border-emerald-800/50' },
  WATER: { label: 'Water & Plumbing', icon: Droplets, bg: 'from-sky-500/15 to-blue-500/5', text: 'text-sky-600 dark:text-sky-400', ring: 'border-sky-200/70 dark:border-sky-800/50' },
  ELECTRICAL: { label: 'Electrical', icon: Zap, bg: 'from-purple-500/15 to-violet-500/5', text: 'text-purple-600 dark:text-purple-400', ring: 'border-purple-200/70 dark:border-purple-800/50' },
  EQUIPMENT: { label: 'Equipment', icon: Layers, bg: 'from-orange-500/15 to-amber-500/5', text: 'text-orange-600 dark:text-orange-400', ring: 'border-orange-200/70 dark:border-orange-800/50' },
  OTHER: { label: 'Other Concern', icon: HelpCircle, bg: 'from-slate-500/15 to-slate-400/5', text: 'text-slate-600 dark:text-slate-300', ring: 'border-slate-200/80 dark:border-slate-700' },
};

const STATUS_BADGE_META = {
  PENDING: { label: 'Pending Review', variant: 'warning' },
  IN_PROGRESS: { label: 'In Progress', variant: 'primary' },
  RESOLVED: { label: 'Resolved', variant: 'success' },
  REJECTED: { label: 'Rejected', variant: 'danger' },
};

const PAGE_SIZE = 6;

export default function StudentReportsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const statusFilter = searchParams.get('status') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const searchKeyword = searchParams.get('search') || '';

  const [searchInput, setSearchInput] = useState(searchKeyword);
  const [prevSearchKeyword, setPrevSearchKeyword] = useState(searchKeyword);
  const [reports, setReports] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  if (prevSearchKeyword !== searchKeyword) {
    setPrevSearchKeyword(searchKeyword);
    setSearchInput(searchKeyword);
  }

  const updateQuery = useCallback(
    (newParams) => {
      setIsLoading(true);
      const updated = new URLSearchParams(searchParams);
      Object.entries(newParams).forEach(([key, val]) => {
        if (val === null || val === undefined || val === '') {
          updated.delete(key);
        } else {
          updated.set(key, String(val));
        }
      });
      setSearchParams(updated);
    },
    [searchParams, setSearchParams]
  );

  useEffect(() => {
    let isMounted = true;
    const params = { page: currentPage, page_size: PAGE_SIZE };
    if (statusFilter) params.status = statusFilter;
    if (searchKeyword.trim()) params.search = searchKeyword.trim();

    reportService
      .getReports(params)
      .then((data) => {
        if (!isMounted) return;
        setReports(data.results || []);
        setTotalCount(data.count || 0);
        setError(null);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Failed to fetch reports:', err);
        setError(
          err.response?.data?.detail ||
            'Unable to load your issue reports. Please check your connectivity and try again.'
        );
        setReports([]);
        setTotalCount(0);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentPage, statusFilter, searchKeyword]);

  const handleStatusChange = (status) => updateQuery({ status, page: 1 });
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateQuery({ search: searchInput.trim(), page: 1 });
  };
  const handleResetFilters = () => {
    setSearchInput('');
    setSearchParams(new URLSearchParams());
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE) || 1;
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (statusFilter) count++;
    if (searchKeyword) count++;
    return count;
  }, [statusFilter, searchKeyword]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-left w-full">
      {/* LPU Navy + Orange Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f1e3d] via-slate-900 to-slate-950 p-6 sm:p-8 border border-slate-800 shadow-xl text-white flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="absolute inset-0 bg-dot-grid opacity-25 pointer-events-none" />
        <div className="relative z-10 space-y-1.5">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-orange-500/20 border border-orange-400/30 text-orange-300 text-[11px] font-bold uppercase tracking-wider">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Campus Issue Tracker</span>
          </div>
          <h1 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight">
            My Reported Issues
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl">
            Track real-time status updates, review maintenance tickets, and monitor resolution progress across campus.
          </p>
        </div>

        <Link
          to="/reports/new"
          className="relative z-10 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-sm transition-all shadow-lg shadow-orange-500/25 shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Report New Issue</span>
        </Link>
      </div>

      {error && (
        <Alert
          type="error"
          title="Error Loading Reports"
          message={error}
          onClose={() => setError(null)}
        />
      )}

      {/* Unified Search & Status Filter Bar */}
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm p-4 sm:p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2 max-w-lg">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search by issue title or facility..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-orange-500 focus:bg-white dark:focus:bg-slate-800"
              />
            </div>
            <Button type="submit" variant="primary" size="sm">
              Search
            </Button>
          </form>

          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              icon={RotateCcw}
              className="text-xs text-slate-500 dark:text-slate-400 shrink-0 self-start md:self-auto"
            >
              Reset ({activeFiltersCount})
            </Button>
          )}
        </div>

        {/* Status Filter Pills */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Status:</span>
          </span>

          {STATUS_FILTERS.map((f) => {
            const isSelected = statusFilter === f.key;
            return (
              <button
                key={f.key || 'ALL'}
                type="button"
                onClick={() => handleStatusChange(f.key)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-sm shadow-orange-500/20'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-orange-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Reports Content */}
      {isLoading ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-16 flex flex-col items-center justify-center space-y-3">
          <Spinner size="lg" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading your reported issues...</p>
        </div>
      ) : reports.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
            <span>
              Showing <strong className="text-slate-800 dark:text-white">{(currentPage - 1) * PAGE_SIZE + 1}</strong> to{' '}
              <strong className="text-slate-800 dark:text-white">{Math.min(currentPage * PAGE_SIZE, totalCount)}</strong> of{' '}
              <strong className="text-slate-800 dark:text-white">{totalCount}</strong> reports
            </span>
            {statusFilter && (
              <span className="font-semibold text-orange-600 dark:text-orange-400">
                Filtered by: {STATUS_BADGE_META[statusFilter]?.label || statusFilter}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {reports.map((report) => {
              const statusMeta = STATUS_BADGE_META[report.status] || { label: report.status, variant: 'default' };
              const typeMeta = ISSUE_TYPE_META[report.issue_type] || ISSUE_TYPE_META.OTHER;
              const TypeIcon = typeMeta.icon;

              return (
                <div
                  key={report.id}
                  className="group bg-white dark:bg-slate-900/95 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-xl hover:-translate-y-0.5 hover:border-orange-300/80 dark:hover:border-orange-600/60 transition-all p-5 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${typeMeta.bg} border ${typeMeta.ring} flex items-center justify-center shrink-0`}>
                          <TypeIcon className={`w-5 h-5 ${typeMeta.text}`} />
                        </div>
                        <div className="min-w-0">
                          <span className={`text-[11px] font-bold uppercase tracking-wider ${typeMeta.text} block`}>
                            {typeMeta.label}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">
                            Ticket #{report.id}
                          </span>
                        </div>
                      </div>

                      <Badge variant={statusMeta.variant} size="xs">
                        {statusMeta.label}
                      </Badge>
                    </div>

                    <div>
                      <Link
                        to={`/reports/${report.id}`}
                        className="font-display text-lg font-bold text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-1 block"
                      >
                        {report.title}
                      </Link>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {report.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg text-slate-700 dark:text-slate-300 font-medium truncate">
                        <Building2 className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                        <span className="truncate">{report.facility?.name}</span>
                      </span>
                      <span className="hidden sm:inline-flex items-center gap-1 text-slate-400 shrink-0">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDate(report.created_at)}
                      </span>
                    </div>

                    <Link
                      to={`/reports/${report.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 dark:text-orange-400 hover:text-orange-700 shrink-0"
                    >
                      <span>View</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <Button
                variant="secondary"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => updateQuery({ page: currentPage - 1 })}
                icon={ChevronLeft}
              >
                Previous
              </Button>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 px-3">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => updateQuery({ page: currentPage + 1 })}
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      ) : activeFiltersCount > 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <Filter className="w-12 h-12 text-slate-300 mx-auto" />
          <div className="space-y-1">
            <h3 className="font-display text-base font-bold text-slate-800 dark:text-white">No Reports Match Your Criteria</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              There are no issue reports matching the selected status or search keywords.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={handleResetFilters} icon={RotateCcw}>
            Clear All Filters
          </Button>
        </div>
      ) : (
        <div className="p-12 sm:p-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-orange-50 dark:bg-orange-950/50 border border-orange-100 dark:border-orange-800/60 flex items-center justify-center text-orange-600 mx-auto">
            <FileText className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">No Reports Submitted Yet</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              You haven&apos;t filed any facility issue reports. Notice broken equipment, lighting failures, or cleanliness issues? Submit a report to notify campus operations.
            </p>
          </div>
          <Link
            to="/reports/new"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-sm transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Report an Issue</span>
          </Link>
        </div>
      )}
    </div>
  );
}
