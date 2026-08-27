import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import CopilotWidget from '../components/CopilotWidget';
import Reveal from '../components/Reveal';
import { CORRIDORS } from '../data';

export default function Copilot() {
  const [corridor, setCorridor] = useState(CORRIDORS[0]);
  const tabRefs = useRef([]);

  const handleTabKeyDown = (e, index) => {
    let nextIndex = index;
    if (e.key === 'ArrowRight') {
      nextIndex = (index + 1) % CORRIDORS.length;
    } else if (e.key === 'ArrowLeft') {
      nextIndex = (index - 1 + CORRIDORS.length) % CORRIDORS.length;
    } else if (e.key === 'Home') {
      nextIndex = 0;
    } else if (e.key === 'End') {
      nextIndex = CORRIDORS.length - 1;
    } else {
      return;
    }

    e.preventDefault();
    setCorridor(CORRIDORS[nextIndex]);
    tabRefs.current[nextIndex]?.focus();
  };

  const showcase = [
    {
      icon: '⚡',
      title: 'Speed vs. Reliability',
      text: (
        <>
          <strong className="text-slate-100">Which route is actually better?</strong>
          <br />
          The <strong className="text-slate-100">Fastest</strong> route is ~25 min but has unpredictable delays. The{' '}
          <strong className="text-slate-100">Recommended</strong> route (~28 min) trades 3 minutes for 91% on-time reliability.
        </>
      ),
      tag: 'ROUTE COMPARISON'
    },
    {
      icon: '🕒',
      title: 'Best Departure Time',
      text: (
        <>
          <strong className="text-slate-100">When should I leave?</strong>
          <br />
          Leaving in the next 15–20 minutes is optimal — congestion is 32% currently and forecasted to surge to 38% as peak hour begins.
        </>
      ),
      tag: 'CONGESTION FORECAST'
    },
    {
      icon: '💳',
      title: 'Toll & Cost Awareness',
      text: (
        <>
          <strong className="text-slate-100">Are the tolls worth it?</strong>
          <br />
          The recommended expressway is toll-free; the faster bypass costs ₹60 in FastTag fees with minimal queue delay.
        </>
      ),
      tag: 'COST ANALYSIS'
    },
    {
      icon: '🛡️',
      title: 'Why Not This Route?',
      text: (
        <>
          <strong className="text-slate-100">Why skip the alternate highway?</strong>
          <br />
          It saves 1.2 km but crosses an active bottleneck at 64% density, likely adding +7 min of unexpected delay.
        </>
      ),
      tag: 'EXPLAINABLE AI'
    }
  ];

  return (
    <section className="px-5 lg:px-[60px] py-16 max-w-[1440px] mx-auto">
      <div className="text-center max-w-[660px] mx-auto mb-14">
        <span className="eyebrow">
          <span className="pulse-dot" /> AI Copilot Assistant
        </span>
        <h1 className="font-display text-4xl lg:text-5xl font-bold text-slate-100 tracking-tight mt-2">
          A co-driver that <span className="gradient-text">explains why</span>
        </h1>
        <p className="text-slate-300 mt-4 text-base leading-relaxed">
          TrafficIQ Copilot answers the questions regular navigation won't: why a specific route was picked, when congestion will spike, and whether tolls are worth the time saved.
        </p>
      </div>

      {/* Showcase Grid */}
      <div className="mb-16">
        <h2 className="text-center font-display text-2xl font-bold text-slate-100 mb-8">
          What you can ask
        </h2>
        <div className="grid md:grid-cols-2 gap-5 max-w-[960px] mx-auto">
          {showcase.map((s, idx) => (
            <Reveal key={s.title} delay={idx * 100}>
              <div className="feature-card p-6">
                <div>
                  <div className="flex items-center gap-2.5 mb-3">
                    <span className="text-xl">{s.icon}</span>
                    <span className="text-sm font-bold text-slate-100">{s.title}</span>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">{s.text}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[0.7rem] font-bold text-primary-bright bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full">
                    {s.tag}
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Verified
                  </span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Interactive Copilot Playground */}
      <div className="max-w-[700px] mx-auto">
        <div className="text-center mb-6">
          <span className="eyebrow">Try It Now</span>
          <h2 className="font-display text-2xl font-bold text-slate-100 mt-1">
            Chat with the AI Copilot
          </h2>
          <p className="text-sm text-slate-300 mt-2 max-w-md mx-auto">
            Select a city corridor and ask questions — the copilot responds with real-time traffic insights.
          </p>
        </div>

        <div className="p-4 rounded-3xl glass border border-white/10 shadow-frame mb-8">
          {/* Corridor Tablist */}
          <div className="mb-4">
            <span id="copilot-corridor-label" className="text-[0.7rem] font-bold uppercase tracking-widest text-slate-400 block mb-2">
              Choose a corridor:
            </span>
            <div
              role="tablist"
              aria-labelledby="copilot-corridor-label"
              className="flex gap-2 flex-wrap"
            >
              {CORRIDORS.map((c, idx) => {
                const isSelected = c.id === corridor.id;
                return (
                  <button
                    key={c.id}
                    ref={(el) => (tabRefs.current[idx] = el)}
                    id={`copilot-tab-${c.id}`}
                    role="tab"
                    aria-selected={isSelected}
                    aria-controls={`copilot-panel-${c.id}`}
                    tabIndex={isSelected ? 0 : -1}
                    onClick={() => setCorridor(c)}
                    onKeyDown={(e) => handleTabKeyDown(e, idx)}
                    className={`tab-pill ${
                      isSelected
                        ? 'bg-primary/20 border-primary text-primary-bright shadow-sm'
                        : 'bg-ink border-white/10 text-slate-300 hover:text-slate-100 hover:border-white/20'
                    }`}
                  >
                    {c.city}
                  </button>
                );
              })}
            </div>
          </div>

          <div
            id={`copilot-panel-${corridor.id}`}
            role="tabpanel"
            aria-labelledby={`copilot-tab-${corridor.id}`}
            className="focus-visible:outline-none"
          >
            <CopilotWidget corridor={corridor} />
          </div>
        </div>

        <div className="text-center flex flex-col items-center gap-3">
          <Link to="/demo" className="btn btn-primary px-7 py-3.5 text-sm font-semibold shadow-glow">
            🚀 Experience Full Cockpit View →
          </Link>
          <span className="text-xs text-slate-500">Interactive map, route comparison, and live forecasting</span>
        </div>
      </div>
    </section>
  );
}