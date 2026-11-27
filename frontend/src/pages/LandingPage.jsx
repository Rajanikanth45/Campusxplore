import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import useAuth from '../hooks/useAuth';
import {
  Compass,
  Building2,
  Navigation,
  ShieldCheck,
  ArrowRight,
  MapPin,
  Layers,
  Sparkles,
  ChevronRight,
  Radio,
  FileCheck,
  Search,
  Siren,
  Truck,
  Clock,
  PhoneCall,
  HeartPulse,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [healthStatus, setHealthStatus] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('ALL');
  const [activeReportStep, setActiveReportStep] = useState(1);

  useEffect(() => {
    let isMounted = true;
    api
      .get('/health/')
      .then((res) => {
        if (isMounted) setHealthStatus(res.data);
      })
      .catch((err) => {
        if (isMounted) setHealthStatus({ status: 'offline', message: err.message });
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      navigate(`/facilities?search=${encodeURIComponent(query)}`);
    } else {
      navigate('/facilities');
    }
  };

  const handleQuickTagClick = (tag) => {
    navigate(`/facilities?search=${encodeURIComponent(tag)}`);
  };

  const campusFacilities = [
    {
      id: 0,
      name: 'Central Library',
      block: 'Block 37',
      category: 'ACADEMIC',
      categoryLabel: 'Academic & Research',
      accent: 'from-[#0f1e3d] to-sky-700',
      status: 'Open Today',
      hours: '08:00 AM – 10:00 PM',
      specs: '4 Floors • 150,000+ Volumes • Digital Media Wing',
      floor: 'Floors 1–4',
    },
    {
      id: 1,
      name: 'Indoor Sports Complex',
      block: 'Shanti Devi Stadium',
      category: 'SPORTS',
      categoryLabel: 'Athletics & Fitness',
      accent: 'from-emerald-500 to-teal-600',
      status: 'Open Today',
      hours: '06:00 AM – 09:00 PM',
      specs: 'Olympic Badminton • Basketball Arena • High-Performance Gym',
      floor: 'Ground & Mezzanine',
    },
    {
      id: 2,
      name: 'UniMall & Student Plaza',
      block: 'Central Avenue',
      category: 'COMMERCIAL',
      categoryLabel: 'Dining & Commerce',
      accent: 'from-orange-500 to-amber-600',
      status: 'Open Today',
      hours: '08:00 AM – 11:00 PM',
      specs: '40+ Dining Outlets • Banking Hub • Stationery & Postal Service',
      floor: 'Floors G–3',
    },
    {
      id: 3,
      name: 'Computer Science Dept',
      block: 'Block 38',
      category: 'ACADEMIC',
      categoryLabel: 'Engineering & Labs',
      accent: 'from-sky-500 to-blue-600',
      status: 'Open Today',
      hours: '09:00 AM – 06:00 PM',
      specs: 'AI Innovation Hub • Robotics Cluster • Cloud Datacenter',
      floor: 'Floors 2–5',
    },
    {
      id: 4,
      name: 'Baldev Raj Mittal Auditorium',
      block: 'Block 13',
      category: 'SERVICES',
      categoryLabel: 'Arts & Convocations',
      accent: 'from-amber-500 to-orange-600',
      status: 'Event Access',
      hours: '09:00 AM – 08:00 PM',
      specs: '2,500 Seater Acoustic Hall • Global Symposia Stage',
      floor: 'Ground & Balcony',
    },
    {
      id: 5,
      name: 'UniHospital Medical Center',
      block: 'Block 30',
      category: 'SERVICES',
      categoryLabel: '24/7 Healthcare & SOS',
      accent: 'from-rose-500 to-red-600',
      status: '24/7 Emergency',
      hours: 'Open 24 Hours',
      specs: 'Emergency Trauma • Ambulance Dispatch • Pharmacy & Diagnostics',
      floor: 'Ground Floor',
    },
  ];

  const filteredFacilities =
    activeCategoryFilter === 'ALL'
      ? campusFacilities
      : campusFacilities.filter((f) => f.category === activeCategoryFilter);

  const reportStages = [
    {
      step: 0,
      badge: 'PENDING',
      badgeClass: 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      timestamp: 'Today at 09:14 AM',
      actor: 'Student (Reg: 12108422)',
      desc: 'Elevator 2 in Block 37 (Library) displays floor sensor calibration fault. Submitted with photo evidence.',
    },
    {
      step: 1,
      badge: 'IN PROGRESS',
      badgeClass: 'bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-sky-800',
      timestamp: 'Today at 10:25 AM',
      actor: 'Campus Estate Services (Faculty/Admin)',
      desc: 'Technician team dispatched. Sensor hardware recalibrated; final safety inspection in progress.',
    },
    {
      step: 2,
      badge: 'RESOLVED',
      badgeClass: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      timestamp: 'Today at 01:40 PM',
      actor: 'Chief Facility Officer (Admin)',
      desc: 'Hydraulic sensor calibrated, 10-point safety test passed. Ticket closed & student notified.',
    },
  ];

  return (
    <div className="min-h-screen bg-transparent text-slate-900 dark:text-slate-100 selection:bg-orange-100 selection:text-orange-900 font-sans">
      {/* =========================================================================
          1. LPU NAVY + ORANGE CINEMATIC HERO WITH LIVE TELEMETRY HUD
          ========================================================================= */}
      <section className="px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-10 max-w-7xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-slate-900/25 border border-slate-200/80 dark:border-slate-800 min-h-[640px] lg:min-h-[690px] flex flex-col justify-between bg-[#0a1326]">
          {/* Campus Aerial Backdrop */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 hover:scale-105 pointer-events-none opacity-80"
            style={{ backgroundImage: "url('/lpu_campus_hero.jpg')" }}
          />

          {/* Layered Atmospheric Gradients */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#081021]/95 via-[#0f1e3d]/80 to-[#0f1e3d]/45 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#081021]/95 via-transparent to-[#081021]/45 pointer-events-none" />
          <div className="absolute inset-0 bg-dot-grid opacity-20 pointer-events-none" />

          {/* Top Bar */}
          <div className="relative z-10 p-6 sm:p-10 flex flex-wrap items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-semibold tracking-wide shadow-lg">
              <MapPin className="w-3.5 h-3.5 text-orange-400" />
              <span>Lovely Professional University • 600+ Acres</span>
            </div>

            <div className="flex items-center space-x-3 text-xs font-mono text-slate-200">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/75 backdrop-blur-md border border-white/15">
                <span className={`w-2 h-2 rounded-full ${healthStatus?.status === 'ok' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400 animate-pulse'}`} />
                <span>{healthStatus?.status === 'ok' ? 'SYSTEMS ONLINE' : 'CONNECTING...'}</span>
              </span>
              <span className="hidden md:inline text-slate-300">31.2536° N, 75.7032° E</span>
            </div>
          </div>

          {/* Main Hero Grid */}
          <div className="relative z-10 px-6 sm:px-10 pb-8 sm:pb-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            {/* Left Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-400/35 text-orange-200 text-xs font-semibold tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-orange-300" />
                <span>Smart Campus Navigation &amp; Mobility</span>
              </div>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.07] text-white">
                Explore LPU{' '}
                <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-orange-200 bg-clip-text text-transparent">
                  Without Guesswork.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-200/90 leading-relaxed max-w-xl">
                Locate any block, lab, or food court in seconds. Track live campus e-rickshaws, book seminar halls, trigger 1-tap Emergency SOS, and report facility issues in real time.
              </p>

              {/* Search Bar */}
              <form onSubmit={handleSearchSubmit} className="pt-1">
                <div className="bg-white/12 backdrop-blur-xl border border-white/25 rounded-2xl p-2 shadow-2xl flex flex-col sm:flex-row items-center gap-2 max-w-xl focus-within:border-orange-400/80 transition-colors">
                  <div className="flex items-center w-full px-3 gap-2.5">
                    <Search className="w-5 h-5 text-orange-300 shrink-0" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search Block 37, Library, UniHospital, BH-4..."
                      className="w-full bg-transparent text-white placeholder-slate-300/80 text-sm sm:text-base focus:outline-hidden py-1.5"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-sm shadow-lg shadow-orange-500/30 transition-all cursor-pointer"
                  >
                    <span>Search</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Quick Chips */}
                <div className="flex flex-wrap items-center gap-2 pt-3 text-xs text-slate-300">
                  <span className="text-slate-400 font-medium">Popular:</span>
                  {['Central Library', 'Block 37', 'UniHospital', 'UniMall', 'Block 38'].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleQuickTagClick(tag)}
                      className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-orange-500/25 text-white border border-white/15 hover:border-orange-400/40 transition-all text-[11px] font-medium cursor-pointer"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </form>

              {/* Primary CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link
                  to="/map"
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-white hover:bg-orange-50 text-[#0f1e3d] font-bold text-sm shadow-xl transition-all hover:scale-[1.02]"
                >
                  <Navigation className="w-4 h-4 text-orange-600" />
                  <span>Open Live Campus Map</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to={isAuthenticated ? '/dashboard' : '/register'}
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 backdrop-blur-md transition-all"
                >
                  <span>{isAuthenticated ? 'Go to Portal' : 'Create Student Account'}</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Live Campus Command HUD */}
            <div className="hidden lg:block lg:col-span-5">
              <div className="rounded-3xl bg-[#0a1326]/80 backdrop-blur-xl border border-white/15 p-5 shadow-2xl space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-white">
                      Live Campus Pulse
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-400/25">
                    Real-Time
                  </span>
                </div>

                {/* Live E-Rickshaw Card */}
                <Link
                  to="/map"
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-400/35 flex items-center justify-center text-orange-300">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white group-hover:text-orange-300 transition-colors">
                        E-Rickshaws &amp; Shuttles
                      </div>
                      <div className="text-[11px] text-slate-300 flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-orange-300" />
                        <span>2 Campus Lines • Live GPS Stops</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 group-hover:text-white transition-all" />
                </Link>

                {/* Venue Bookings Card */}
                <Link
                  to="/bookings"
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/35 flex items-center justify-center text-sky-300">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors">
                        Venue &amp; Hall Bookings
                      </div>
                      <div className="text-[11px] text-slate-300">
                        Conflict-checked slot reservations
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 group-hover:text-white transition-all" />
                </Link>

                {/* Emergency SOS Card */}
                <Link
                  to="/map"
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-400/30 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/25 border border-rose-400/40 flex items-center justify-center text-rose-300">
                      <Siren className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white group-hover:text-rose-200 transition-colors">
                        1-Tap Emergency SOS
                      </div>
                      <div className="text-[11px] text-rose-200/85">
                        Fast-path to UniHospital &amp; Security
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-rose-300 group-hover:translate-x-0.5 transition-all" />
                </Link>

                {/* Quick Stats Row */}
                <div className="grid grid-cols-3 gap-2.5 pt-1 text-center">
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <div className="font-display text-lg font-extrabold text-white">600+</div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">Acres</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <div className="font-display text-lg font-extrabold text-orange-300">3</div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">Map Modes</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <div className="font-display text-lg font-extrabold text-emerald-300">24/7</div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">SOS Ready</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. MOBILITY & EMERGENCY SPOTLIGHT
          ========================================================================= */}
      <section id="features" className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* E-Rickshaw & Shuttle Card */}
          <div className="lg:col-span-7 rounded-3xl bg-gradient-to-br from-[#0f1e3d] via-slate-900 to-slate-950 text-white p-7 sm:p-9 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute inset-0 bg-dot-grid opacity-20 pointer-events-none" />
            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-400/30 text-orange-300 text-xs font-semibold">
                <Truck className="w-3.5 h-3.5" />
                <span>Campus Mobility</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">
                Live E-Rickshaw Tracker &amp; Campus Roads
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
                View Avenue Express (Line 1) and Hostel Circuit (Line 2) following internal LPU roads, check pickup stops with ETAs, and switch between Street, Satellite &amp; Dark map modes.
              </p>
            </div>

            <div className="relative z-10 mt-7 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-xs text-slate-300">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Internal Campus Roads
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Satellite &amp; Dark Map
                </span>
              </div>
              <Link
                to="/map"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-xs shadow-sm transition-all"
              >
                <span>Track Shuttles</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Emergency SOS Card */}
          <div className="lg:col-span-5 rounded-3xl bg-gradient-to-br from-rose-950 via-slate-900 to-slate-950 text-white p-7 sm:p-9 border border-rose-500/25 shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute inset-0 bg-dot-grid opacity-20 pointer-events-none" />
            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-400/30 text-rose-300 text-xs font-semibold">
                <HeartPulse className="w-3.5 h-3.5" />
                <span>Emergency Response</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">
                One-Tap SOS &amp; Fast-Path
              </h2>
              <p className="text-sm text-rose-100/80 leading-relaxed">
                Instantly plot the fastest route to UniHospital (Block 30) or Security Gate 1, copy your GPS coordinates, and call campus dispatch in one tap.
              </p>
            </div>

            <div className="relative z-10 mt-7 pt-6 border-t border-white/10 flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-1.5 text-xs text-rose-200 font-medium">
                <PhoneCall className="w-4 h-4 text-rose-400" />
                24/7 Campus Dispatch
              </span>
              <Link
                to="/map"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all"
              >
                <span>Open SOS Map</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. INTERACTIVE CAMPUS FACILITY DIRECTORY PREVIEW
          ========================================================================= */}
      <section id="directory" className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="space-y-2.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-950/50 border border-orange-200 dark:border-orange-800/60 text-orange-700 dark:text-orange-300 text-xs font-semibold">
              <Building2 className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
              <span>Campus Directory</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Discover Every Block &amp; Service
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
              Verified coordinates, operating hours, and 3-tap walking directions across LPU.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { key: 'ALL', label: 'All' },
              { key: 'ACADEMIC', label: 'Academic' },
              { key: 'SPORTS', label: 'Sports' },
              { key: 'COMMERCIAL', label: 'Dining & Mall' },
              { key: 'SERVICES', label: 'Health & Events' },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveCategoryFilter(tab.key)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  activeCategoryFilter === tab.key
                    ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-sm shadow-orange-500/20'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 hover:border-orange-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFacilities.map((fac) => (
            <div
              key={fac.id}
              className="group rounded-3xl bg-white dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800 hover:border-orange-300 dark:hover:border-orange-600/60 overflow-hidden transition-all duration-200 shadow-xs hover:shadow-xl hover:-translate-y-0.5 flex flex-col justify-between"
            >
              <div className={`h-1.5 w-full bg-gradient-to-r ${fac.accent}`} />
              <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {fac.categoryLabel}
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {fac.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                      {fac.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-orange-500" />
                      <span className="font-medium text-slate-600 dark:text-slate-300">{fac.block}</span>
                      <span>•</span>
                      <span>{fac.floor}</span>
                    </p>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{fac.specs}</p>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">{fac.hours}</span>
                  <Link
                    to="/facilities"
                    className="inline-flex items-center gap-1 text-orange-600 dark:text-orange-400 hover:text-orange-700 font-bold"
                  >
                    <span>Locate</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          4. INTERACTIVE ISSUE REPORTING LIFECYCLE
          ========================================================================= */}
      <section className="py-16 bg-white/70 dark:bg-slate-900/50 border-y border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center space-y-3 mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-semibold">
              <FileCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Transparent Maintenance Pipeline</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Track Every Report From Filing to Fix
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
              Click each stage below to preview how student reports move through faculty &amp; admin resolution.
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-slate-50/90 dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-8 shadow-lg">
            <div className="grid grid-cols-3 gap-2 sm:gap-3 p-1.5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 mb-6">
              {reportStages.map((stage) => (
                <button
                  key={stage.step}
                  type="button"
                  onClick={() => setActiveReportStep(stage.step)}
                  className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                    activeReportStep === stage.step
                      ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md shadow-orange-500/20'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <span className="hidden sm:inline">0{stage.step + 1}. </span>
                  <span>{stage.badge}</span>
                </button>
              ))}
            </div>

            <div className="rounded-2xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 p-6 space-y-5 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="space-y-1">
                  <span className="text-[11px] font-mono text-slate-400">
                    TICKET #CPX-2026-0842 • BLOCK 37
                  </span>
                  <h3 className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                    Elevator 2 Sensor Fault — Central Library
                  </h3>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${reportStages[activeReportStep].badgeClass}`}
                >
                  {reportStages[activeReportStep].badge}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 block">Timestamp</span>
                  <span className="text-slate-900 dark:text-white font-semibold">
                    {reportStages[activeReportStep].timestamp}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 block">Handled By</span>
                  <span className="text-orange-600 dark:text-orange-400 font-semibold">
                    {reportStages[activeReportStep].actor}
                  </span>
                </div>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200/70 dark:border-slate-800">
                {reportStages[activeReportStep].desc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. ROLE PORTALS & SECURITY SUMMARY
          ========================================================================= */}
      <section id="about" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">Student Portal</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Navigate 600+ acres, track live e-rickshaws, book venues, trigger Emergency SOS, and submit issue reports with photos.
            </p>
          </div>

          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">Faculty Workspace</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Inspect campus-wide maintenance tickets, approve hall bookings, and update resolution statuses in real time.
            </p>
          </div>

          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">Admin Command Center</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Full governance over facilities, categories, transit routes/stops/vehicles, CSV exports, and JWT-secured RBAC access.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. CLOSING CALL TO ACTION
          ========================================================================= */}
      <section className="pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-[#0f1e3d] via-slate-900 to-slate-950 text-white border border-slate-800 p-10 sm:p-14 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-dot-grid opacity-25 pointer-events-none" />
          <div className="relative z-10 max-w-2xl mx-auto space-y-5">
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
              Ready to Explore LPU Smarter?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Sign in to access personalized portals, live e-rickshaw tracking, venue bookings, and real-time campus reporting.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                to={isAuthenticated ? '/dashboard' : '/login'}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-sm shadow-xl shadow-orange-500/25 transition-all hover:scale-[1.02]"
              >
                <span>{isAuthenticated ? 'Open My Portal' : 'Sign In to Portal'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              {!isAuthenticated && (
                <Link
                  to="/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 backdrop-blur-md transition-colors"
                >
                  <span>Create Student Account</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
