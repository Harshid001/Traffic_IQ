const tags = {
  best: { label: '⭐ Smart Recommendation', cls: 'bg-primary/15 text-primary-bright border-primary/30' },
  fastest: { label: '⚡ Fastest Time', cls: 'bg-fastest/15 text-fastest border-fastest/30' },
  alt: { label: 'Alternative Route', cls: 'bg-slate-400/15 text-slate-300 border-white/10' }
};

const borders = {
  best: 'border-primary/60 bg-primary/5 hover:border-primary',
  fastest: 'border-fastest/50 bg-fastest/5 hover:border-fastest',
  alt: 'border-white/10 hover:border-white/20'
};

export default function RouteCard({ route }) {
  const tag = tags[route.type] || tags.alt;
  const border = borders[route.type] || borders.alt;

  const accessibleSummary = `${tag.label}: ${route.name}, estimated ${route.eta} minutes for ${route.dist} kilometers. Congestion is ${route.cong} percent, on-time reliability is ${route.reliability} percent, toll cost is ${route.toll} rupees.`;

  return (
    <article
      aria-label={accessibleSummary}
      className={`rounded-2xl border p-4 bg-card transition-all duration-200 ${border}`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${tag.cls}`}>
          {tag.label}
        </span>
        {route.delta !== 0 && (
          <span className="text-xs font-medium text-slate-300">
            {route.delta > 0 ? `+${route.delta} min slower` : `${Math.abs(route.delta)} min faster`}
          </span>
        )}
      </div>

      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display font-bold text-slate-100 text-base">{route.name}</h3>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="font-display text-2xl font-bold text-primary leading-tight">{route.eta} <span className="text-sm font-normal text-slate-300">min</span></div>
          <div className="text-xs text-slate-400">{route.dist} km</div>
        </div>
      </div>

      <div className="flex gap-2 mt-3 flex-wrap">
        <span className="text-xs text-slate-300 bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg">
          Traffic: <b className="text-slate-100 font-semibold">{route.cong}%</b>
        </span>
        <span className="text-xs text-slate-300 bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg">
          On-Time: <b className="text-slate-100 font-semibold">{route.reliability}%</b>
        </span>
        <span className="text-xs text-slate-300 bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg">
          Tolls: <b className="text-slate-100 font-semibold">₹{route.toll}</b>
        </span>
      </div>
    </article>
  );
}