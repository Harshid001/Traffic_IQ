import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import {
  Navigation2,
  ShieldCheck,
  Zap,
  ChevronUp,
  Play,
  Pause,
  FastForward,
  AlertTriangle,
  GripHorizontal
} from 'lucide-react-native';
import { useNavigationStore } from '../../store/navigationStore';
import { normalizeReliability } from '../../utils/format';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

const SPEED_STEPS = [1, 2, 5];

const CollapsedRouteSheetBase: React.FC = () => {
  const routingData = useNavigationStore(s => s.routingData);
  const selectedRouteId = useNavigationStore(s => s.selectedRouteId);
  const startNavigation = useNavigationStore(s => s.startNavigation);
  const isNavigating = useNavigationStore(s => s.isNavigating);
  const isStartingNavigation = useNavigationStore(s => s.isStartingNavigation);
  const navigationError = useNavigationStore(s => s.navigationError);
  const isSimulatingDrive = useNavigationStore(s => s.isSimulatingDrive);
  const toggleDriveSimulation = useNavigationStore(s => s.toggleDriveSimulation);
  const simulationSpeed = useNavigationStore(s => s.simulationSpeed);
  const setSimulationSpeed = useNavigationStore(s => s.setSimulationSpeed);
  const remainingDistanceKm = useNavigationStore(s => s.remainingDistanceKm);
  const remainingEtaMin = useNavigationStore(s => s.remainingEtaMin);
  const arrivalTime = useNavigationStore(s => s.arrivalTime);
  const toggleBottomSheet = useNavigationStore(s => s.toggleBottomSheet);
  const progressPct = useNavigationStore(s => s.progressPct);

  const [navStarted, setNavStarted] = useState(false);

  const routes = routingData?.routes ?? [];
  const selectedRoute = routes.find(r => r.id === selectedRouteId) || routes[0];

  // Reliability may arrive as a decimal fraction (0.64) or a percentage (64).
  const reliabilityPct = normalizeReliability(selectedRoute?.reliability?.reliability_score);

  const handleStartNavigation = useCallback(async () => {
    setNavStarted(false);
    try {
      await startNavigation();
      setNavStarted(true);
    } catch {
      // The store already recorded the message in `navigationError`.
      setNavStarted(false);
    }
  }, [startNavigation]);

  const cycleSpeed = useCallback(() => {
    const next = SPEED_STEPS[(SPEED_STEPS.indexOf(simulationSpeed) + 1) % SPEED_STEPS.length];
    setSimulationSpeed(next);
  }, [simulationSpeed, setSimulationSpeed]);

  if (!selectedRoute) return null;

  if (isNavigating) {
    const progressWhole = Math.round(progressPct * 100);
    return (
      <View style={styles.sheet}>
        {/* Progress header */}
        <View style={styles.progressRow}>
          <Text style={styles.progressText}>PROGRESS ({progressWhole}%)</Text>
          <Text style={styles.arriveText}>ARRIVE BY {arrivalTime}</Text>
        </View>

        {/* Progress Bar Track */}
        <View
          style={styles.progressTrack}
          accessibilityRole="progressbar"
          accessibilityValue={{ min: 0, max: 100, now: progressWhole }}
          accessibilityLabel={`Trip progress ${progressWhole} percent`}
        >
          <View style={[styles.progressFill, { width: `${progressWhole}%` }]} />
        </View>

        {navigationError && (
          <View style={styles.errorRow}>
            <AlertTriangle size={12} color={colors.danger} />
            <Text style={styles.errorText} numberOfLines={2}>
              {navigationError}
            </Text>
          </View>
        )}

        <View style={styles.navBottomRow}>
          {/* ETA & Distance Summary */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={toggleBottomSheet}
            style={styles.etaCol}
            accessibilityRole="button"
            accessibilityLabel={`${remainingEtaMin} minutes and ${remainingDistanceKm} kilometres remaining on ${selectedRoute.name}. Tap for trip details.`}
          >
            <View style={styles.etaRow}>
              <Text style={styles.etaBig}>
                {remainingEtaMin} <Text style={styles.etaUnit}>min</Text>
              </Text>
              <Text style={styles.distBig}>{remainingDistanceKm} km</Text>
            </View>
            <View style={styles.routePill}>
              <View style={styles.routeDot} />
              <Text style={styles.routeName} numberOfLines={1}>
                {selectedRoute.name}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Simulation Controls */}
          <View style={styles.playbackRow}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={cycleSpeed}
              style={styles.speedToggle}
              hitSlop={spacing.hitSlop}
              accessibilityRole="button"
              accessibilityLabel={`Simulation speed ${simulationSpeed} times. Tap to change.`}
            >
              <FastForward size={14} color={colors.fastest} />
              <Text style={styles.speedToggleText}>{simulationSpeed}x</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={toggleDriveSimulation}
              style={styles.playButton}
              accessibilityRole="button"
              accessibilityLabel={isSimulatingDrive ? 'Pause drive simulation' : 'Resume drive simulation'}
              accessibilityState={{ selected: isSimulatingDrive }}
            >
              {isSimulatingDrive ? (
                <Pause size={20} color={colors.text.onAccent} strokeWidth={3} />
              ) : (
                <Play size={20} color={colors.text.onAccent} strokeWidth={3} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  const isBest = selectedRoute.is_best;
  const isFastest = selectedRoute.is_fastest;

  return (
    <View style={styles.sheet}>
      {/* Drag handle. It is a tap target, so it uses a grip icon rather than a
          bar that implies a swipe gesture the sheet does not support. */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={toggleBottomSheet}
        style={styles.dragBarContainer}
        accessibilityRole="button"
        accessibilityLabel="Expand route details"
      >
        <GripHorizontal size={20} color={colors.borderStrong} />
      </TouchableOpacity>

      <View style={styles.summaryRow}>
        <View style={styles.summaryInfo}>
          <View style={styles.badgeRow}>
            {isBest ? (
              <View style={styles.bestBadge}>
                <ShieldCheck size={12} color={colors.primary} />
                <Text style={styles.bestBadgeText}>Best For You</Text>
              </View>
            ) : isFastest ? (
              <View style={styles.fastestBadge}>
                <Zap size={12} color={colors.fastest} />
                <Text style={styles.fastestBadgeText}>Fastest Route</Text>
              </View>
            ) : (
              <View style={styles.altBadge}>
                <Text style={styles.altBadgeText}>Alternative</Text>
              </View>
            )}
            <Text style={styles.tollText}>Toll: ₹{selectedRoute.toll_cost}</Text>
          </View>

          <View style={styles.etaRow}>
            <Text style={styles.etaBig}>
              {selectedRoute.predicted_eta_p50} <Text style={styles.etaUnit}>min</Text>
            </Text>
            <Text style={styles.distBig}>{selectedRoute.distance_km} km</Text>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaText}>
              Traffic: <Text style={styles.metaHighlight}>{selectedRoute.congestion_category}</Text>
            </Text>
            <Text style={styles.metaDot}>•</Text>
            <Text style={styles.metaText}>
              Reliability:{' '}
              <Text style={styles.metaVal}>
                {selectedRoute.reliability ? `${reliabilityPct}%` : '—'}
              </Text>
            </Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={toggleBottomSheet}
          style={styles.expandButton}
          hitSlop={spacing.hitSlop}
          accessibilityRole="button"
          accessibilityLabel="Expand route details"
        >
          <ChevronUp size={20} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>

      {navigationError && (
        <View style={styles.errorRow}>
          <AlertTriangle size={12} color={colors.danger} />
          <Text style={styles.errorText} numberOfLines={2}>
            {navigationError}
          </Text>
        </View>
      )}

      {/* Large Start Navigation Button */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handleStartNavigation}
        disabled={isStartingNavigation}
        style={[styles.startButton, isStartingNavigation && styles.startButtonLoading]}
        accessibilityRole="button"
        accessibilityLabel={
          isStartingNavigation ? 'Starting navigation' : `Start navigation on ${selectedRoute.name}`
        }
        accessibilityState={{ disabled: isStartingNavigation, busy: isStartingNavigation }}
      >
        {isStartingNavigation ? (
          <ActivityIndicator size="small" color={colors.text.onAccent} />
        ) : (
          <Navigation2
            size={18}
            color={colors.text.onAccent}
            strokeWidth={3}
            style={{ transform: [{ rotate: '45deg' }] }}
          />
        )}
        <Text style={styles.startButtonText}>
          {isStartingNavigation ? 'Starting...' : navStarted ? 'Navigation Started' : 'Start Navigation'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export const CollapsedRouteSheet = React.memo(CollapsedRouteSheetBase);

const styles = StyleSheet.create({
  sheet: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    borderTopLeftRadius: spacing.radius.xxl,
    borderTopRightRadius: spacing.radius.xxl,
    padding: spacing.cardPadding,
    paddingBottom: spacing.xxl
  },
  dragBarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 32,
    marginBottom: spacing.xs
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
    gap: spacing.md
  },
  summaryInfo: {
    flex: 1
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xs
  },
  bestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    borderRadius: spacing.radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2
  },
  bestBadgeText: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    fontWeight: typography.weights.extrabold,
    color: colors.primary,
    textTransform: 'uppercase'
  },
  fastestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.fastestSoft,
    borderWidth: 1,
    borderColor: colors.fastestBorder,
    borderRadius: spacing.radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2
  },
  fastestBadgeText: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    fontWeight: typography.weights.extrabold,
    color: colors.fastest,
    textTransform: 'uppercase'
  },
  altBadge: {
    backgroundColor: colors.neutral,
    borderRadius: spacing.radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2
  },
  altBadgeText: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    fontWeight: typography.weights.bold,
    color: colors.text.secondary,
    textTransform: 'uppercase'
  },
  tollText: {
    fontSize: typography.sizes.caption,
    lineHeight: typography.line.caption,
    color: colors.text.secondary,
    fontWeight: typography.weights.semibold
  },
  etaRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.md,
    marginVertical: 2
  },
  etaBig: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: typography.weights.extrabold,
    color: colors.text.bright
  },
  etaUnit: {
    fontSize: typography.sizes.caption,
    fontWeight: typography.weights.regular,
    color: colors.text.secondary
  },
  distBig: {
    fontSize: typography.sizes.h3,
    lineHeight: typography.line.h3,
    fontWeight: typography.weights.semibold,
    color: colors.text.body
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: 2,
    flexWrap: 'wrap'
  },
  metaText: {
    fontSize: typography.sizes.caption,
    lineHeight: typography.line.caption,
    color: colors.text.secondary
  },
  metaHighlight: {
    color: colors.primary,
    fontWeight: typography.weights.bold,
    textTransform: 'capitalize'
  },
  metaVal: {
    color: colors.text.bright,
    fontWeight: typography.weights.bold
  },
  metaDot: {
    fontSize: typography.sizes.caption,
    color: colors.text.dimmed
  },
  expandButton: {
    width: 38,
    height: 38,
    borderRadius: spacing.radius.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center'
  },
  startButton: {
    backgroundColor: colors.primary,
    borderRadius: spacing.radius.xl,
    minHeight: spacing.touchTargetComfortable,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10
  },
  startButtonLoading: {
    opacity: 0.75
  },
  startButtonText: {
    fontSize: typography.sizes.h3,
    fontWeight: typography.weights.extrabold,
    color: colors.text.onAccent,
    letterSpacing: typography.tracking.normal,
    textTransform: 'uppercase'
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    gap: spacing.md
  },
  progressText: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    fontWeight: typography.weights.extrabold,
    color: colors.text.muted
  },
  arriveText: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    fontWeight: typography.weights.extrabold,
    color: colors.primary
  },
  progressTrack: {
    height: 5,
    backgroundColor: colors.neutral,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: spacing.lg
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3
  },
  navBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md
  },
  etaCol: {
    flex: 1
  },
  routePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: 2
  },
  routeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary
  },
  routeName: {
    fontSize: typography.sizes.caption,
    lineHeight: typography.line.caption,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
    flexShrink: 1
  },
  playbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md
  },
  speedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.radius.md,
    paddingHorizontal: spacing.lg,
    minHeight: 36,
    justifyContent: 'center'
  },
  speedToggleText: {
    fontSize: typography.sizes.caption,
    fontWeight: typography.weights.extrabold,
    color: colors.fastest
  },
  playButton: {
    width: spacing.touchTargetMin,
    height: spacing.touchTargetMin,
    borderRadius: spacing.radius.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 8
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.dangerSoft,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    borderRadius: spacing.radius.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg
  },
  errorText: {
    flex: 1,
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    color: colors.dangerBright,
    fontWeight: typography.weights.semibold
  }
});
