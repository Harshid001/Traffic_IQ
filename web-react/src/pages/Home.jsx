import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import Reveal from '../components/Reveal';
import { FEATURES, STEPS } from '../data';

const stats = [
  { num: '5', label: 'Live Corridors', icon: '🗺️' },
  { num: '+20m', label: 'Forecast Horizon', icon: '🔮' },
  { num: '<1s', label: 'Instant Calculation', icon: '⚡' },
  { num: '91%', label: 'On-Time Reliability', icon: '🎯' }
];

const stepIcons = ['🗺️', '⚖️', '🤖'];

function AnimatedNumber({ value, visible }) {
  const [displayVal, setDisplayVal] = useState('0');
  useEffect(() => {
    if (!visible) return;
    // Just animate fade in — complex numbers like "+20m" can't be numerically animated
    const timer = setTimeout(() => setDisplayVal(value), 100);
    return () => clearTimeout(timer);
  }, [visible, value]);
  return <span className={visible ? 'animate-countUp inline-block' : 'opacity-0'}>{displayVal}</span>;
}

export default function Home() {
  const statsRef = useRef(null);
  const [statsVisible, setStatsVisible] = useState(false);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section className="px-5 lg:px-[60px] pt-12 lg:pt-20 pb-16 max-w-[1440px] mx-auto">
        <div className="grid lg:grid-cols-12 gap-12 items-center max-w-[1240px] mx-auto">
          {/* Hero Copy (5 cols) */}
          <div className="lg:col-span-5">
            <span className="eyebrow">
              <span className="pulse-dot" /> AI-Powered Traffic Intelligence
            </span>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-100 leading-[1.08] tracking-tight mt-3">
              Your route.
              <br />
              <span className="gradient-text">
                Explained.
              </span>
            </h1>
            <p className="mt-5 mb-7 text-base sm:text-lg text-slate-300 max-w-md leading-relaxed">
              TrafficIQ scores every route on speed <em className="text-slate-100 not-italic font-medium">and</em> reliability, forecasts congestion minutes ahead, and rides along as an AI co-driver that explains <strong className="text-slate-100">why</strong>.
            </p>
            <div className="flex gap-4 flex-wrap items-center">
              <Link to="/demo" className="btn btn-primary px-7 py-3.5 text-sm font-semibold shadow-glow">
                🚀 Launch Live Demo
              </Link>
              <Link to="/features" className="btn btn-ghost px-6 py-3.5 text-sm font-semibold">
                Explore Features
              </Link>
            </div>

            {/* Live ETA Indicator — Plain English */}
            <div className="inline-flex flex-col gap-1.5 mt-8 p-4 rounded-2xl glass shadow-sm">
              <span className="text-[0.7rem] font-bold tracking-widest text-slate-400 uppercase">
                Predicted Commute ETA
              </span>
              <div className="flex items-baseline gap-2.5">
                <span className="font-display text-3xl font-bold text-primary leading-tight">
                  28 <span className="text-base font-normal text-slate-300">min</span>
                </span>
                <span className="text-xs text-emerald-400 font-medium bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                  91% reliable
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Best: 26 min
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                  Worst: 34 min
                </span>
              </div>
            </div>
          </div>

          {/* Cockpit Preview (7 cols) — floating animation */}
          <div className="lg:col-span-7 flex justify-center order-last lg:order-none w-full">
            <div className="w-full max-w-[620px] rounded-3xl border border-white/10 bg-card p-4 sm:p-5 shadow-frame transition-all hover:border-primary/40 animate-float">
              {/* Cockpit Window Header */}
              <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <span className="pulse-dot" />
                  <span className="text-xs font-bold text-slate-100 tracking-wider">
                    LIVE MAP · AHMEDABAD → GANDHINAGAR
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[0.65rem] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    LIVE
                  </span>
                  <span className="text-[0.65rem] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                    AI ROUTING
                  </span>
                </div>
              </div>

              {/* Vector Corridor Radar View */}
              <div className="relative w-full h-[260px] sm:h-[290px] rounded-2xl overflow-hidden bg-gradient-to-b from-ink via-surface to-ink border border-white/5 p-4 flex flex-col justify-between">
                {/* SVG Route Geometry */}
                <svg
                  viewBox="0 0 400 240"
                  preserveAspectRatio="xMidYMid meet"
                  className="absolute inset-0 w-full h-full"
                  aria-label="Route preview diagram"
                >
                  <title>TrafficIQ Live Route Preview</title>
                  {/* Secondary Route */}
                  <path
                    d="M 40 200 C 100 190, 160 140, 220 120 C 280 100, 310 70, 360 40"
                    stroke="#475569"
                    strokeWidth="3"
                    strokeDasharray="4 4"
                    fill="none"
                    opacity="0.7"
                  />
                  {/* Recommended Primary Route */}
                  <path
                    d="M 40 200 C 90 170, 150 160, 210 110 C 270 60, 320 60, 360 40"
                    stroke="#38BDF8"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                  {/* Animated travel dash on primary */}
                  <path
                    d="M 40 200 C 90 170, 150 160, 210 110 C 270 60, 320 60, 360 40"
                    stroke="#38BDF8"
                    strokeWidth="4"
                    strokeDasharray="8 14"
                    strokeLinecap="round"
                    fill="none"
                    opacity="0.5"
                    style={{ animation: 'routeDash 0.8s linear infinite' }}
                  />
                  {/* Waypoints */}
                  <circle cx="40" cy="200" r="7" fill="#0EA5E9" stroke="#fff" strokeWidth="2" />
                  <circle cx="360" cy="40" r="7" fill="#10B981" stroke="#fff" strokeWidth="2" />
                  <circle cx="210" cy="110" r="8" fill="#38BDF8" stroke="#04070D" strokeWidth="2" />
                  {/* ETA Floating Marker */}
                  <g transform="translate(200,80)">
                    <rect x="-38" y="-14" width="76" height="28" rx="14" fill="#11151A" stroke="#38BDF8" strokeWidth="1.5" />
                    <text x="0" y="4" textAnchor="middle" fill="#7DD3FC" fontSize="10" fontWeight="700">28 min</text>
                  </g>
                </svg>

                {/* Floating Waypoint Labels */}
                <div className="z-10 flex justify-between text-[0.7rem] text-slate-300 font-semibold px-2">
                  <span>📍 ISKCON Cross Rd</span>
                  <span>🏁 Gandhinagar Sec 11</span>
                </div>

                {/* Bottom Route Summary Chip */}
                <div className="z-10 glass rounded-xl p-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[0.65rem] uppercase text-slate-400 font-semibold">Recommended Route</div>
                    <div className="text-xs font-bold text-slate-100">SG Highway Express · 18.2 km</div>
                  </div>
                  <div className="flex items-center gap-3 text-right">
                    <div>
                      <div className="text-[0.65rem] text-slate-400">Reliability</div>
                      <div className="text-xs font-bold text-emerald-400">91% On-Time</div>
                    </div>
                    <div>
                      <div className="text-[0.65rem] text-slate-400">Tolls</div>
                      <div className="text-xs font-bold text-slate-100">₹0 Free</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Quick-Action Bar */}
              <div className="mt-3.5 pt-3 border-t border-white/5 flex items-center justify-between gap-3 flex-wrap">
                <div className="text-xs text-slate-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>AI Co-driver: <strong className="text-primary-bright">Ready</strong></span>
                </div>
                <Link to="/demo" className="text-xs font-bold text-primary hover:text-primary-bright flex items-center gap-1 transition-colors">
                  <span>Open Full Demo</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Strip — Animated Count-Up */}
      <section ref={statsRef} className="px-5 lg:px-[60px] py-8 max-w-[1440px] mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 max-w-[1150px] mx-auto">
          {stats.map((s, idx) => (
            <div
              key={s.label}
              className="stat-card"
              style={{ transitionDelay: `${idx * 100}ms` }}
            >
              <span className="text-2xl mb-2" aria-hidden>{s.icon}</span>
              <span className="font-display text-3xl lg:text-4xl font-bold text-primary">
                <AnimatedNumber value={s.num} visible={statsVisible} />
              </span>
              <span className="text-xs sm:text-sm text-slate-300 mt-1.5 font-medium">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features Overview */}
      <section className="px-5 lg:px-[60px] py-16 max-w-[1440px] mx-auto">
        <div className="text-center max-w-[620px] mx-auto mb-12">
          <span className="eyebrow">Core Features</span>
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-slate-100 tracking-tight mt-2">
            Built for the daily drive
          </h2>
          <p className="text-slate-300 mt-3 text-base">
            Not just the fastest route — the smartest one, with verifiable data behind every recommendation.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-[1150px] mx-auto">
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
        <div className="text-center mt-10">
          <Link to="/features" className="btn btn-ghost px-6 py-3 text-sm font-semibold">
            See full architecture →
          </Link>
        </div>
      </section>

      {/* 3 Steps How it Works — with step connectors */}
      <section className="px-5 lg:px-[60px] py-16 max-w-[1440px] mx-auto">
        <div className="text-center max-w-[620px] mx-auto mb-12">
          <span className="eyebrow">How It Works</span>
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-slate-100 tracking-tight mt-2">
            Three steps to a smarter commute
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5 max-w-[1150px] mx-auto">
          {STEPS.map((s, idx) => (
            <Reveal key={s.num} delay={idx * 120}>
              <div className="p-7 rounded-3xl bg-card border border-white/10 h-full flex flex-col justify-between hover:border-white/20 hover:-translate-y-1 transition-all duration-300 relative">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl" aria-hidden>{stepIcons[idx]}</span>
                    <span className="font-display text-3xl font-bold text-primary/50">{s.num}</span>
                  </div>
                  <h3 className="font-display text-lg font-bold text-slate-100 mb-2">{s.title}</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">{s.text}</p>
                </div>
                {/* Connector arrow (hidden on last card and on mobile) */}
                {idx < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 text-primary/40 text-lg z-10">
                    →
                  </div>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Call to Action Banner — with animated glow */}
      <section id="download" className="px-5 lg:px-[60px] pt-12 pb-24 max-w-[1440px] mx-auto">
        <div className="text-center max-w-[850px] mx-auto p-10 sm:p-14 rounded-[32px] bg-gradient-to-b from-primary/15 via-surface to-ink border border-primary/30 shadow-frame cta-glow">
          <span className="eyebrow mb-2">Ready to Upgrade Your Commute?</span>
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-slate-100 mt-1">
            Start driving smarter today
          </h2>
          <p className="text-slate-300 mt-3 mb-8 max-w-md mx-auto text-base">
            Experience the full traffic intelligence platform or try the AI Copilot assistant.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/demo" className="btn btn-primary px-7 py-3.5 text-sm font-semibold shadow-glow">
              🚀 Launch Live Demo
            </Link>
            <Link to="/copilot" className="btn btn-ghost px-6 py-3.5 text-sm font-semibold">
              💬 Test Copilot Chat
            </Link>
          </div>
          <p className="text-xs text-slate-500 mt-6">
            No sign-up required · 5 corridors available · Works in your browser
          </p>
        </div>
      </section>
    </>
  );
}