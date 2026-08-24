/**
 * Single source of truth for color. Components must import from here rather than
 * inlining hex/rgba literals so contrast fixes only have to happen once.
 *
 * Contrast ratios below are computed against the four app surfaces
 * (background #080A0D, surface #11151A, card #161B22, cardHover #1C222B).
 */
export const colors = {
  background: '#080A0D',
  surface: '#11151A',
  card: '#161B22',
  cardHover: '#1C222B',
  border: '#21262D',
  borderStrong: '#334155',
  borderLight: 'rgba(255, 255, 255, 0.08)',
  neutral: '#1E293B',

  // Navigation Semantic Colors
  primary: '#10B981', // Emerald - Best Route / Success (>= 6.30:1 on all surfaces)
  primaryBright: '#34D399',
  primaryGlow: 'rgba(16, 185, 129, 0.25)',
  primarySoft: 'rgba(16, 185, 129, 0.15)',
  primaryFaint: 'rgba(16, 185, 129, 0.08)',
  primaryBorder: 'rgba(16, 185, 129, 0.3)',
  primaryBorderSoft: 'rgba(16, 185, 129, 0.15)',
  primaryDark: '#059669',
  primaryDeep: '#047857',
  primaryTint: '#11191F',

  fastest: '#F59E0B', // Amber - Fastest Route (>= 7.45:1 on all surfaces)
  fastestBright: '#FBBF24',
  fastestGlow: 'rgba(245, 158, 11, 0.25)',
  fastestSoft: 'rgba(245, 158, 11, 0.15)',
  fastestFaint: 'rgba(245, 158, 11, 0.08)',
  fastestBorder: 'rgba(245, 158, 11, 0.3)',
  fastestDark: '#D97706',
  fastestDeep: '#B45309',
  fastestTint: '#1A1813',

  warning: '#F97316', // Orange - Traffic Delay / Moderate Congestion
  warningBright: '#FB923C',
  warningGlow: 'rgba(249, 115, 22, 0.25)',
  warningSoft: 'rgba(249, 115, 22, 0.15)',
  warningStrong: 'rgba(249, 115, 22, 0.7)',
  warningBorder: 'rgba(249, 115, 22, 0.3)',

  danger: '#EF4444', // Red - Severe Hazard / Heavy Congestion (>= 4.25:1)
  dangerBright: '#F87171',
  dangerGlow: 'rgba(239, 68, 68, 0.25)',
  dangerSoft: 'rgba(239, 68, 68, 0.15)',
  dangerBorder: 'rgba(239, 68, 68, 0.3)',
  dangerTint: '#1C1214',

  info: '#06B6D4', // Cyan - System / GPS / Provenance (>= 6.59:1)
  infoBright: '#22D3EE',
  infoSoft: 'rgba(6, 182, 212, 0.15)',
  infoBorder: 'rgba(6, 182, 212, 0.3)',

  scrim: 'rgba(0, 0, 0, 0.65)',
  scrimStrong: 'rgba(5, 6, 8, 0.95)',
  overlaySurface: 'rgba(17, 21, 26, 0.95)',
  overlayCard: 'rgba(22, 27, 34, 0.95)',
  /** Shadow color for elevated surfaces. */
  shadow: '#000000',

  // Text Colors — every value below clears WCAG AA 4.5:1 on all four surfaces.
  text: {
    primary: '#F8FAFC',  // 15.29:1 worst case
    bright: '#FFFFFF',
    strong: '#E2E8F0',
    body: '#CBD5E1',     // 10.77:1 worst case
    secondary: '#94A3B8', // 6.24:1 worst case
    /**
     * Was #64748B (3.36:1 on cardHover — WCAG AA fail).
     * #8B98AC measures 5.47:1 worst case.
     */
    muted: '#8B98AC',
    /**
     * Was #475569 (2.11:1 on cardHover — WCAG AA fail, near-invisible).
     * #7D8A9C measures 4.56:1 worst case.
     */
    dimmed: '#7D8A9C',
    /** Text placed on top of a filled primary/fastest button. */
    onAccent: '#080A0D',
    onLight: '#000000'
  },

  // Glassmorphic and Elevated Layer Surfaces
  glass: {
    base: 'rgba(17, 21, 26, 0.75)',
    card: 'rgba(22, 27, 34, 0.82)',
    elevated: 'rgba(28, 34, 43, 0.90)',
    stroke: 'rgba(255, 255, 255, 0.08)',
    strokeStrong: 'rgba(255, 255, 255, 0.15)',
    highlight: 'rgba(255, 255, 255, 0.04)'
  },

  // Driver POI & Hazard Semantics
  hazard: {
    police: '#3B82F6', // Blue
    camera: '#EC4899', // Pink
    jam: '#EF4444',    // Red
    hazard: '#F59E0B', // Amber
    work: '#F97316'    // Orange
  },

  // Driver Shortcut Category Tags
  poi: {
    ev: '#10B981',
    fuel: '#F59E0B',
    coffee: '#8B5CF6',
    parking: '#06B6D4',
    food: '#EC4899'
  },

  // Traffic Congestion Spectrum
  congestion: {
    freeflow: '#10B981', // 0-30%
    moderate: '#F59E0B', // 31-60%
    heavy: '#F97316',    // 61-80%
    severe: '#EF4444'    // 81-100%
  },

  /** Map polyline colors (decorative, not subject to text contrast rules). */
  map: {
    inactive: '#475569',
    inactiveDim: '#334155'
  }
};

