import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Map, Building2, Calendar, AlertTriangle, LayoutDashboard } from 'lucide-react';
import useAuth from '../../hooks/useAuth';

export default function MobileBottomNav() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) return null;

  const items = [
    { to: '/map', label: 'Map', icon: Map, active: location.pathname === '/map' },
    { to: '/facilities', label: 'Directory', icon: Building2, active: location.pathname.startsWith('/facilities') },
    { to: '/bookings', label: 'Bookings', icon: Calendar, active: location.pathname.startsWith('/bookings') },
    { to: '/reports', label: 'Reports', icon: AlertTriangle, active: location.pathname.startsWith('/reports') },
    { to: '/dashboard', label: 'Portal', icon: LayoutDashboard, active: location.pathname.includes('/dashboard') },
  ];

  return (
    <nav
      aria-label="Mobile bottom navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 px-2 py-1 flex items-center justify-around shadow-lg"
    >
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] px-2 py-1 rounded-xl text-[11px] font-semibold transition-colors ${
              item.active
                ? 'text-orange-600 dark:text-orange-400 bg-orange-50/80 dark:bg-orange-950/40'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Icon className="w-5 h-5 mb-0.5" aria-hidden="true" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
