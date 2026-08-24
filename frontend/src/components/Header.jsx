import React from 'react';
import { Activity, ShieldCheck, Cpu, Compass, BarChart3, Radio, Play, Pause } from 'lucide-react';

export default function Header({
  routingProvenance,
  trafficProvenance,
  onOpenBenchmark,
  isSimulatingDrive,
  onToggleSimulateDrive,
  trafficMode,
  onToggleTrafficMode,
}) {
  return (
    <header className="sticky top-0 z-30 w-full bg-[#0c121e]/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-6 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 p-0.5 shadow-lg shadow-emerald-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-[#0a0f1d] rounded-[10px] flex items-center justify-center">
              <Compass className="w-5 h-5 text-emerald-400 animate-spin-slow" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                TRAFFIC INTELLIGENCE
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  v2.0 PREDICTIVE
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400">
              Deterministic Multi-Objective Scoring &bull; Chronos-2 Forecasting &bull; Zero-Hallucination Local AI
            </p>
          </div>
        </div>

        {/* Provenance Badges & Live Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Traffic Provenance Badge */}
          <button
            onClick={onToggleTrafficMode}
            title="Click to toggle between REAL and DEMO traffic mode"
            className={`flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-full border transition-all ${
              trafficProvenance === 'LIVE'
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 shadow-sm shadow-emerald-500/20'
                : 'bg-indigo-950/60 border-indigo-500/40 text-indigo-300'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                trafficProvenance === 'LIVE' ? 'bg-emerald-400 animate-ping' : 'bg-indigo-400'
              }`}
            />
            <span>TRAFFIC: {trafficProvenance || 'DEMO'}</span>
          </button>

          {/* Routing Provenance Badge */}
          <div className="flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>ROUTING: {routingProvenance || 'PUBLIC'}</span>
          </div>

          {/* Forecaster Badge */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-full bg-blue-950/60 border border-blue-500/30 text-blue-300">
            <Cpu className="w-3.5 h-3.5 text-blue-400" />
            <span>CHRONOS-2</span>
          </div>

          {/* Local AI Validator Badge */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            <span>ZERO-HALLUCINATION</span>
          </div>

          {/* Driving Simulation Toggle */}
          <button
            onClick={onToggleSimulateDrive}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
              isSimulatingDrive
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 animate-pulse'
                : 'bg-slate-800/90 border-slate-700 hover:border-slate-600 text-slate-200'
            }`}
          >
            {isSimulatingDrive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isSimulatingDrive ? 'Driving Active' : 'Simulate Drive'}</span>
          </button>

          {/* Evaluation Benchmark Modal Button */}
          <button
            onClick={onOpenBenchmark}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 transition-all shadow-sm"
          >
            <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">Benchmark Studio</span>
          </button>
        </div>
      </div>
    </header>
  );
}
