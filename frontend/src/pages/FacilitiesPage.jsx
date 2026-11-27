import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Building2, Filter, ChevronLeft, ChevronRight, RotateCcw, LayoutGrid, Map as MapIcon, Heart, History } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import facilityService from '../services/facilityService';
import FacilityCard from '../components/facilities/FacilityCard';
import FacilitySkeleton from '../components/facilities/FacilitySkeleton';
import CategoryPill from '../components/facilities/CategoryPill';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';

export default function FacilitiesPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [facilities, setFacilities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('campusxplore_recent_searches') || '[]');
    } catch {
      return [];
    }
  });
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter state synced with searchParams
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const selectedCategory = searchParams.get('category') || '';
  const searchKeyword = searchParams.get('search') || '';
  const buildingFilter = searchParams.get('building') || '';
  const activeFilter = searchParams.get('is_active') || '';

  const [searchInput, setSearchInput] = useState(searchKeyword);
  const [buildingInput, setBuildingInput] = useState(buildingFilter);

  // Synchronize input fields with URL search parameters (browser navigation, resets, external links)
  const [prevSearchKeyword, setPrevSearchKeyword] = useState(searchKeyword);
  const [prevBuildingFilter, setPrevBuildingFilter] = useState(buildingFilter);

  if (prevSearchKeyword !== searchKeyword) {
    setPrevSearchKeyword(searchKeyword);
    setSearchInput(searchKeyword);
  }
  if (prevBuildingFilter !== buildingFilter) {
    setPrevBuildingFilter(buildingFilter);
    setBuildingInput(buildingFilter);
  }

  // Load categories taxonomy & user favorites
  useEffect(() => {
    let isMounted = true;
    facilityService
      .getCategories()
      .then((data) => {
        if (isMounted) setCategories(data || []);
      })
      .catch((err) => {
        console.error('Failed to load categories:', err);
      });

    facilityService
      .getFavorites()
      .then((data) => {
        if (isMounted) setFavoriteIds(data?.favorite_ids || []);
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch facilities
  useEffect(() => {
    let isMounted = true;

    facilityService
      .getFacilities({
        page: currentPage,
        pageSize: 9,
        category: selectedCategory || undefined,
        building: buildingFilter || undefined,
        search: searchKeyword || undefined,
        isActive: user?.role === 'ADMIN' && activeFilter !== '' ? activeFilter : undefined,
      })
      .then((data) => {
        if (isMounted) {
          setFacilities(data.results || []);
          setTotalCount(data.count || 0);
          setError(null);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(
            err.response?.data?.detail ||
              'Failed to load facilities from campus API. Please try again.'
          );
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentPage, selectedCategory, buildingFilter, searchKeyword, activeFilter, user]);

  // Update query params helper
  const updateFilter = (key, value) => {
    setIsLoading(true);
    const nextParams = new URLSearchParams(searchParams);
    if (value) {
      nextParams.set(key, value);
    } else {
      nextParams.delete(key);
    }
    // Reset to page 1 on filter changes
    if (key !== 'page') {
      nextParams.set('page', '1');
    }
    setSearchParams(nextParams);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const term = searchInput.trim();
    if (term) {
      const next = [term, ...recentSearches.filter((t) => t.toLowerCase() !== term.toLowerCase())].slice(0, 5);
      setRecentSearches(next);
      try {
        localStorage.setItem('campusxplore_recent_searches', JSON.stringify(next));
      } catch {
        // ignore
      }
    }
    updateFilter('search', term);
  };

  const handleToggleFavorite = async (facilityId) => {
    try {
      const res = await facilityService.toggleFavorite(facilityId);
      setFavoriteIds((prev) =>
        res.is_favorited ? [...prev, facilityId] : prev.filter((id) => id !== facilityId)
      );
      showToast(res.is_favorited ? 'Saved to favorites' : 'Removed from favorites', 'success');
    } catch {
      showToast('Could not update favorite.', 'error');
    }
  };

  const handleBuildingSubmit = (e) => {
    e.preventDefault();
    updateFilter('building', buildingInput.trim());
  };

  const handleResetFilters = () => {
    setIsLoading(true);
    setSearchInput('');
    setBuildingInput('');
    setSearchParams(new URLSearchParams());
  };

  const totalPages = Math.ceil(totalCount / 9) || 1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-left w-full">
      {/* Hero Command Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f1e3d] via-slate-900 to-slate-950 p-6 sm:p-8 border border-slate-800 shadow-xl text-white">
        <div className="absolute inset-0 bg-dot-grid opacity-25 pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-orange-500/20 border border-orange-400/30 text-orange-300 text-[11px] font-bold uppercase tracking-wider">
              <Building2 className="w-3.5 h-3.5" />
              <span>{totalCount || 14} Campus Locations</span>
            </div>
            <h1 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight">
              Campus Facilities Directory
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              Discover academic blocks, dining hubs, hostels, and services across Lovely Professional University.
            </p>
          </div>

          {/* View Switcher */}
          <div className="inline-flex rounded-xl bg-white/10 backdrop-blur-md p-1 border border-white/15 self-start sm:self-auto shrink-0">
            <button
              type="button"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-sm cursor-default"
              aria-current="page"
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Grid View</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const paramsString = searchParams.toString();
                navigate(paramsString ? `/map?${paramsString}` : '/map');
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              title="Switch to Interactive Map"
            >
              <MapIcon className="w-4 h-4" />
              <span>Map View</span>
            </button>
          </div>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {/* Unified Command Search & Filter Bar */}
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm p-4 sm:p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2.5">
          <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search facilities, libraries, hostels..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-orange-500 focus:bg-white dark:focus:bg-slate-800"
              />
            </div>
            <Button type="submit" variant="primary" size="sm">
              Search
            </Button>
          </form>

          <form onSubmit={handleBuildingSubmit} className="lg:w-72 flex gap-2">
            <div className="relative flex-1">
              <Building2 className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Block (e.g. Block 37)..."
                value={buildingInput}
                onChange={(e) => setBuildingInput(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-orange-500 focus:bg-white dark:focus:bg-slate-800"
              />
            </div>
            <Button type="submit" variant="secondary" size="sm">
              Filter
            </Button>
          </form>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowSavedOnly((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer min-h-[38px] ${
                showSavedOnly
                  ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-300'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-rose-300 hover:text-rose-600'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${showSavedOnly ? 'fill-rose-500 text-rose-500' : ''}`} />
              <span>Saved ({favoriteIds.length})</span>
            </button>

            {user?.role === 'ADMIN' ? (
              <select
                value={activeFilter}
                onChange={(e) => updateFilter('is_active', e.target.value)}
                className="py-2.5 px-3 text-xs rounded-xl border border-orange-300 dark:border-slate-700 bg-orange-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-orange-500 font-semibold"
              >
                <option value="">All States</option>
                <option value="true">Active Only</option>
                <option value="false">Inactive Only</option>
              </select>
            ) : (selectedCategory || searchKeyword || buildingFilter) ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                icon={RotateCcw}
                className="text-xs text-slate-500 dark:text-slate-400"
              >
                Reset
              </Button>
            ) : null}
          </div>
        </div>

        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-medium inline-flex items-center gap-1 mr-1">
              <History className="w-3.5 h-3.5" /> Recent:
            </span>
            {recentSearches.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => {
                  setSearchInput(term);
                  updateFilter('search', term);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-orange-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-orange-700 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer text-[11px] font-medium"
              >
                {term}
              </button>
            ))}
          </div>
        )}

        {/* Category Pills Row */}
        {categories.length > 0 && (
          <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1 mr-1">
              <Filter className="w-3 h-3" />
              <span>Category:</span>
            </span>

            <CategoryPill
              category={{ name: 'All Categories' }}
              isSelected={!selectedCategory}
              onClick={() => updateFilter('category', '')}
            />

            {categories.map((cat) => {
              const isSelected = selectedCategory === String(cat.id) || selectedCategory === cat.name;
              return (
                <CategoryPill
                  key={cat.id}
                  category={cat}
                  isSelected={isSelected}
                  onClick={() => updateFilter('category', isSelected ? '' : String(cat.id))}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Facilities Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <FacilitySkeleton key={i} />
          ))}
        </div>
      ) : facilities.length > 0 ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>
              Showing {facilities.length} of {totalCount} campus facilities
            </span>
            <span>
              Page {currentPage} of {totalPages}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {(showSavedOnly ? facilities.filter((f) => favoriteIds.includes(f.id)) : facilities).map((facility) => (
              <FacilityCard
                key={facility.id}
                facility={facility}
                isFavorited={favoriteIds.includes(facility.id)}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-6 border-t border-slate-200">
              <Button
                variant="secondary"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => updateFilter('page', String(currentPage - 1))}
                icon={ChevronLeft}
              >
                Previous
              </Button>

              <span className="text-xs font-semibold text-slate-700 px-3">
                Page {currentPage} of {totalPages}
              </span>

              <Button
                variant="secondary"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => updateFilter('page', String(currentPage + 1))}
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-800">No Facilities Match Your Criteria</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search terms, clearing category filters, or browsing all buildings.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={handleResetFilters} icon={RotateCcw}>
            Clear All Filters
          </Button>
        </div>
      )}
    </div>
  );
}
