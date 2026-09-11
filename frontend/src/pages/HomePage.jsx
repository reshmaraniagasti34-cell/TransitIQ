import React from 'react';
import { Bus, Search, ArrowRight, ShieldCheck, Clock, MapPin, Signal } from 'lucide-react';

export default function HomePage({ setActiveTab }) {
  return (
    <div className="space-y-12 py-4">
      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm">
        {/* Hero Left Content */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200">
            <Bus className="w-4 h-4 text-teal-600" />
            <span>Pilot Transit Corridor • Sehore ↔ VIT Bhopal</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Smarter Bus Travel, <br />
            <span className="text-teal-600">Even Without Live GPS</span>
          </h1>

          <p className="text-slate-600 text-base leading-relaxed max-w-xl">
            TransitIQ provides reliable arrival estimates using live location, historical trip patterns, and machine learning fallback models—keeping passengers informed even during GPS dead zones.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="px-6 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl shadow-sm transition-all flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Find a Bus
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-all flex items-center gap-2 border border-slate-200"
            >
              View Live Status
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Hero Right Visual: Clean Transit Route Visual */}
        <div className="lg:col-span-5">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                <span className="text-xs font-bold text-slate-800">Pilot Corridor Active</span>
              </div>
              <span className="text-xs text-slate-500 font-medium">Bhopal Region</span>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs">
                    S1
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Sehore Bus Stand</h4>
                    <p className="text-[11px] text-slate-500">Origin Station</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-teal-700">0 min</span>
              </div>

              <div className="pl-7 border-l-2 border-dashed border-teal-300 py-1 space-y-2">
                <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-teal-600" />
                  Kubreshwar Dham
                </div>
                <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-teal-600" />
                  Amlaha
                </div>
                <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-teal-600" />
                  Toll Plaza
                </div>
              </div>

              <div className="p-3.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-xs">
                    V1
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">VIT Bhopal Outer Highway</h4>
                    <p className="text-[11px] text-slate-500">Destination Campus</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-900">Final Target</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Features Minimal Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-4">
            <Signal className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1.5">Signal-Aware ETAs</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Automatically evaluates GPS telemetry state and adjusts prediction confidence levels.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-4">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1.5">Historical Range</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Calculates realistic arrival ranges based on historical segment durations.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-4">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1.5">Hybrid Intelligence</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Combines machine learning with baseline analytics to prevent false predictions during signal outages.
          </p>
        </div>
      </div>
    </div>
  );
}
