import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

const links = [
  { to: '/features', label: 'Features' },
  { to: '/demo', label: 'Live Demo' },
  { to: '/copilot', label: 'Copilot' }
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Track scroll for elevated navbar effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer whenever route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Close mobile drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-ink/90 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-ink/50'
          : 'bg-ink/60 backdrop-blur-md border-b border-white/5'
      }`}
    >
      <div className="flex items-center justify-between gap-4 px-5 lg:px-[60px] py-4 max-w-[1440px] mx-auto">
        {/* Brand Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 font-display font-bold text-lg text-slate-100 focus-visible:ring-1 focus-visible:ring-primary rounded-lg group"
          aria-label="TrafficIQ Home"
        >
          <span className="text-primary inline-flex transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" aria-hidden>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M4 18 L9 15 L13 17 L20 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="20" cy="6" r="3" fill="currentColor" />
              <circle cx="4" cy="18" r="2.6" fill="currentColor" />
            </svg>
          </span>
          <span className="tracking-tight">
            Traffic<span className="text-primary">IQ</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Primary navigation">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `nav-active-line text-sm font-medium transition-colors py-2 px-3.5 rounded-lg focus-visible:ring-2 focus-visible:ring-primary ${
                  isActive
                    ? 'active text-primary-bright font-semibold bg-primary/5'
                    : 'text-slate-300 hover:text-slate-100 hover:bg-white/5'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        {/* Action button & Mobile toggle */}
        <div className="flex items-center gap-3">
          <Link
            to="/demo"
            className="btn btn-primary px-4 sm:px-5 py-2 text-xs sm:text-sm font-semibold"
          >
            <span className="hidden sm:inline">🚀</span> Try Demo
          </Link>

          {/* Mobile hamburger button */}
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            aria-label={mobileOpen ? 'Close main menu' : 'Open main menu'}
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-primary cursor-pointer transition-colors"
          >
            {mobileOpen ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="17" x2="20" y2="17" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu with slide animation */}
      <div
        id="mobile-nav"
        className={`md:hidden border-t border-white/10 bg-ink/95 backdrop-blur-xl overflow-hidden transition-all duration-300 ease-out ${
          mobileOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-6 py-6">
          <nav className="flex flex-col gap-3" aria-label="Mobile navigation">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `flex items-center justify-between py-3 px-4 rounded-xl text-base font-medium transition-all ${
                    isActive
                      ? 'bg-primary/15 text-primary-bright border border-primary/30'
                      : 'bg-white/5 border border-white/5 text-slate-200 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <span>{l.label}</span>
                <span className="text-xs text-primary">→</span>
              </NavLink>
            ))}
          </nav>

          <div className="mt-6 pt-5 border-t border-white/10 flex flex-col gap-3">
            <Link
              to="/demo"
              className="btn btn-primary w-full py-3 text-sm font-semibold shadow-glow"
            >
              🚀 Try Live Demo
            </Link>
            <p className="text-center text-xs text-slate-400">
              AI-powered traffic intelligence for smarter commutes.
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}