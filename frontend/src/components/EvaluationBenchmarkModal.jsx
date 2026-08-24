import React, { useEffect, useState } from 'react';
import { X, BarChart3, Cpu, CheckCircle, Award, RefreshCw, AlertCircle } from 'lucide-react';
import { getEvaluationBenchmark } from '../services/api';

export default function EvaluationBenchmarkModal({ isOpen, onClose }) {
  const [benchData, setBenchData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchBenchmark();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  async function fetchBenchmark() {
    setLoading(true);
    setError(null);
    try {
      const res = await getEvaluationBenchmark();
      setBenchData(res);
    } catch (e) {
      console.error('Failed to fetch benchmark:', e);
      setError(e?.message || 'Failed to load empirical benchmark statistics from backend.');
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="benchmark-modal-title"
    >
      <div className="bg-[#0e1526] border border-slate-700/80 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <Award className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 id="benchmark-modal-title" className="text-base font-bold text-white flex items-center gap-2">
                EVALUATION & BENCHMARK STUDIO
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                  EMPIRICAL BACKTEST
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Comparative evaluation: Amazon Chronos-2 vs Baseline Forecaster on verified SQLite logs
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
            <span className="text-xs">Computing empirical benchmark statistics...</span>
          </div>
        ) : error ? (
          <div className="py-8 flex flex-col items-center justify-center gap-3 text-center">
            <AlertCircle className="w-8 h-8 text-red-400" />
            <p className="text-xs text-slate-300 max-w-md">{error}</p>
            <button
              onClick={fetchBenchmark}
              className="mt-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-mono flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry Calculation
            </button>
          </div>
        ) : benchData?.total_samples === 0 ? (
          <div className="py-8 text-center space-y-3">
            <p className="text-xs text-slate-300">
              {benchData.message || 'No evaluation logs recorded yet.'}
            </p>
            <p className="text-[11px] text-slate-500">
              Run navigation trips or simulate routes to log empirical predictions and evaluate error metrics.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
                <span className="text-[11px] font-mono text-slate-400 block mb-1">MAE Reduction</span>
                <span className="text-2xl font-extrabold text-emerald-400">
                  {benchData.improvement_pct?.mae_reduction}%
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Chronos-2 vs Baseline</span>
              </div>

              <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
                <span className="text-[11px] font-mono text-slate-400 block mb-1">RMSE Reduction</span>
                <span className="text-2xl font-extrabold text-cyan-400">
                  {benchData.improvement_pct?.rmse_reduction}%
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Lower prediction variance</span>
              </div>

              <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
                <span className="text-[11px] font-mono text-slate-400 block mb-1">Samples Evaluated</span>
                <span className="text-2xl font-extrabold text-purple-400">
                  {benchData.total_samples}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Logged observations</span>
              </div>
            </div>

            {/* Error Metrics Table */}
            <div className="bg-slate-900/60 rounded-2xl p-4 border border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-400" />
                Error Metrics Comparison (Congestion % Prediction)
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="text-slate-400 font-mono text-[11px] border-b border-slate-800">
                      <th className="pb-2">Model</th>
                      <th className="pb-2">MAE (%)</th>
                      <th className="pb-2">RMSE (%)</th>
                      <th className="pb-2">MAPE (%)</th>
                      <th className="pb-2 text-right">Advantage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    <tr className="text-slate-300">
                      <td className="py-2.5 font-sans font-medium">Linear / EMA Baseline</td>
                      <td className="py-2.5 text-amber-300">{benchData.metrics?.baseline?.mae}%</td>
                      <td className="py-2.5">{benchData.metrics?.baseline?.rmse}%</td>
                      <td className="py-2.5">{benchData.metrics?.baseline?.mape}%</td>
                      <td className="py-2.5 text-right text-slate-500">Baseline</td>
                    </tr>
                    <tr className="text-emerald-300 bg-emerald-950/20 font-semibold">
                      <td className="py-2.5 font-sans flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                        Chronos-2 / Quantile Inference
                      </td>
                      <td className="py-2.5 text-emerald-400">{benchData.metrics?.chronos2?.mae}%</td>
                      <td className="py-2.5 text-emerald-400">{benchData.metrics?.chronos2?.rmse}%</td>
                      <td className="py-2.5 text-emerald-400">{benchData.metrics?.chronos2?.mape}%</td>
                      <td className="py-2.5 text-right text-emerald-400 font-bold">
                        +{benchData.improvement_pct?.mae_reduction}% Better
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* System End-to-End Navigation Impact */}
            <div className="bg-slate-900/60 rounded-2xl p-4 border border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                End-to-End Routing System Impact
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Avg Travel Time</span>
                  <div className="font-bold text-white mt-0.5">
                    {benchData.system_impact?.proposed_avg_travel_time_min} min
                  </div>
                  <span className="text-[10px] text-emerald-400">
                    vs {benchData.system_impact?.baseline_avg_travel_time_min} min (Baseline)
                  </span>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">ETA Prediction Error</span>
                  <div className="font-bold text-white mt-0.5">
                    {benchData.system_impact?.eta_error_proposed_min} min
                  </div>
                  <span className="text-[10px] text-emerald-400">
                    vs {benchData.system_impact?.eta_error_baseline_min} min (Baseline)
                  </span>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Traffic Exposure Cut</span>
                  <div className="font-bold text-emerald-400 mt-0.5">
                    -{benchData.system_impact?.traffic_exposure_reduction_pct}%
                  </div>
                  <span className="text-[10px] text-slate-400">Reduced stop-and-go delays</span>
                </div>
              </div>
            </div>

            {/* Footer notice */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
              <span>All metrics computed directly from empirical dataset stored in SQLite database.</span>
              <button
                onClick={fetchBenchmark}
                className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-mono cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" /> Refresh
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
