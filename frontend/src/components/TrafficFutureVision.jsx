import React from 'react';
import { Eye, TrendingUp, TrendingDown, Clock, ShieldAlert, Cpu } from 'lucide-react';

export default function TrafficFutureVision({ selectedRoute }) {
  if (!selectedRoute) return null;

  const currentCong = selectedRoute.avg_congestion || 35;
  const segments = selectedRoute.segments || [];
  const segmentForecasts = selectedRoute.segment_forecasts || [];

  // Aggregate forecast points across segments for route level
  const horizons = [
    { label: 'NOW', minutes: 0, p10: Math.max(0, currentCong - 4), p50: currentCong, p90: Math.min(100, currentCong + 5) },
    { label: '+10 MIN', minutes: 10, p10: 0, p50: 0, p90: 0 },
    { label: '+20 MIN', minutes: 20, p10: 0, p50: 0, p90: 0 },
    { label: '+30 MIN', minutes: 30, p10: 0, p50: 0, p90: 0 },
  ];

  if (segmentForecasts.length > 0) {
    for (let i = 0; i < 3; i++) {
      const idx = i + 1; // 1, 2, 3 in horizons
      let sumP10 = 0, sumP50 = 0, sumP90 = 0;
      segmentForecasts.forEach((sf) => {
        const pt = sf.forecast_points[i];
        sumP10 += pt.congestion_p10;
        sumP50 += pt.congestion_p50;
        sumP90 += pt.congestion_p90;
      });
      const count = segmentForecasts.length;
      horizons[idx].p10 = Math.round(sumP10 / count);
      horizons[idx].p50 = Math.round(sumP50 / count);
      horizons[idx].p90 = Math.round(sumP90 / count);
    }
  } else {
    // Standard forecast curve fallback
    const trend = selectedRoute.trend || 'STABLE';
    const delta = trend === 'WORSENING' ? 8 : (trend === 'CLEARING' ? -7 : 1);
    horizons[1].p50 = Math.max(5, Math.min(95, currentCong + delta));
    horizons[1].p10 = Math.max(0, horizons[1].p50 - 6);
    horizons[1].p90 = Math.min(100, horizons[1].p50 + 8);

    horizons[2].p50 = Math.max(5, Math.min(95, currentCong + delta * 2));
    horizons[2].p10 = Math.max(0, horizons[2].p50 - 10);
    horizons[2].p90 = Math.min(100, horizons[2].p50 + 12);

    horizons[3].p50 = Math.max(5, Math.min(95, currentCong + delta * 3));
    horizons[3].p10 = Math.max(0, horizons[3].p50 - 14);
    horizons[3].p90 = Math.min(100, horizons[3].p50 + 16);
  }

  const getPillColor = (val) => {
    if (val < 25) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    if (val < 50) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40';
    if (val < 75) return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
    return 'bg-red-500/20 text-red-400 border-red-500/40';
  };

  const trend = selectedRoute.trend || 'STABLE';
  const delta20m = horizons[2].p50 - currentCong;

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
            <Eye className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              TRAFFIC FUTURE VISION
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-500/30">
                Chronos-2
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">Probabilistic Near-Future Horizon for {selectedRoute.name}</p>
          </div>
        </div>

        {/* Change Alert Badge */}
        {trend === 'WORSENING' && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/80 border border-red-500/40 text-red-300 text-xs font-semibold animate-pulse">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Traffic Worsening (+{Math.abs(Math.round(delta20m))}%)</span>
          </div>
        )}
        {trend === 'CLEARING' && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Traffic Clearing (-{Math.abs(Math.round(delta20m))}%)</span>
          </div>
        )}
        {trend === 'STABLE' && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium">
            <span>Stable Flow</span>
          </div>
        )}
      </div>

      {/* 4-Step Forecast Timeline Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {horizons.map((h, i) => {
          const spread = h.p90 - h.p10;
          return (
            <div
              key={i}
              className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/90 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2">
                <span>{h.label}</span>
                <Clock className="w-3 h-3 text-slate-500" />
              </div>

              <div className="my-1">
                <span className={`text-2xl font-extrabold px-2 py-0.5 rounded-lg border inline-block ${getPillColor(h.p50)}`}>
                  {h.p50}%
                </span>
                <span className="text-[10px] text-slate-400 block mt-1 font-mono">P50 Central</span>
              </div>

              <div className="pt-2 mt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-400 flex items-center justify-between">
                <span>P10: {h.p10}%</span>
                <span>P90: {h.p90}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Uncertainty Band Bar Visualizer */}
      <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800 text-xs">
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
          <span className="font-medium text-slate-300">Confidence Band at +20 Min:</span>
          <span className="font-mono text-cyan-300">
            P10 ({horizons[2].p10}%) &mdash; P50 ({horizons[2].p50}%) &mdash; P90 ({horizons[2].p90}%)
          </span>
        </div>
        <div className="relative w-full h-3 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="absolute top-0 bottom-0 bg-cyan-500/30 border-l border-r border-cyan-400"
            style={{
              left: `${horizons[2].p10}%`,
              width: `${Math.max(4, horizons[2].p90 - horizons[2].p10)}%`,
            }}
          />
          <div
            className="absolute top-0 bottom-0 w-2 bg-emerald-400 rounded-full shadow-lg shadow-emerald-500/50 transform -translate-x-1"
            style={{ left: `${horizons[2].p50}%` }}
          />
        </div>
      </div>
    </div>
  );
}
