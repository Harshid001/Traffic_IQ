import React from 'react';
import { Zap, Star, TrendingUp, TrendingDown, Minus, Clock, ShieldCheck, AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react';

export default function RouteComparison({
  routes = [],
  fastestRouteId,
  bestRouteId,
  selectedRouteId,
  onSelectRoute,
  areDifferent,
}) {
  const fastestRoute = routes.find((r) => r.id === fastestRouteId) || routes[0];
  const bestRoute = routes.find((r) => r.id === bestRouteId) || routes[0];

  const getTrendIcon = (trend) => {
    if (trend === 'WORSENING') return <TrendingUp className="w-3.5 h-3.5 text-red-400" />;
    if (trend === 'CLEARING') return <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />;
    return <Minus className="w-3.5 h-3.5 text-slate-400" />;
  };

  const getReliabilityBadge = (rel) => {
    const label = rel?.reliability_label || 'Medium';
    if (label === 'High') {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-1">
          <ShieldCheck className="w-3 h-3" /> High ({rel?.reliability_score})
        </span>
      );
    }
    if (label === 'Medium') {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center gap-1">
          Medium ({rel?.reliability_score})
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-1">
        <AlertTriangle className="w-3 h-3" /> Low ({rel?.reliability_score})
      </span>
    );
  };

  if (!fastestRoute || !bestRoute) return null;

  return (
    <div className="flex flex-col gap-4">
      {/* Route Decision Summary Banner */}
      <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-300">Route Decision Verdict:</span>
          {areDifferent ? (
            <span className="text-amber-300 font-medium flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 shrink-0" /> Fastest and <Star className="w-3.5 h-3.5 fill-amber-300 shrink-0" /> Best Route differ &bull; Trade-off analysis active
            </span>
          ) : (
            <span className="text-emerald-300 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Optimal Alignment &bull; Fastest route is also Best Route
            </span>
          )}
        </div>
        <span className="font-mono text-slate-400 text-[11px]">{routes.length} candidate paths evaluated</span>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* FASTEST ROUTE CARD */}
        <div
          onClick={() => onSelectRoute(fastestRoute.id)}
          className={`cursor-pointer rounded-2xl p-5 border transition-all duration-200 relative overflow-hidden ${
            selectedRouteId === fastestRoute.id
              ? 'bg-amber-950/20 border-amber-500/60 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/30'
              : 'glass-panel hover:border-slate-700'
          }`}
        >
          {/* Top Label */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                <Zap className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 font-mono">
                  FASTEST ROUTE
                </span>
                <div className="text-sm font-semibold text-white truncate max-w-[220px]">
                  {fastestRoute.name}
                </div>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              argmin(P50 ETA)
            </span>
          </div>

          {/* Primary Metric: P50 ETA & Quantiles */}
          <div className="flex items-baseline justify-between mb-4 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <div>
              <span className="text-3xl font-extrabold text-white tracking-tight">
                {fastestRoute.predicted_eta_p50}
              </span>
              <span className="text-sm text-slate-400 ml-1">min</span>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase font-mono text-slate-400">Forecast Uncertainty</div>
              <div className="text-xs font-mono font-medium text-amber-300">
                P10: {fastestRoute.predicted_eta_p10}m &bull; P90: {fastestRoute.predicted_eta_p90}m
              </div>
            </div>
          </div>

          {/* Detailed Attributes Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs mb-3">
            <div className="bg-slate-900/40 p-2 rounded-lg border border-slate-800/80">
              <span className="text-slate-400 text-[10px] block">Current Congestion</span>
              <span className={`font-semibold ${fastestRoute.avg_congestion > 50 ? 'text-red-400' : 'text-slate-200'}`}>
                {fastestRoute.avg_congestion}% ({fastestRoute.congestion_category})
              </span>
            </div>

            <div className="bg-slate-900/40 p-2 rounded-lg border border-slate-800/80">
              <span className="text-slate-400 text-[10px] block">Traffic Trend</span>
              <span className="font-semibold text-slate-200 flex items-center gap-1">
                {getTrendIcon(fastestRoute.trend)}
                {fastestRoute.trend} ({fastestRoute.trend_delta_pct > 0 ? `+${fastestRoute.trend_delta_pct}%` : `${fastestRoute.trend_delta_pct}%`})
              </span>
            </div>

            <div className="bg-slate-900/40 p-2 rounded-lg border border-slate-800/80">
              <span className="text-slate-400 text-[10px] block">20m Future Forecast</span>
              <span className="font-semibold text-slate-200">
                {fastestRoute.forecast_20m_p50}% (P50)
              </span>
            </div>

            <div className="bg-slate-900/40 p-2 rounded-lg border border-slate-800/80">
              <span className="text-slate-400 text-[10px] block">Historical Reliability</span>
              <div className="mt-0.5">{getReliabilityBadge(fastestRoute.reliability)}</div>
            </div>
          </div>

          {/* Sub-bar footer */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/60">
            <span>Dist: {fastestRoute.distance_km} km &bull; Toll: ₹{fastestRoute.toll_cost}</span>
            <span className="font-semibold text-slate-300">Score: {fastestRoute.score}/100</span>
          </div>
        </div>

        {/* BEST ROUTE CARD */}
        <div
          onClick={() => onSelectRoute(bestRoute.id)}
          className={`cursor-pointer rounded-2xl p-5 border transition-all duration-200 relative overflow-hidden ${
            selectedRouteId === bestRoute.id
              ? 'bg-emerald-950/25 border-emerald-500/70 shadow-lg shadow-emerald-500/15 ring-1 ring-emerald-500/40 animate-glow'
              : 'glass-panel hover:border-slate-700'
          }`}
        >
          {/* Top Label */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                <Star className="w-4 h-4 text-emerald-400 fill-emerald-400/30" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 font-mono">
                  BEST FOR YOU
                </span>
                <div className="text-sm font-semibold text-white truncate max-w-[220px]">
                  {bestRoute.name}
                </div>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 font-bold">
              Score: {bestRoute.score}/100
            </span>
          </div>

          {/* Primary Metric: P50 ETA & Quantiles */}
          <div className="flex items-baseline justify-between mb-4 bg-emerald-950/30 p-3 rounded-xl border border-emerald-500/20">
            <div>
              <span className="text-3xl font-extrabold text-emerald-300 tracking-tight">
                {bestRoute.predicted_eta_p50}
              </span>
              <span className="text-sm text-slate-400 ml-1">min</span>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase font-mono text-emerald-400/80">Forecast Uncertainty</div>
              <div className="text-xs font-mono font-medium text-emerald-300">
                P10: {bestRoute.predicted_eta_p10}m &bull; P90: {bestRoute.predicted_eta_p90}m
              </div>
            </div>
          </div>

          {/* Detailed Attributes Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs mb-3">
            <div className="bg-slate-900/40 p-2 rounded-lg border border-slate-800/80">
              <span className="text-slate-400 text-[10px] block">Current Congestion</span>
              <span className="font-semibold text-emerald-400">
                {bestRoute.avg_congestion}% ({bestRoute.congestion_category})
              </span>
            </div>

            <div className="bg-slate-900/40 p-2 rounded-lg border border-slate-800/80">
              <span className="text-slate-400 text-[10px] block">Traffic Trend</span>
              <span className="font-semibold text-slate-200 flex items-center gap-1">
                {getTrendIcon(bestRoute.trend)}
                {bestRoute.trend} ({bestRoute.trend_delta_pct > 0 ? `+${bestRoute.trend_delta_pct}%` : `${bestRoute.trend_delta_pct}%`})
              </span>
            </div>

            <div className="bg-slate-900/40 p-2 rounded-lg border border-slate-800/80">
              <span className="text-slate-400 text-[10px] block">20m Future Forecast</span>
              <span className="font-semibold text-emerald-300">
                {bestRoute.forecast_20m_p50}% (P50)
              </span>
            </div>

            <div className="bg-slate-900/40 p-2 rounded-lg border border-slate-800/80">
              <span className="text-slate-400 text-[10px] block">Historical Reliability</span>
              <div className="mt-0.5">{getReliabilityBadge(bestRoute.reliability)}</div>
            </div>
          </div>

          {/* Sub-bar footer */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/60">
            <span>Dist: {bestRoute.distance_km} km &bull; Health: {bestRoute.route_health}/100</span>
            <span className="font-semibold text-emerald-400">Recommended Match</span>
          </div>
        </div>
      </div>
    </div>
  );
}
