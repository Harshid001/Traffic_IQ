import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
  Animated,
  Dimensions
} from 'react-native';
import {
  Navigation,
  Sparkles,
  GitFork,
  Compass,
  AlertTriangle,
  TrendingUp,
  Bot,
  ShieldCheck,
  Zap,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Gauge,
  Layers,
  X,
  ChevronRight
} from 'lucide-react-native';
import { useSettingsStore } from '../../store/settingsStore';
import { useNavigationStore } from '../../store/navigationStore';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

/* ─────────────────────────────────────────────────────────────────── */
/*  SLIDE DATA                                                        */
/* ─────────────────────────────────────────────────────────────────── */

interface OnboardingSlide {
  id: string;
  icon: any;
  accent: string;
  accentSoft: string;
  accentBorder: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  bullets: { icon: any; text: string }[];
}

const SLIDES: OnboardingSlide[] = [
  {
    id: 'welcome',
    icon: Navigation,
    accent: colors.primaryBright,
    accentSoft: colors.primarySoft,
    accentBorder: colors.primaryBorder,
    eyebrow: 'WELCOME',
    title: 'Your Intelligent\nDriving Companion',
    subtitle:
      'TrafficIQ combines live road telemetry, neural forecasting, and an on-device AI copilot to make every commute smarter.',
    bullets: [
      { icon: TrendingUp, text: 'Predicts congestion up to 60 min ahead' },
      { icon: GitFork, text: 'Multi-objective route scoring engine' },
      { icon: Bot, text: 'In-car Phi-4-mini AI copilot assistant' }
    ]
  },
  {
    id: 'routes',
    icon: GitFork,
    accent: colors.fastestBright,
    accentSoft: colors.fastestSoft,
    accentBorder: colors.fastestBorder,
    eyebrow: 'SMART ROUTING',
    title: 'Beyond Fastest.\nSmarter Routes.',
    subtitle:
      'See P50 & P90 arrival confidence, compare trade-offs across reliability, tolls, and fuel — all before you start driving.',
    bullets: [
      { icon: Clock, text: 'Expected & worst-case ETA bounds' },
      { icon: Layers, text: 'Best vs Fastest vs Toll-Free matrix' },
      { icon: ShieldCheck, text: 'AI-verified route explanations' }
    ]
  },
  {
    id: 'cockpit',
    icon: Compass,
    accent: colors.primaryBright,
    accentSoft: colors.primarySoft,
    accentBorder: colors.primaryBorder,
    eyebrow: 'COCKPIT HUD',
    title: 'Turn-by-Turn\nNavigation',
    subtitle:
      'A clean heads-up display with maneuver guidance, live speed monitoring, and an interactive drive simulator at 1×–5× speed.',
    bullets: [
      { icon: Navigation, text: 'Large visual maneuver lane cues' },
      { icon: Gauge, text: 'Real-time speed vs posted limit' },
      { icon: Zap, text: 'Simulate full routes before driving' }
    ]
  },
  {
    id: 'alerts',
    icon: AlertTriangle,
    accent: colors.warningBright,
    accentSoft: colors.warningSoft,
    accentBorder: colors.warningBorder,
    eyebrow: 'PROACTIVE ALERTS',
    title: 'Warnings Before\nSlowdowns Hit',
    subtitle:
      'TrafficIQ watches the +20 min horizon ahead of you and suggests time-saving reroutes before bottlenecks form.',
    bullets: [
      { icon: AlertTriangle, text: 'Predictive bottleneck detection' },
      { icon: GitFork, text: '1-tap auto-reroute with savings' },
      { icon: ShieldCheck, text: 'Lock-screen safety notifications' }
    ]
  },
  {
    id: 'traffic',
    icon: TrendingUp,
    accent: colors.infoBright,
    accentSoft: colors.infoSoft,
    accentBorder: colors.infoBorder,
    eyebrow: 'TRAFFIC DNA',
    title: 'Know Your\nCommute Rhythm',
    subtitle:
      'Explore 24-hour congestion patterns, segment bottleneck breakdowns, and find the perfect departure window.',
    bullets: [
      { icon: TrendingUp, text: '24h historical congestion heatmap' },
      { icon: Clock, text: 'Smart departure time planner' },
      { icon: Layers, text: 'Per-segment bottleneck analysis' }
    ]
  },
  {
    id: 'copilot',
    icon: Bot,
    accent: colors.primaryBright,
    accentSoft: colors.primarySoft,
    accentBorder: colors.primaryBorder,
    eyebrow: 'AI COPILOT',
    title: 'Ask Anything\nAbout Your Trip',
    subtitle:
      'Chat with a Phi-4-mini AI assistant grounded in live telemetry. Ask about tolls, delays, departure times, or route trade-offs.',
    bullets: [
      { icon: Bot, text: 'Grounded in live corridor data' },
      { icon: Sparkles, text: 'Quick prompt suggestion chips' },
      { icon: ShieldCheck, text: 'Transparent model attribution' }
    ]
  }
];

/* ─────────────────────────────────────────────────────────────────── */
/*  COMPONENT                                                         */
/* ─────────────────────────────────────────────────────────────────── */

export const AppIntroTutorial: React.FC = () => {
  const showOnboardingTutorial = useSettingsStore(s => s.showOnboardingTutorial);
  const hasCompletedOnboarding = useSettingsStore(s => s.hasCompletedOnboarding);
  const completeOnboarding = useSettingsStore(s => s.completeOnboarding);
  const setShowOnboardingTutorial = useSettingsStore(s => s.setShowOnboardingTutorial);
  const setActiveTab = useNavigationStore(s => s.setActiveTab);

  const [idx, setIdx] = useState(0);

  const isVisible = showOnboardingTutorial || !hasCompletedOnboarding;
  const slide = SLIDES[idx];
  const isLast = idx === SLIDES.length - 1;
  const isFirst = idx === 0;
  const progress = (idx + 1) / SLIDES.length;

  const finish = useCallback(() => {
    completeOnboarding();
    setShowOnboardingTutorial(false);
    setActiveTab('navigate');
    setIdx(0);
  }, [completeOnboarding, setShowOnboardingTutorial, setActiveTab]);

  const next = useCallback(() => {
    if (isLast) finish();
    else setIdx(i => i + 1);
  }, [isLast, finish]);

  const prev = useCallback(() => {
    setIdx(i => Math.max(0, i - 1));
  }, []);

  if (!isVisible) return null;

  const Icon = slide.icon;

  return (
    <Modal visible={isVisible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.card}>

          {/* ── Top Bar ────────────────────────────────────── */}
          <View style={styles.topBar}>
            <View style={styles.brandRow}>
              <View style={styles.logoMark}>
                <Navigation
                  size={13}
                  color={colors.text.onAccent}
                  strokeWidth={3}
                  style={{ transform: [{ rotate: '45deg' }] }}
                />
              </View>
              <Text style={styles.brandName}>
                Traffic<Text style={styles.brandDim}>IQ</Text>
              </Text>
            </View>

            <TouchableOpacity
              onPress={finish}
              activeOpacity={0.75}
              style={styles.skipPill}
              hitSlop={spacing.hitSlop}
              accessibilityRole="button"
              accessibilityLabel="Skip tutorial"
            >
              <Text style={styles.skipText}>Skip</Text>
              <X size={12} color={colors.text.muted} />
            </TouchableOpacity>
          </View>

          {/* ── Progress Bar ───────────────────────────────── */}
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${progress * 100}%`, backgroundColor: slide.accent }
              ]}
            />
          </View>

          {/* ── Hero Section ───────────────────────────────── */}
          <View style={styles.heroSection}>
            {/* Glowing icon circle */}
            <View
              style={[
                styles.iconGlow,
                { backgroundColor: slide.accentSoft, borderColor: slide.accentBorder }
              ]}
            >
              <View
                style={[
                  styles.iconInner,
                  { backgroundColor: slide.accentSoft, borderColor: slide.accentBorder }
                ]}
              >
                <Icon size={28} color={slide.accent} strokeWidth={2} />
              </View>
            </View>

            {/* Eyebrow */}
            <View
              style={[
                styles.eyebrowBadge,
                { backgroundColor: slide.accentSoft, borderColor: slide.accentBorder }
              ]}
            >
              <Text style={[styles.eyebrowText, { color: slide.accent }]}>
                {slide.eyebrow}
              </Text>
            </View>

            {/* Title */}
            <Text style={styles.heroTitle}>{slide.title}</Text>

            {/* Subtitle */}
            <Text style={styles.heroSub}>{slide.subtitle}</Text>
          </View>

          {/* ── Bullet Points ──────────────────────────────── */}
          <View style={styles.bulletSection}>
            {slide.bullets.map((b, i) => {
              const BIcon = b.icon;
              return (
                <View key={i} style={styles.bulletRow}>
                  <View
                    style={[
                      styles.bulletDot,
                      { backgroundColor: slide.accentSoft, borderColor: slide.accentBorder }
                    ]}
                  >
                    <BIcon size={13} color={slide.accent} />
                  </View>
                  <Text style={styles.bulletText}>{b.text}</Text>
                </View>
              );
            })}
          </View>

          {/* ── Bottom Actions ─────────────────────────────── */}
          <View style={styles.bottomBar}>
            {/* Step counter */}
            <Text style={styles.stepCounter}>
              {idx + 1}
              <Text style={styles.stepCounterDim}> of {SLIDES.length}</Text>
            </Text>

            {/* Button row */}
            <View style={styles.btnRow}>
              {!isFirst && (
                <TouchableOpacity
                  onPress={prev}
                  activeOpacity={0.8}
                  style={styles.backBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Go back"
                >
                  <ArrowLeft size={16} color={colors.text.secondary} />
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={next}
                activeOpacity={0.85}
                style={[
                  styles.nextBtn,
                  { backgroundColor: isLast ? slide.accent : colors.primary }
                ]}
                accessibilityRole="button"
                accessibilityLabel={isLast ? 'Start navigating' : 'Next'}
              >
                <Text style={styles.nextBtnText}>
                  {isLast ? 'Get Started' : 'Continue'}
                </Text>
                {isLast ? (
                  <CheckCircle2 size={16} color={colors.text.onAccent} />
                ) : (
                  <ChevronRight size={16} color={colors.text.onAccent} />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

/* ─────────────────────────────────────────────────────────────────── */
/*  STYLES                                                            */
/* ─────────────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Platform.OS === 'web' ? 20 : 0
  },
  card: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    maxHeight: Platform.OS === 'web' ? 820 : '100%',
    backgroundColor: colors.background,
    borderRadius: Platform.OS === 'web' ? 24 : 0,
    overflow: 'hidden',
    borderWidth: Platform.OS === 'web' ? 1 : 0,
    borderColor: 'rgba(255,255,255,0.08)'
  },

  /* Top bar */
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 52 : 16,
    paddingBottom: 12
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7
  },
  logoMark: {
    width: 24,
    height: 24,
    borderRadius: 7,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center'
  },
  brandName: {
    fontSize: 15,
    fontWeight: typography.weights.extrabold,
    color: colors.text.bright,
    letterSpacing: -0.3
  },
  brandDim: {
    color: colors.text.muted
  },
  skipPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: spacing.radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border
  },
  skipText: {
    fontSize: 12,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary
  },

  /* Progress bar */
  progressTrack: {
    height: 3,
    backgroundColor: colors.card,
    marginHorizontal: 20,
    borderRadius: 2
  },
  progressFill: {
    height: 3,
    borderRadius: 2
  },

  /* Hero */
  heroSection: {
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 8
  },
  iconGlow: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: 18
  },
  iconInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1
  },
  eyebrowBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: spacing.radius.pill,
    borderWidth: 1,
    marginBottom: 12
  },
  eyebrowText: {
    fontSize: 10,
    fontWeight: typography.weights.extrabold,
    letterSpacing: 1.2
  },
  heroTitle: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: typography.weights.extrabold,
    color: colors.text.bright,
    textAlign: 'center',
    marginBottom: 10
  },
  heroSub: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.text.secondary,
    textAlign: 'center',
    maxWidth: 340
  },

  /* Bullets */
  bulletSection: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 10
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: spacing.radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12
  },
  bulletDot: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1
  },
  bulletText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: typography.weights.medium,
    color: colors.text.primary
  },

  /* Bottom */
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 36 : 18,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface
  },
  stepCounter: {
    fontSize: 12,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 10
  },
  stepCounterDim: {
    color: colors.text.muted,
    fontWeight: typography.weights.regular
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: spacing.radius.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center'
  },
  nextBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 44,
    borderRadius: spacing.radius.md
  },
  nextBtnText: {
    fontSize: 14,
    fontWeight: typography.weights.extrabold,
    color: colors.text.onAccent
  }
});
