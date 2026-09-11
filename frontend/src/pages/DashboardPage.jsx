import React, { useState, useEffect } from 'react';
import { Bus, MapPin, Search, ArrowRightLeft, Clock, Wifi, SignalLow, SignalZero, CheckCircle2 } from 'lucide-react';
import CorridorVisualizer from '../components/CorridorVisualizer';

export default function DashboardPage() {
  const [fromLoc, setFromLoc] = useState("Sehore Bus Stand");
  const [toLoc, setToLoc] = useState("VIT Bhopal Outer Highway");
  const [direction, setDirection] = useState("SEHORE_TO_VIT");
  const [targetStop, setTargetStop] = useState("VIT Bhopal Outer Highway");
  const [etaData, setEtaData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchLiveEta = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/api/trips/TRIP-101/eta?mode=hybrid&direction=${direction}&targetStop=${encodeURIComponent(targetStop)}`);
      if (res.ok) {
        const data = await res.json();
        setEtaData(data);
      }
    } catch (err) {
      console.error("Failed to fetch live ETA:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveEta();
    const interval = setInterval(fetchLiveEta, 5000);
    return () => clearInterval(interval);
  }, [direction, targetStop]);

  const handleSwap = () => {
    if (direction === "SEHORE_TO_VIT") {
      setFromLoc("VIT Bhopal Outer Highway");
      setToLoc("Sehore Bus Stand");
      setDirection("VIT_TO_SEHORE");
      setTargetStop("Sehore Bus Stand");
    } else {
      setFromLoc("Sehore Bus Stand");
      setToLoc("VIT Bhopal Outer Highway");
      setDirection("SEHORE_TO_VIT");
      setTargetStop("VIT Bhopal Outer Highway");
    }
  };

  const getSignalBadge = (state) => {
    switch (state) {
      case 'LIVE':
        return {
          label: 'Live location • Updated just now',
          color: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          icon: Wifi
        };
      case 'PARTIAL':
        return {
          label: 'Live location unavailable • Using last known location',
          color: 'bg-amber-50 text-amber-800 border-amber-300',
          icon: SignalLow
        };
      case 'HISTORICAL':
        return {
          label: 'No recent live location',
          color: 'bg-slate-100 text-slate-800 border-slate-300',
          icon: SignalZero
        };
      default:
        return {
          label: 'Arrival time unavailable • Check again when bus is on route',
          color: 'bg-slate-100 text-slate-700 border-slate-200',
          icon: SignalZero
        };
    }
  };

  const badge = getSignalBadge(etaData ? etaData.data_state : 'NO_DATA');
  const BadgeIcon = badge.icon;

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-2">
      {/* 1. Simple Journey Search Form */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Search className="w-5 h-5 text-teal-600" />
          Find a Bus Journey
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* FROM Input */}
          <div className="md:col-span-5 relative">
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">
              From
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-teal-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                readOnly
                value={fromLoc}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-semibold focus:outline-none"
              />
            </div>
          </div>

          {/* Swap Button */}
          <div className="md:col-span-2 flex justify-center pt-2 md:pt-5">
            <button
              onClick={handleSwap}
              title="Swap Origin & Destination"
              className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 text-slate-600 hover:text-teal-600 hover:bg-teal-50 flex items-center justify-center transition-colors"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
          </div>

          {/* TO Input */}
          <div className="md:col-span-5 relative">
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">
              To
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-orange-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                readOnly
                value={toLoc}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-semibold focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={fetchLiveEta}
            className="w-full sm:w-auto px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" />
            Find Bus
          </button>
        </div>
      </div>

      {/* 2. Clean Journey Result Display */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        {/* Result Header & Signal Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200">
              Pilot Corridor Service
            </span>
            <h3 className="text-xl font-extrabold text-slate-900 mt-2">
              {direction === 'SEHORE_TO_VIT' ? 'Sehore Bus Stand → VIT Bhopal' : 'VIT Bhopal → Sehore Bus Stand'}
            </h3>
          </div>

          <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border ${badge.color}`}>
            <BadgeIcon className="w-4 h-4 shrink-0" />
            <span>{badge.label}</span>
          </div>
        </div>

        {/* ETA Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Main ETA */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center">
            <span className="text-xs font-medium text-slate-500 block mb-1">Estimated Arrival (ETA)</span>
            <div className="text-4xl font-extrabold text-slate-900 flex items-baseline justify-center gap-1">
              <span>{etaData && etaData.eta_minutes !== null ? etaData.eta_minutes : '--'}</span>
              <span className="text-base font-bold text-teal-600">min</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">Expected Remaining Time</span>
          </div>

          {/* Expected Range */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center">
            <span className="text-xs font-medium text-slate-500 block mb-1">ETA Range</span>
            <div className="text-2xl font-bold text-slate-800 flex items-center justify-center h-10">
              <span>{etaData && etaData.eta_range ? etaData.eta_range : '--'}</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">Uncertainty Bound</span>
          </div>

          {/* Confidence */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center">
            <span className="text-xs font-medium text-slate-500 block mb-1">Confidence</span>
            <div className="text-lg font-bold text-teal-700 flex items-center justify-center h-10">
              <span>{etaData ? (etaData.confidence_level || 'Normal') : 'Standby'}</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">Signal Reliability</span>
          </div>
        </div>

        {/* Bus Location Status */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3 text-xs text-slate-700">
          <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
          <div>
            <span className="font-bold text-slate-900">Current Position: </span>
            <span>
              {etaData && etaData.current_segment ? etaData.current_segment : 'Amlaha ➔ Toll Plaza'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Simple Route Map / Visualizer */}
      <CorridorVisualizer direction={direction} />
    </div>
  );
}
