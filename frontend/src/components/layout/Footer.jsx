import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, MapPin, ShieldCheck, Layers, ArrowUpRight, Siren, Navigation } from 'lucide-react';

const CURRENT_YEAR = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#0a1326] text-slate-300 text-xs mt-auto border-t border-slate-800/80">
      {/* Subtle LPU Orange top accent glow */}
      <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-80" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[520px] h-[160px] bg-[radial-gradient(ellipse_at_top,rgba(249,115,22,0.12),transparent_70%)] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Brand & Live Status (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <Link to="/" className="inline-flex items-center space-x-3 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform">
                <Compass className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-display font-extrabold text-lg tracking-tight text-white leading-tight">
                  CampusXplore
                </span>
                <span className="text-[10px] text-orange-400 tracking-widest uppercase font-bold">
                  LPU Smart Campus
                </span>
              </div>
            </Link>

            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Smart campus navigation, live e-rickshaw tracking, venue bookings, one-tap Emergency SOS, and maintenance reporting for Lovely Professional University.
            </p>

            <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-medium text-emerald-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>All Campus GIS, Transit &amp; API Systems Online</span>
            </div>
          </div>

          {/* Explore Links (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-[11px] font-bold text-white uppercase tracking-widest">
              Explore
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/map" className="text-slate-400 hover:text-orange-400 transition-colors inline-flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-orange-500" />
                  <span>Live Campus Map</span>
                </Link>
              </li>
              <li>
                <Link to="/facilities" className="text-slate-400 hover:text-orange-400 transition-colors">
                  Facility Directory
                </Link>
              </li>
              <li>
                <Link to="/bookings" className="text-slate-400 hover:text-orange-400 transition-colors">
                  Venue Bookings
                </Link>
              </li>
              <li>
                <Link to="/reports" className="text-slate-400 hover:text-orange-400 transition-colors">
                  Issue Reporting
                </Link>
              </li>
            </ul>
          </div>

          {/* Portals (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-[11px] font-bold text-white uppercase tracking-widest">
              Portals
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/dashboard" className="text-slate-400 hover:text-orange-400 transition-colors inline-flex items-center gap-1">
                  <span>My Dashboard</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-slate-400 hover:text-orange-400 transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-slate-400 hover:text-orange-400 transition-colors">
                  Student Sign Up
                </Link>
              </li>
              <li>
                <Link to="/map" className="text-rose-400 hover:text-rose-300 font-semibold transition-colors inline-flex items-center gap-1">
                  <Siren className="w-3.5 h-3.5" />
                  <span>Emergency SOS</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Campus Card (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-[11px] font-bold text-white uppercase tracking-widest">
              Campus Hub
            </h4>
            <div className="rounded-2xl bg-white/5 border border-white/10 p-4 space-y-2.5 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <span>Lovely Professional University, Phagwara, Punjab 144411</span>
              </div>
              <div className="flex items-start gap-2">
                <Layers className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span>React 19 • Django 5.2 • PostgreSQL • Leaflet</span>
              </div>
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>JWT RBAC &amp; Rate-Limited API</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© {CURRENT_YEAR} CampusXplore — Lovely Professional University Smart Campus.</p>
          <span className="text-slate-400 font-medium">600+ Acres • Live Mobility • 24/7 SOS</span>
        </div>
      </div>
    </footer>
  );
}
