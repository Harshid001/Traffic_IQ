import { Link } from 'react-router-dom';

const footerLinks = [
  { to: '/features', label: 'Features' },
  { to: '/demo', label: 'Live Demo' },
  { to: '/copilot', label: 'Copilot' }
];

const socialLinks = [
  {
    label: 'GitHub',
    href: '#',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
      </svg>
    )
  },
  {
    label: 'Twitter',
    href: '#',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    )
  }
];

export default function Footer() {
  return (
    <footer className="gradient-border-top bg-ink/50 backdrop-blur-sm">
      <div className="max-w-[1440px] mx-auto px-5 lg:px-[60px] py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Brand Column */}
          <div className="flex flex-col gap-3">
            <Link
              to="/"
              className="font-display font-bold text-slate-100 text-lg focus-visible:ring-1 focus-visible:ring-primary rounded-md w-fit"
              aria-label="TrafficIQ Homepage"
            >
              Traffic<span className="text-primary">IQ</span>
            </Link>
            <p className="text-sm text-slate-400 max-w-[260px] leading-relaxed">
              AI-powered traffic intelligence. Your route, explained with verifiable telemetry.
            </p>
          </div>

          {/* Links Column */}
          <nav className="flex flex-col gap-2.5" aria-label="Footer Navigation">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Navigate</span>
            {footerLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="text-sm text-slate-300 hover:text-primary-bright transition-colors focus-visible:ring-1 focus-visible:ring-primary rounded-md py-0.5 px-1 w-fit"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Social & Copyright Column */}
          <div className="flex flex-col gap-4 md:items-end">
            <div className="flex items-center gap-3">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  className="w-9 h-9 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-slate-400 hover:text-primary-bright hover:border-primary/30 hover:bg-primary/5 transition-all"
                  aria-label={s.label}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {s.icon}
                </a>
              ))}
            </div>
            <p className="text-sm text-slate-500">
              © 2026 TrafficIQ. Your route. Explained.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}