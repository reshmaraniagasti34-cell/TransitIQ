import React from 'react';
import { MapPin, Info } from 'lucide-react';

export default function RouteComparisonPage() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto py-2">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Transit Routes</h2>
        <p className="text-xs text-slate-600">
          Verified pilot transit corridors in the Bhopal–Sehore region.
        </p>

        <div className="mt-6 border border-slate-200 rounded-2xl p-6 bg-slate-50 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded bg-teal-50 text-teal-700 border border-teal-200">
                Primary Pilot Corridor
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-1">
                Sehore Bus Stand ↔ VIT Bhopal
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-medium">5 Corridor Stops</span>
          </div>

          <div className="space-y-2 text-xs text-slate-700">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <div>
                <strong>Outbound:</strong> Sehore Bus Stand → Kubreshwar Dham → Amlaha → Toll Plaza → VIT Bhopal Outer Highway
              </div>
            </div>

            <div className="flex items-start gap-2 pt-2">
              <MapPin className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <div>
                <strong>Return:</strong> VIT Bhopal Outer Highway → Amlaha → Kubreshwar Dham → Indore Naka → Nadi/Hospital Chauraha → Sehore Bus Stand
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 rounded-2xl bg-white border border-slate-200 text-xs text-slate-500 flex items-start gap-2">
          <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <span>
            TransitIQ currently operates on one verified pilot corridor. Additional routes can be integrated as telematics data is collected.
          </span>
        </div>
      </div>
    </div>
  );
}
