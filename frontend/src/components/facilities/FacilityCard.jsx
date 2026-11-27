import React from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Clock,
  Phone,
  ArrowUpRight,
  Heart,
  Navigation,
  Building2,
  BookOpen,
  Utensils,
  HeartPulse,
  Dumbbell,
  Landmark,
  Car,
  Home,
  Droplets,
  Shield,
} from 'lucide-react';

function getCategoryVisual(categoryName = '') {
  const name = categoryName.toLowerCase();
  if (name.includes('academic') || name.includes('class') || name.includes('lab')) {
    return { icon: Building2, bg: 'from-sky-500/15 to-blue-500/5', text: 'text-sky-600 dark:text-sky-400', ring: 'border-sky-200/70 dark:border-sky-800/50' };
  }
  if (name.includes('library') || name.includes('study')) {
    return { icon: BookOpen, bg: 'from-violet-500/15 to-purple-500/5', text: 'text-violet-600 dark:text-violet-400', ring: 'border-violet-200/70 dark:border-violet-800/50' };
  }
  if (name.includes('food') || name.includes('cafe') || name.includes('dining')) {
    return { icon: Utensils, bg: 'from-orange-500/15 to-amber-500/5', text: 'text-orange-600 dark:text-orange-400', ring: 'border-orange-200/70 dark:border-orange-800/50' };
  }
  if (name.includes('health') || name.includes('hospital') || name.includes('medical')) {
    return { icon: HeartPulse, bg: 'from-rose-500/15 to-red-500/5', text: 'text-rose-600 dark:text-rose-400', ring: 'border-rose-200/70 dark:border-rose-800/50' };
  }
  if (name.includes('sport') || name.includes('gym') || name.includes('recreation')) {
    return { icon: Dumbbell, bg: 'from-emerald-500/15 to-teal-500/5', text: 'text-emerald-600 dark:text-emerald-400', ring: 'border-emerald-200/70 dark:border-emerald-800/50' };
  }
  if (name.includes('bank') || name.includes('atm')) {
    return { icon: Landmark, bg: 'from-amber-500/15 to-yellow-500/5', text: 'text-amber-600 dark:text-amber-400', ring: 'border-amber-200/70 dark:border-amber-800/50' };
  }
  if (name.includes('park')) {
    return { icon: Car, bg: 'from-slate-500/15 to-slate-400/5', text: 'text-slate-600 dark:text-slate-300', ring: 'border-slate-200/80 dark:border-slate-700' };
  }
  if (name.includes('hostel')) {
    return { icon: Home, bg: 'from-indigo-500/15 to-blue-500/5', text: 'text-indigo-600 dark:text-indigo-400', ring: 'border-indigo-200/70 dark:border-indigo-800/50' };
  }
  if (name.includes('water')) {
    return { icon: Droplets, bg: 'from-cyan-500/15 to-sky-500/5', text: 'text-cyan-600 dark:text-cyan-400', ring: 'border-cyan-200/70 dark:border-cyan-800/50' };
  }
  return { icon: Shield, bg: 'from-orange-500/15 to-amber-500/5', text: 'text-orange-600 dark:text-orange-400', ring: 'border-orange-200/70 dark:border-orange-800/50' };
}

// Strip ugly raw GPS decimal strings from description snippets (e.g. "31.24883021531011, 75.69949870297464")
function cleanDescription(desc) {
  if (!desc) return '';
  const cleaned = desc.replace(/\b\d{2}\.\d{4,}\s*,\s*\d{2}\.\d{4,}\b/g, '').trim();
  return cleaned;
}

export default function FacilityCard({ facility, isFavorited = false, onToggleFavorite }) {
  if (!facility) return null;

  const hasCoords = facility.latitude != null && facility.longitude != null;
  const catName = facility.category?.name || 'Campus Spot';
  const visual = getCategoryVisual(catName);
  const Icon = visual.icon;
  const cleanedDesc = cleanDescription(facility.description);

  return (
    <div className="group relative bg-white dark:bg-slate-900/95 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-2xl hover:shadow-slate-900/8 dark:hover:shadow-black/40 hover:-translate-y-1 hover:border-orange-300/80 dark:hover:border-orange-600/60 transition-all duration-200 flex flex-col justify-between text-left overflow-hidden p-5">
      {/* Top Row: Category Icon Tile + Status + Favorite */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${visual.bg} border ${visual.ring} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
              <Icon className={`w-5 h-5 ${visual.text}`} />
            </div>
            <div className="min-w-0">
              <span className={`text-[11px] font-bold uppercase tracking-wider ${visual.text} block truncate`}>
                {catName}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`w-1.5 h-1.5 rounded-full ${facility.is_active ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  {facility.is_active ? 'Open / Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          {onToggleFavorite && (
            <button
              type="button"
              onClick={() => onToggleFavorite(facility.id)}
              aria-label={isFavorited ? `Remove ${facility.name} from favorites` : `Save ${facility.name} to favorites`}
              className={`p-2 min-w-[36px] min-h-[36px] rounded-xl border transition-all cursor-pointer flex items-center justify-center shrink-0 ${
                isFavorited
                  ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800 text-rose-600 scale-105'
                  : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700 text-slate-400 hover:text-rose-500 hover:bg-rose-50/50'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorited ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          )}
        </div>

        {/* Title & Building Pill */}
        <div>
          <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-1">
            {facility.name}
          </h3>
          <div className="inline-flex items-center gap-1.5 mt-1.5 px-2.5 py-0.5 rounded-lg bg-slate-100/90 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
            <span className="truncate">{facility.building}</span>
          </div>
        </div>

        {/* Clean Description */}
        {cleanedDesc && (
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {cleanedDesc}
          </p>
        )}
      </div>

      {/* Metadata Chips & Clean Actions */}
      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/90 space-y-3">
        {(facility.opening_hours || facility.contact_number) && (
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            {facility.opening_hours && (
              <span className="inline-flex items-center gap-1 bg-slate-50 dark:bg-slate-800/70 px-2 py-1 rounded-lg border border-slate-100 dark:border-slate-800">
                <Clock className="w-3 h-3 text-slate-400" />
                <span className="truncate max-w-[130px]">{facility.opening_hours}</span>
              </span>
            )}
            {facility.contact_number && (
              <span className="inline-flex items-center gap-1 bg-slate-50 dark:bg-slate-800/70 px-2 py-1 rounded-lg border border-slate-100 dark:border-slate-800">
                <Phone className="w-3 h-3 text-slate-400" />
                <span>{facility.contact_number}</span>
              </span>
            )}
          </div>
        )}

        <div className="flex items-center gap-2">
          <Link
            to={`/facilities/${facility.id}`}
            className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100/90 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 px-3.5 py-2.5 rounded-xl transition-colors min-h-[40px]"
          >
            <span>Details</span>
            <ArrowUpRight className="w-3.5 h-3.5 opacity-70" />
          </Link>

          {hasCoords && (
            <Link
              to={`/map?facility=${facility.id}&directions=1`}
              className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 px-3.5 py-2.5 rounded-xl shadow-sm shadow-orange-500/20 hover:shadow-md transition-all min-h-[40px]"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Directions</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
