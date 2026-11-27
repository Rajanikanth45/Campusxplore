import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Compass, ShieldCheck, MapPin } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Atmospheric gradient mesh & dot grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.28),_transparent_45%),radial-gradient(circle_at_bottom_right,_rgba(139,92,246,0.24),_transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-dot-grid opacity-40 pointer-events-none" />

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3 px-4">
        <Link to="/" className="inline-flex items-center space-x-3 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
            <Compass className="h-6 w-6 text-white" />
          </div>
          <div className="text-left">
            <span className="font-display font-extrabold text-2xl tracking-tight text-white block leading-none">
              CampusXplore
            </span>
            <span className="text-[10px] font-semibold text-indigo-300 uppercase tracking-widest mt-1 block">
              LPU Smart Campus
            </span>
          </div>
        </Link>
      </div>

      <div className="relative z-10 mt-7 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0 animate-fade-in-up">
        <div className="bg-white/95 backdrop-blur-xl py-8 px-6 sm:px-10 shadow-2xl shadow-black/40 border border-white/20 rounded-3xl">
          <Outlet />
        </div>

        <div className="mt-5 flex items-center justify-center gap-4 text-[11px] text-slate-400">
          <span className="inline-flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-indigo-400" />
            Lovely Professional University
          </span>
          <span>•</span>
          <span className="inline-flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            JWT Secured
          </span>
        </div>
      </div>
    </div>
  );
}
