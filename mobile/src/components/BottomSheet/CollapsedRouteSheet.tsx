import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import {
  Navigation2,
  ShieldCheck,
  Zap,
  ChevronUp,
  Play,
  Pause,
  FastForward,
  AlertTriangle,
  GripHorizontal,
  BellRing,
  Clock,
  Sparkles
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
  const setSelectedRouteId = useNavigationStore(s => s.setSelectedRouteId);
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
  const triggerSimulatedAlert = useNavigationStore(s => s.triggerSimulatedAlert);

  const [navStarted, setNavStarted] = useState(false);

  const routes = routingData?.routes ?? [];
  const selectedRoute = routes.find(r => r.id === selectedRouteId) || routes[0];

  const reliabilityPct = normalizeReliability(selectedRoute?.reliability?.reliability_score);

  const handleStartNavigation = useCallback(async () => {
    setNavStarted(false);
    try {
      await startNavigation();
      setNavStarted(true);
    } catch {
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
        {/* Progress Header */}
        <View style={styles.progressRow}>
          <Text style={styles.progressText}>TRIP PROGRESS ({progressWhole}%)</Text>
          <Text style={styles.arriveText}>EST. ARRIVAL {arrivalTime}</Text>
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
            activeOpacity={0.75}
            onPress={toggleBottomSheet}
            style={styles.etaCol}
            accessibilityRole="button"
            accessibilityLabel={`${remainingEtaMin} minutes and ${remainingDistanceKm} km remaining.`}
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

          {/* In-Drive Simulation Tools */}
          <View style={styles.playbackRow}>
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => triggerSimulatedAlert()}
              style={styles.alertTriggerBtn}
              hitSlop={spacing.hitSlop}
              accessibilityRole="button"
              accessibilityLabel="Trigger proactive traffic alert"
            >
              <BellRing size={15} color={colors.fastest} />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.75}
              onPress={cycleSpeed}
              style={styles.speedToggle}
              hitSlop={spacing.hitSlop}
              accessibilityRole="button"
              accessibilityLabel={`Simulation speed ${simulationSpeed}x`}
            >
              <FastForward size={14} color={colors.fastest} />
              <Text style={styles.speedToggleText}>{simulationSpeed}x</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={toggleDriveSimulation}
              style={styles.playButton}
              accessibilityRole="button"
              accessibilityLabel={isSimulatingDrive ? 'Pause drive' : 'Resume drive'}
            >
              {isSimulatingDrive ? (
                <Pause size={18} color={colors.text.onAccent} strokeWidth={3} />
              ) : (
                <Play size={18} color={colors.text.onAccent} strokeWidth={3} />
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
      {/* Drag Handle & Expand Pill */}
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={toggleBottomSheet}
        style={styles.dragBarContainer}
        accessibilityRole="button"
        accessibilityLabel="Expand route details"
      >
        <GripHorizontal size={20} color={colors.borderStrong} />
      </TouchableOpacity>

      {/* Interactive Candidate Routes Selector Bar */}
      {routes.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.routeSelectorScroll}
        >
          {routes.map(r => {
            const isSelected = r.id === selectedRoute.id;
            return (
              <TouchableOpacity
                key={r.id}
                activeOpacity={0.75}
                onPress={() => setSelectedRouteId(r.id)}
                style={[styles.routeSelectChip, isSelected && styles.routeSelectChipActive]}
              >
                <View style={styles.routeSelectChipHeader}>
                  {r.is_best ? (
                    <ShieldCheck size={11} color={isSelected ? colors.primary : colors.text.muted} />
                  ) : r.is_fastest ? (
                    <Zap size={11} color={isSelected ? colors.fastest : colors.text.muted} />
                  ) : null}
                  <Text
                    style={[
                      styles.routeSelectChipLabel,
                      isSelected && { color: r.is_best ? colors.primary : colors.fastest }
                    ]}
                  >
                    {r.is_best ? 'RECOMMENDED' : r.is_fastest ? 'FASTEST' : 'ALT'}
                  </Text>
                </View>
                <Text style={[styles.routeSelectChipEta, isSelected && styles.routeSelectChipEtaActive]}>
                  {r.predicted_eta_p50} min <Text style={styles.routeSelectChipDist}>• {r.distance_km}km</Text>
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* Primary Route Summary */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryInfo}>
          <View style={styles.badgeRow}>
            {isBest ? (
              <View style={styles.bestBadge}>
                <ShieldCheck size={12} color={colors.primary} />
                <Text style={styles.bestBadgeText}>Smart Recommendation</Text>
              </View>
            ) : isFastest ? (
              <View style={styles.fastestBadge}>
                <Zap size={12} color={colors.fastest} />
                <Text style={styles.fastestBadgeText}>Fastest Route</Text>
              </View>
            ) : (
              <View style={styles.altBadge}>
                <Text style={styles.altBadgeText}>Alternative Route</Text>
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
              Live Traffic: <Text style={styles.metaHighlight}>{selectedRoute.congestion_category}</Text>
            </Text>
            <Text style={styles.metaDot}>•</Text>
            <Text style={styles.metaText}>
              Reliability: <Text style={styles.metaVal}>{reliabilityPct}% on-time</Text>
            </Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.75}
          onPress={toggleBottomSheet}
          style={styles.expandButton}
          hitSlop={spacing.hitSlop}
          accessibilityRole="button"
          accessibilityLabel="Expand route details"
        >
          <ChevronUp size={18} color={colors.text.secondary} />
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

      {/* Large Glowing Start Navigation Action Button */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handleStartNavigation}
        disabled={isStartingNavigation}
        style={[styles.startButton, isStartingNavigation && styles.startButtonLoading]}
        accessibilityRole="button"
        accessibilityLabel={`Start navigation on ${selectedRoute.name}`}
      >
        {isStartingNavigation ? (
          <ActivityIndicator size="small" color={colors.text.onAccent} />
        ) : (
          <Navigation2
            size={20}
            color={colors.text.onAccent}
            strokeWidth={3}
            style={{ transform: [{ rotate: '45deg' }] }}
          />
        )}
        <Text style={styles.startButtonText}>
          {isStartingNavigation ? 'Initializing Trip...' : navStarted ? 'Navigation Started' : 'Start Navigation'}
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
    borderTopColor: colors.borderStrong,
    borderTopLeftRadius: spacing.radius.xxl,
    borderTopRightRadius: spacing.radius.xxl,
    padding: spacing.cardPadding,
    paddingBottom: spacing.xxl,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.5,
    shadowRadius: 16
  },
  dragBarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 24,
    marginBottom: spacing.xs
  },
  routeSelectorScroll: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
    paddingVertical: 2
  },
  routeSelectChip: {
    backgroundColor: colors.card,
    borderRadius: spacing.radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    minWidth: 110
  },
  routeSelectChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryFaint
  },
  routeSelectChipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2
  },
  routeSelectChipLabel: {
    fontSize: 9,
    fontWeight: typography.weights.extrabold,
    color: colors.text.muted,
    letterSpacing: 0.5
  },
  routeSelectChipEta: {
    fontSize: 12,
    fontWeight: typography.weights.bold,
    color: colors.text.secondary
  },
  routeSelectChipEtaActive: {
    color: colors.text.bright
  },
  routeSelectChipDist: {
    fontSize: 10,
    fontWeight: typography.weights.regular,
    color: colors.text.muted
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    gap: spacing.md
  },
  summaryInfo: {
    flex: 1
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs
  },
  bestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    borderRadius: spacing.radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2
  },
  bestBadgeText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.primary
  },
  fastestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.fastestSoft,
    borderWidth: 1,
    borderColor: colors.fastestBorder,
    borderRadius: spacing.radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2
  },
  fastestBadgeText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.fastest
  },
  altBadge: {
    backgroundColor: colors.neutral,
    borderRadius: spacing.radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2
  },
  altBadgeText: {
    fontSize: 10,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary
  },
  tollText: {
    fontSize: 11,
    fontWeight: typography.weights.semibold,
    color: colors.text.muted
  },
  etaRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.md,
    marginBottom: spacing.xs
  },
  etaBig: {
    fontSize: typography.sizes.hero,
    lineHeight: 38,
    fontWeight: typography.weights.extrabold,
    color: colors.text.bright
  },
  etaUnit: {
    fontSize: typography.sizes.h3,
    fontWeight: typography.weights.semibold,
    color: colors.primary
  },
  distBig: {
    fontSize: typography.sizes.h2,
    fontWeight: typography.weights.bold,
    color: colors.text.secondary
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs
  },
  metaText: {
    fontSize: 11,
    color: colors.text.secondary
  },
  metaHighlight: {
    color: colors.primaryBright,
    fontWeight: typography.weights.bold
  },
  metaDot: {
    color: colors.text.muted,
    fontSize: 11
  },
  metaVal: {
    color: colors.text.bright,
    fontWeight: typography.weights.semibold
  },
  expandButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center'
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: spacing.radius.xl,
    paddingVertical: spacing.md,
    minHeight: 52,
    gap: spacing.sm,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10
  },
  startButtonLoading: {
    opacity: 0.8
  },
  startButtonText: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.extrabold,
    color: colors.text.onAccent,
    letterSpacing: 0.5
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs
  },
  progressText: {
    fontSize: 10,
    fontWeight: typography.weights.extrabold,
    color: colors.primary,
    letterSpacing: 0.5
  },
  arriveText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.text.muted
  },
  progressTrack: {
    height: 6,
    backgroundColor: colors.card,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: spacing.md
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3
  },
  navBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  etaCol: {
    flex: 1
  },
  routePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  routeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary
  },
  routeName: {
    fontSize: 11,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium
  },
  playbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs
  },
  alertTriggerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.fastestFaint,
    borderWidth: 1,
    borderColor: colors.fastestBorder,
    alignItems: 'center',
    justifyContent: 'center'
  },
  speedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.radius.pill,
    paddingHorizontal: spacing.sm,
    height: 36
  },
  speedToggleText: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.fastest
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.dangerSoft,
    borderRadius: spacing.radius.md,
    padding: spacing.sm,
    marginBottom: spacing.md
  },
  errorText: {
    fontSize: 11,
    color: colors.dangerBright,
    flex: 1
  }
});
