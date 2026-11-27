import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import MobileBottomNav from '../components/layout/MobileBottomNav';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-50/50 via-slate-50 to-slate-100/60 dark:from-slate-900 dark:via-slate-950 dark:to-slate-950 flex flex-col text-slate-900 dark:text-slate-100 selection:bg-orange-100 selection:text-orange-900 pb-16 md:pb-0 transition-colors">
      <Navbar />
      <main className="flex-1 flex flex-col animate-fade-in-up">
        <Outlet />
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
