import React, { useState } from 'react';
import {
  AlertTriangle,
  PhoneCall,
  Navigation,
  ShieldAlert,
  HeartPulse,
  Copy,
  Check,
  X,
  MapPin,
} from 'lucide-react';
import { EMERGENCY_FACILITIES } from '../../data/shuttleData';

export default function EmergencySosModal({
  isOpen,
  onClose,
  userCoords,
  onFastPathTo,
}) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyCoords = () => {
    if (!userCoords) return;
    const text = `EMERGENCY! My Location: Latitude ${userCoords.lat.toFixed(6)}, Longitude ${userCoords.lng.toFixed(6)} (Lovely Professional University Campus)`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border-2 border-red-500 overflow-hidden text-left flex flex-col max-h-[92vh]">
        {/* Urgent Header Banner */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 px-6 py-5 text-white flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0 shadow-inner animate-pulse">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/25 text-[11px] font-bold tracking-wider uppercase">
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                <span>Immediate Assistance</span>
              </div>
              <h2 className="text-xl font-extrabold tracking-tight mt-0.5">
                Campus Emergency SOS
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Current GPS Position Alert Card */}
          <div className="bg-red-50/70 border border-red-200 rounded-2xl p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-red-900 font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-red-600" />
                <span>Your Current Location (Dispatch Info)</span>
              </span>
              {userCoords && (
                <button
                  onClick={handleCopyCoords}
                  className="flex items-center gap-1 text-[11px] font-semibold text-red-700 hover:text-red-900 bg-white/80 px-2.5 py-1 rounded-lg border border-red-200 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy Coords'}</span>
                </button>
              )}
            </div>
            <p className="text-xs text-slate-700">
              {userCoords ? (
                <>
                  <strong className="text-slate-900">Lat: {userCoords.lat.toFixed(6)}, Lon: {userCoords.lng.toFixed(6)}</strong>
                  <span className="block text-[11px] text-slate-500 mt-0.5">
                    Read these exact numbers to the ambulance or security operator for instantaneous dispatch.
                  </span>
                </>
              ) : (
                <span className="text-amber-800 font-medium">
                  📍 Click "My Location" on the map so your real-time coordinates are attached.
                </span>
              )}
            </p>
          </div>

          {/* SECTION 1: ONE-TAP FAST-PATH NAVIGATION */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Navigation className="w-4 h-4 text-red-600" />
              <span>1-Tap Fast-Path Emergency Navigation</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Fast-Path UniHospital */}
              <button
                type="button"
                onClick={() => {
                  onFastPathTo(EMERGENCY_FACILITIES.hospital);
                  onClose();
                }}
                className="group p-4 rounded-2xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-white hover:border-red-500 hover:shadow-md transition-all text-left flex flex-col justify-between space-y-3 cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                    <HeartPulse className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                    24/7 OPEN
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-red-600 transition-colors">
                    UniHospital (Block 30)
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    Instant walking route to Emergency Ward & Resident Doctors.
                  </p>
                </div>
                <div className="pt-2 border-t border-red-100 flex items-center justify-between text-xs font-bold text-red-600">
                  <span>Fast Route ➔</span>
                </div>
              </button>

              {/* Fast-Path Security */}
              <button
                type="button"
                onClick={() => {
                  onFastPathTo(EMERGENCY_FACILITIES.security);
                  onClose();
                }}
                className="group p-4 rounded-2xl border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-white hover:border-indigo-500 hover:shadow-md transition-all text-left flex flex-col justify-between space-y-3 cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                    COMMAND POST
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    Security Gate 1
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    Direct path to Campus Security Headquarters & Patrol Vehicles.
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600">
                  <span>Fast Route ➔</span>
                </div>
              </button>
            </div>
          </div>

          {/* SECTION 2: DIRECT PHONE CALLING */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <PhoneCall className="w-4 h-4 text-emerald-600" />
              <span>Direct Emergency Helpline Numbers</span>
            </h3>

            <div className="space-y-2">
              {/* Hospital Call */}
              <a
                href="tel:+911824517111"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-200 hover:border-emerald-300 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                    <HeartPulse className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 group-hover:text-emerald-700">
                      UniHospital 24/7 Helpline & Ambulance
                    </h5>
                    <p className="text-[11px] text-slate-500 font-mono">+91 1824 517111</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold shadow-xs">
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call Now</span>
                </span>
              </a>

              {/* Security Call */}
              <a
                href="tel:+911824517100"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-200 hover:border-emerald-300 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 group-hover:text-emerald-700">
                      LPU Security Control Room
                    </h5>
                    <p className="text-[11px] text-slate-500 font-mono">+91 1824 517100</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold shadow-xs">
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call Now</span>
                </span>
              </a>

              {/* Women Safety Helpline */}
              <a
                href="tel:+911824517000"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-200 hover:border-emerald-300 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 group-hover:text-emerald-700">
                      Women Safety & Proctorial Cell
                    </h5>
                    <p className="text-[11px] text-slate-500 font-mono">+91 1824 517000</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold shadow-xs">
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call Now</span>
                </span>
              </a>

              {/* National Emergency 112 */}
              <a
                href="tel:112"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-200 hover:border-emerald-300 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 font-bold text-xs">
                    112
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 group-hover:text-emerald-700">
                      National All-in-One Emergency
                    </h5>
                    <p className="text-[11px] text-slate-500">Police, Fire & Ambulance</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 text-white text-xs font-bold shadow-xs">
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call 112</span>
                </span>
              </a>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Close Emergency Panel
          </button>
        </div>
      </div>
    </div>
  );
}

