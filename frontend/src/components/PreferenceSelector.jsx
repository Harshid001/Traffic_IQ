import React from 'react';
import { Sliders, ShieldCheck, Zap, DollarSign, Scale, Layers } from 'lucide-react';

const PRESETS = [
  { id: 'BALANCED', label: 'Balanced', icon: Scale, desc: 'Optimal trade-off across all factors' },
  { id: 'MOST_RELIABLE', label: 'Most Reliable', icon: ShieldCheck, desc: 'Prioritizes predictable travel times & low spread' },
  { id: 'LOWEST_TRAFFIC', label: 'Lowest Traffic', icon: Layers, desc: 'Avoids heavy congestion & bottlenecks' },
  { id: 'AVOID_TOLLS', label: 'Avoid Tolls', icon: DollarSign, desc: 'Prefers non-toll arterial corridors' },
  { id: 'FASTEST', label: 'Fastest Priority', icon: Zap, desc: 'Heavily weights lowest predicted ETA' },
];

export default function PreferenceSelector({
  currentProfile,
  onSelectProfile,
}) {
  return (
    <div className="glass-panel rounded-2xl p-4 border border-slate-800">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            User Objective Profile
          </h3>
        </div>
        <span className="text-[10px] font-mono text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30">
          {currentProfile}
        </span>
      </div>

      {/* Preset Pill Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {PRESETS.map((p) => {
          const isSelected = currentProfile === p.id;
          const Icon = p.icon;
          return (
            <button
              key={p.id}
              onClick={() => onSelectProfile(p.id)}
              className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                isSelected
                  ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200 shadow-md shadow-emerald-500/10 ring-1 ring-emerald-500/30'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`} />
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
              </div>
              <div>
                <div className="text-xs font-bold">{p.label}</div>
                <div className="text-[9px] text-slate-400 leading-tight mt-0.5 line-clamp-1">
                  {p.desc}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
