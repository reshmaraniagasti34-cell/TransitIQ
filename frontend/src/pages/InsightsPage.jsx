import React, { useState } from 'react';
import ModelComparisonCard from '../components/ModelComparisonCard';
import DataAvailabilityControl from '../components/DataAvailabilityControl';
import PredictionCard from '../components/PredictionCard';
import { Cpu, ShieldCheck, AlertCircle } from 'lucide-react';

export default function InsightsPage() {
  const [missingLevel, setMissingLevel] = useState("50%");

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-2">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Research & Model Resilience</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Controlled progressive missing-data experiment results across Historical, ML, and Hybrid models.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Simulation Controls & Uncertainty Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DataAvailabilityControl missingLevel={missingLevel} setMissingLevel={setMissingLevel} />
        <PredictionCard missingLevel={missingLevel} />
      </div>

      {/* Model Benchmark & Comparison Section */}
      <ModelComparisonCard />

      {/* Methodology & Research Note */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm text-xs text-slate-600 space-y-3">
        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-teal-600" />
          Research Methodology: Missing-Data Evaluation
        </h4>
        <p className="leading-relaxed">
          Small-city bus networks frequently suffer from packet drops, dead zones, and unmonitored vehicles. As GPS availability degrades from 0% to 100%, TransitIQ's hybrid model dynamically transitions weight to the historical baseline, expanding prediction intervals to maintain reliability.
        </p>

        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          <span>
            <strong>Experiment Attribution:</strong> Evaluation dataset consists of 1 observed pilot trip (5 logged segments) and 49 physics-constrained simulated trips (245 historical segments) under simulated signal loss.
          </span>
        </div>
      </div>
    </div>
  );
}
