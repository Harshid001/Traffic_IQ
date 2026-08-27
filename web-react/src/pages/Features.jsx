import { Link } from 'react-router-dom';
import Reveal from '../components/Reveal';
import { FEATURES } from '../data';

const ARCHITECTURE_LAYERS = [
  {
    num: '01',
    layer: 'Layer 1 · Sensor Network',
    title: 'Real-Time Data Collection',
    desc: 'Aggregates vehicle speed data and traffic camera signals every 3 seconds to build a ground-truth picture of current road conditions.',
    icon: '📡',
    color: 'text-primary'
  },
  {
    num: '02',
    layer: 'Layer 2 · AI Forecaster',
    title: 'Smart ETA Prediction',
    desc: 'Simulates traffic flow 20 minutes ahead, generating best-case, expected, and worst-case arrival times instead of a single optimistic guess.',
    icon: '🧠',
    color: 'text-primary-bright'
  },
  {
    num: '03',
    layer: 'Layer 3 · Explainable AI',
    title: 'Why This Route?',
    desc: 'Translates the trade-offs between time saved, toll costs, and bottleneck risk into plain-language explanations you can trust.',
    icon: '🛡️',
    color: 'text-emerald-400'
  }
];

export default function Features() {
  return (
    <section className="px-5 lg:px-[60px] py-16 max-w-[1440px] mx-auto">
      {/* Header */}
      <div className="text-center max-w-[700px] mx-auto mb-16">
        <span className="eyebrow">
          <span className="pulse-dot" /> How It Works
        </span>
        <h1 className="font-display text-4xl lg:text-5xl font-bold text-slate-100 tracking-tight mt-2">
          Engineered for <span className="gradient-text">transparency</span>
        </h1>
        <p className="text-slate-300 mt-3 text-base leading-relaxed">
          TrafficIQ combines AI forecasting with explainable reasoning to deliver reliable, transparent route guidance you can actually understand.
        </p>
      </div>

      {/* Core Feature Grid */}
      <div className="mb-20">
        <h2 className="sr-only">Core Capabilities</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1150px] mx-auto">
          {FEATURES.map((f, idx) => (
            <Reveal key={f.title} delay={idx * 80}>
              <div className="feature-card">
                <div>
                  <div className="text-3xl mb-4" aria-hidden>{f.icon}</div>
                  <h3 className="font-display text-lg font-bold text-slate-100 mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">{f.text}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Deep Dive: 3-Layer Architecture */}
      <div className="max-w-[1000px] mx-auto mb-16 p-8 sm:p-12 rounded-[32px] glass border border-white/10 shadow-frame">
        <div className="text-center max-w-[600px] mx-auto mb-10">
          <span className="eyebrow">Under The Hood</span>
          <h2 className="font-display text-2xl lg:text-3xl font-bold text-slate-100 mt-1">
            Three-Layer Intelligence
          </h2>
          <p className="text-sm text-slate-300 mt-2">
            How TrafficIQ makes verified recommendations without black-box opacity.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 relative">
          {/* Connecting gradient line (desktop only) */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0 transform -translate-y-1/2 z-0" />

          {ARCHITECTURE_LAYERS.map((arch, idx) => (
            <Reveal key={arch.layer} delay={idx * 150}>
              <div className="relative z-10 p-5 rounded-2xl bg-ink/70 border border-white/10 flex flex-col justify-between hover:-translate-y-1 hover:border-primary/30 hover:shadow-card-hover transition-all duration-300 h-full">
                <div>
                  {/* Numbered badge */}
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg bg-primary/10 border border-primary/20 ${arch.color}`}>
                      {arch.icon}
                    </span>
                    <span className="font-display text-2xl font-bold text-primary/40">{arch.num}</span>
                  </div>
                  <span className="text-[0.7rem] font-bold text-primary tracking-wider uppercase block mb-1">
                    {arch.layer}
                  </span>
                  <h3 className="font-display font-semibold text-slate-100 text-base mb-2">
                    {arch.title}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {arch.desc}
                  </p>
                </div>
                {/* Flow arrow connector (hidden on last and mobile) */}
                {idx < ARCHITECTURE_LAYERS.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-3.5 transform -translate-y-1/2 z-20 text-primary/50 text-lg font-bold">
                    →
                  </div>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="text-center flex flex-col items-center gap-3">
        <Link to="/demo" className="btn btn-primary px-8 py-3.5 text-sm font-semibold shadow-glow">
          🚀 See It In Action →
        </Link>
        <span className="text-xs text-slate-500">Try the live interactive cockpit demo</span>
      </div>
    </section>
  );
}