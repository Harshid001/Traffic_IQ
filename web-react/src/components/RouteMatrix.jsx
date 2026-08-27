export default function RouteMatrix({ routes, selectedRouteId, onSelectRoute }) {
  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
          Compare Routes
        </span>
        <span className="text-xs text-slate-500">
          Select a route to see it on the map
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {routes.map((r) => {
          const isSelected = r.id === selectedRouteId;
          const isBest = r.type === 'best';
          const isFastest = r.type === 'fastest';

          return (
            <div
              key={r.id}
              onClick={() => onSelectRoute(r.id)}
              className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${
                isSelected
                  ? isBest
                    ? 'border-primary bg-primary/10 shadow-glow'
                    : isFastest
                    ? 'border-fastest bg-fastest/10 shadow-md'
                    : 'border-white/30 bg-white/5 shadow-sm'
                  : 'border-white/10 bg-card hover:border-white/20 hover:bg-surface hover:-translate-y-0.5'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                      isBest
                        ? 'bg-primary/20 text-primary-bright border-primary/30'
                        : isFastest
                        ? 'bg-fastest/20 text-fastest border-fastest/30'
                        : 'bg-slate-400/10 text-slate-300 border-white/10'
                    }`}
                  >
                    {isBest ? '✅ Recommended' : isFastest ? '⚡ Fastest' : '🛤️ Scenic'}
                  </span>
                  {isSelected && (
                    <span className="text-[0.65rem] uppercase font-bold text-primary px-1.5 py-0.5 rounded bg-primary/20 animate-fadeUp">
                      VIEWING
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <span className="font-display text-xl font-bold text-slate-100">
                    {r.eta}{' '}
                    <span className="text-xs font-normal text-slate-400">min</span>
                  </span>
                </div>
              </div>

              {/* Title & Delta */}
              <div className="flex items-baseline justify-between gap-2 mb-3">
                <h3 className="font-display font-semibold text-slate-100 text-sm">
                  {r.name}
                </h3>
                <span className="text-xs text-slate-400">
                  {r.dist} km · Toll: <strong className="text-slate-200">₹{r.toll}</strong>
                </span>
              </div>

              {/* ETA Range Visualizer — Plain English */}
              <div className="mb-3 bg-ink/60 border border-white/5 rounded-xl p-2.5">
                <div className="flex items-center justify-between text-[0.7rem] text-slate-400 mb-1.5">
                  <span>Best case: <strong className="text-emerald-400">{r.p10} min</strong></span>
                  <span className="text-primary-bright font-semibold">Expected: {r.p50} min</span>
                  <span>Worst case: <strong className="text-red-400">{r.p90} min</strong></span>
                </div>

                {/* Progress bar representing variance spread */}
                <div className="relative w-full h-2 rounded-full bg-surface overflow-hidden">
                  <div
                    className="absolute top-0 bottom-0 rounded-full transition-all duration-500"
                    style={{
                      left: `${((r.p10 - 20) / 30) * 100}%`,
                      width: `${((r.p90 - r.p10) / 30) * 100}%`,
                      backgroundColor: isBest ? '#38BDF8' : isFastest ? '#FBBF24' : '#94A3B8'
                    }}
                  />
                </div>
                <div className="text-[0.65rem] text-slate-400 mt-1 flex justify-between">
                  <span>Variance: ±{(r.p90 - r.p10) / 2} min</span>
                  <span>
                    Reliability: <b className={`${r.reliability >= 85 ? 'text-emerald-400' : 'text-amber-400'}`}>{r.reliability}%</b>
                  </span>
                </div>
              </div>

              {/* Rationale description */}
              <p className="text-xs text-slate-300 leading-relaxed">
                {r.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
