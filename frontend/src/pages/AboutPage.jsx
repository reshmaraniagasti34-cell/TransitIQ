import React from 'react';
import { Bus, Target, ShieldCheck, CheckCircle2, BookOpen } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto py-2">
      {/* Hero Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">About TransitIQ</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Resilient Public Transport Information System
            </p>
          </div>
        </div>
      </div>

      {/* Main Core Principle */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Bus className="w-5 h-5 text-teal-600" />
          Core Principle
        </h2>

        <div className="p-6 rounded-2xl bg-teal-50 border border-teal-200 text-center">
          <p className="text-lg font-extrabold text-teal-900 tracking-tight">
            "No live signal does not mean no useful information."
          </p>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Small-city and suburban transit corridors frequently experience intermittent GPS signal loss or unmonitored route segments. TransitIQ detects real-time signal state degradation (<strong>LIVE</strong> → <strong>PARTIAL</strong> → <strong>HISTORICAL</strong>) and dynamically applies historical fallbacks and prediction uncertainty bounds to ensure passengers always receive realistic, reliable arrival estimates.
        </p>
      </div>

      {/* Key Architectural Highlights */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Target className="w-5 h-5 text-teal-600" />
          System Highlights
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <h4 className="text-xs font-bold text-slate-900">Signal Evaluator</h4>
            <p className="text-xs text-slate-500">
              Evaluates GPS ping freshness: ≤30s (LIVE), 30s–300s (PARTIAL), &gt;300s (HISTORICAL).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <h4 className="text-xs font-bold text-slate-900">Hybrid ETA Layer</h4>
            <p className="text-xs text-slate-500">
              Blends machine learning predictions with historical segment averages based on signal confidence.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
