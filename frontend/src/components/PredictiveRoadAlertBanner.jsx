import React from 'react';
import { AlertTriangle, TrendingUp, Sparkles, X, ArrowRight, ShieldAlert } from 'lucide-react';

export default function PredictiveRoadAlertBanner({
  alert,
  onDismiss,
  onSwitchRoute,
}) {
  if (!alert) return null;

  const isBetterRoute = alert.level === 'BETTER_ROUTE_AVAILABLE';
  const isWorsening = alert.level === 'TRAFFIC_WORSENING';

  return (
    <div className="w-full animate-slide-up mb-4">
      <div
        className={`p-4 rounded-2xl border shadow-2xl backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          isBetterRoute
            ? 'bg-emerald-950/90 border-emerald-500/80 text-emerald-100 shadow-emerald-500/20'
            : isWorsening
            ? 'bg-amber-950/90 border-amber-500/80 text-amber-100 shadow-amber-500/20'
            : 'bg-red-950/90 border-red-500/80 text-red-100 shadow-red-500/20'
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              isBetterRoute
                ? 'bg-emerald-500/30 text-emerald-300'
                : isWorsening
                ? 'bg-amber-500/30 text-amber-300'
                : 'bg-red-500/30 text-red-300'
            }`}
          >
            {isBetterRoute ? (
              <Sparkles className="w-5 h-5" />
            ) : isWorsening ? (
              <TrendingUp className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-black/40">
                PROACTIVE DRIVING ALERT &bull; {alert.timestamp}
              </span>
            </div>
            <h4 className="text-sm font-bold mt-0.5">{alert.title}</h4>
            <p className="text-xs opacity-90 mt-0.5">{alert.message}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          {isBetterRoute && alert.suggested_route_id && (
            <button
              onClick={() => onSwitchRoute(alert.suggested_route_id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg transition-all"
            >
              <span>{alert.action_label || 'Switch Route'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={onDismiss}
            className="p-1.5 rounded-lg bg-black/20 hover:bg-black/40 text-slate-300 hover:text-white transition-colors"
            title="Dismiss Alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
