import React from 'react';
import { Bus, Search, MapPin, Navigation, Cpu, BookOpen, Wifi, WifiOff } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, socketConnected, latestEvent }) {
  const navItems = [
    { id: 'home', label: 'Home', icon: Bus },
    { id: 'dashboard', label: 'Find a Bus', icon: Search },
    { id: 'routes', label: 'Routes', icon: MapPin },
    { id: 'insights', label: 'Research', icon: Cpu },
    { id: 'conductor', label: 'Conductor', icon: Navigation },
    { id: 'simulator', label: 'Demo Simulator', icon: Cpu },
    { id: 'about', label: 'About', icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 px-4 lg:px-8 py-3 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('home')}>
          <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center shadow-sm">
            <Bus className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-slate-900">
                Transit<span className="text-teal-600">IQ</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium hidden sm:block">Public Transit Information</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-teal-50 text-teal-700 border border-teal-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Realtime Backend Socket Connection Pill */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs font-medium text-slate-600">
          {socketConnected ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
              </span>
              <span className="text-teal-700 font-medium flex items-center gap-1">
                Live Server
              </span>
            </>
          ) : (
            <>
              <span className="h-2 w-2 rounded-full bg-slate-400"></span>
              <span className="text-slate-500 flex items-center gap-1">
                Server Standby
              </span>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
