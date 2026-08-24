import React, { useEffect, useState } from 'react';
import { BarChart, Clock, Calendar, Sparkles } from 'lucide-react';
import { getTrafficDna } from '../services/api';

export default function TrafficDnaChart({ selectedRoute }) {
  const [dnaData, setDnaData] = useState([]);
  const [selectedHour, setSelectedHour] = useState(new Date().getHours());
  const [loading, setLoading] = useState(false);

  const segment = selectedRoute?.segments?.[0];
  const segmentId = segment?.segment_id || 'SEG_MG_ROAD';
  const roadName = segment?.road_name || 'Primary Corridor';

  useEffect(() => {
    async function fetchDna() {
      setLoading(true);
      try {
        const res = await getTrafficDna(segmentId);
        setDnaData(res.dna || []);
      } catch (e) {
        console.error('Failed to fetch Traffic DNA:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchDna();
  }, [segmentId]);

  const getBarColor = (val) => {
    if (val < 25) return '#10b981'; // green
    if (val < 50) return '#eab308'; // yellow
    if (val < 75) return '#f97316'; // orange
    return '#ef4444'; // red
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-teal-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              TRAFFIC DNA (24-Hour Road Behavioral Profile)
            </h3>
            <p className="text-[11px] text-slate-400">Historical diurnal rhythm for {roadName}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <Calendar className="w-3.5 h-3.5 text-teal-400" />
          <span>14-Day Baseline</span>
        </div>
      </div>

      {/* Hourly Bar Chart */}
      <div className="h-32 flex items-end gap-1 sm:gap-1.5 pt-4 pb-1 px-1 bg-slate-900/60 rounded-xl border border-slate-800/80 relative">
        {dnaData.map((d) => {
          const isCurrentHour = d.hour === new Date().getHours();
          const isSelected = d.hour === selectedHour;
          const heightPct = Math.max(8, Math.min(100, d.avg_congestion));
          const color = getBarColor(d.avg_congestion);

          return (
            <div
              key={d.hour}
              onMouseEnter={() => setSelectedHour(d.hour)}
              className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
            >
              {/* Tooltip on hover */}
              {isSelected && (
                <div className="absolute -top-10 z-20 bg-slate-900 px-2 py-1 rounded border border-slate-700 text-[10px] font-mono text-white whitespace-nowrap shadow-xl">
                  {d.label}: {d.avg_congestion}%
                </div>
              )}

              {/* Bar */}
              <div
                style={{
                  height: `${heightPct}%`,
                  backgroundColor: color,
                  opacity: isSelected ? 1 : isCurrentHour ? 0.9 : 0.65,
                }}
                className={`w-full rounded-t transition-all duration-150 ${
                  isSelected ? 'ring-2 ring-white scale-105' : ''
                }`}
              />

              {/* Hour tick (every 3 hours) */}
              {d.hour % 3 === 0 && (
                <span className="text-[9px] font-mono text-slate-500 mt-1 absolute -bottom-5">
                  {d.hour}h
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-5 mt-2">
        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span> Low (&lt;25%)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-yellow-500"></span> Moderate (25-50%)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-orange-500"></span> Heavy (50-75%)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-red-500"></span> Severe (&gt;75%)
          </span>
        </div>
        <div className="text-[11px] font-mono text-slate-300">
          Peak Hours: 08:00–10:00 &bull; 17:30–20:00
        </div>
      </div>
    </div>
  );
}
