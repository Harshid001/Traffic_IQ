import React, { useEffect, useState } from 'react';
import { CalendarClock, CheckCircle, ArrowRight, Sparkles, Clock } from 'lucide-react';
import { simulateWhatIf } from '../services/api';

export default function WhatIfDeparture({ routes }) {
  const [whatIfData, setWhatIfData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!routes || routes.length === 0) return;
    async function runSim() {
      setLoading(true);
      try {
        const res = await simulateWhatIf(routes);
        setWhatIfData(res);
      } catch (e) {
        console.error('What-if simulation error:', e);
      } finally {
        setLoading(false);
      }
    }
    runSim();
  }, [routes]);

  if (!whatIfData) return null;

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
            <CalendarClock className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              WHAT-IF DEPARTURE PLANNER
            </h3>
            <p className="text-[11px] text-slate-400">Forecasted travel times if departing at future intervals</p>
          </div>
        </div>

        {/* Optimal Recommendation Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Optimal: {whatIfData.optimal_departure_window}</span>
        </div>
      </div>

      {/* Recommendation Banner */}
      <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800 text-xs mb-4 text-slate-200 flex items-center gap-2">
        <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
        <span className="font-medium">{whatIfData.recommendation}</span>
      </div>

      {/* Scenario Columns */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {whatIfData.departure_evaluations.map((sc, i) => {
          const isOptimal = sc.label === whatIfData.optimal_departure_window;
          return (
            <div
              key={i}
              className={`p-3.5 rounded-xl border transition-all ${
                isOptimal
                  ? 'bg-cyan-950/30 border-cyan-500/60 shadow-lg shadow-cyan-500/10'
                  : 'bg-slate-900/50 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-mono mb-2">
                <span className={isOptimal ? 'text-cyan-300 font-bold' : 'text-slate-400'}>
                  {sc.label}
                </span>
                {isOptimal && <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />}
              </div>

              <div className="text-2xl font-extrabold text-white mb-1">
                {sc.lowest_eta_min} <span className="text-xs font-normal text-slate-400">min</span>
              </div>

              <div className="text-[10px] text-slate-400 truncate mt-1">
                Via {sc.best_route_name}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
