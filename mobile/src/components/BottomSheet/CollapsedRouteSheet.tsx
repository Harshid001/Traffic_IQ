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
  Sparkles,
  RotateCcw
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
    const isReached = progressPct >= 1.0;
    const progressWhole = isReached ? 100 : Math.round(progressPct * 100);
    return (
      <View style={styles.sheet}>
        {/* Progress Header */}
        <View style={styles.progressRow}>
          <Text style={[styles.progressText, isReached && styles.progressTextComplete]}>
            {isReached ? 'TRIP COMPLETED (100%)' : `TRIP PROGRESS (${progressWhole}%)`}
          </Text>
          <Text style={styles.arriveText}>
            {isReached ? 'DESTINATION REACHED' : `EST. ARRIVAL ${arrivalTime}`}
          </Text>
        </View>

        {/* Progress Bar Track */}
        <View
          style={styles.progressTrack}
          accessibilityRole="progressbar"
          accessibilityValue={{ min: 0, max: 100, now: progressWhole }}
          accessibilityLabel={`Trip progress ${progressWhole} percent`}
        >
          <View style={[styles.progressFill, { width: `${progressWhole}%` }, isReached && styles.progressFillComplete]} />
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
            accessibilityLabel={isReached ? 'Trip completed, arrived at destination.' : `${remainingEtaMin} minutes and ${remainingDistanceKm} km remaining.`}
          >
            {isReached ? (
              <View style={styles.etaRow}>
                <Text style={styles.arrivedTitle}>Arrived 🎉</Text>
              </View>
            ) : (
              <View style={styles.etaRow}>
                <Text style={styles.etaBig}>
                  {remainingEtaMin} <Text style={styles.etaUnit}>min</Text>
                </Text>
                <Text style={styles.distBig}>{remainingDistanceKm} km</Text>
              </View>
            )}
            <View style={styles.routePill}>
              <View style={[styles.routeDot, isReached && styles.routeDotComplete]} />
              <Text style={styles.routeName} numberOfLines={1}>
                {isReached ? 'Destination reached' : selectedRoute.name}
              </Text>
            </View>
          </TouchableOpacity>

          {/* In-Drive Simulation Tools or Restart Button */}
          {isReached ? (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleStartNavigation}
              style={styles.restartDemoButton}
              accessibilityRole="button"
              accessibilityLabel="Restart navigation demo from beginning"
            >
              <RotateCcw size={15} color="#080A0D" strokeWidth={2.8} />
              <Text style={styles.restartDemoButtonText}>Restart Demo</Text>
            </TouchableOpacity>
          ) : (
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
                  <Pause size={18} color="#080A0D" strokeWidth={3} />
                ) : (
                  <Play size={18} color="#080A0D" strokeWidth={3} />
                )}
              </TouchableOpacity>
            </View>
          )}
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
        <View style={styles.dragBar} />
      </TouchableOpacity>

      {/* Primary Route Summary */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryInfo}>
          <View style={styles.badgeRow}>
            {isBest ? (
              <View style={styles.bestBadge}>
                <ShieldCheck size={11} color={colors.primary} />
                <Text style={styles.bestBadgeText}>Recommended</Text>
              </View>
            ) : isFastest ? (
              <View style={styles.fastestBadge}>
                <Zap size={11} color={colors.fastest} />
                <Text style={styles.fastestBadgeText}>Fastest</Text>
              </View>
            ) : (
              <View style={styles.altBadge}>
                <Text style={styles.altBadgeText}>Alternative</Text>
              </View>
            )}
          </View>

          <View style={styles.etaRow}>
            <Text style={styles.etaBig}>
              {selectedRoute.predicted_eta_p50} <Text style={styles.etaUnit}>min</Text>
            </Text>
            <Text style={styles.distBig}>{selectedRoute.distance_km} km</Text>
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
          <ChevronUp size={16} color={colors.text.secondary} />
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
            size={18}
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
    backgroundColor: 'rgba(17, 21, 26, 0.95)',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingTop: 6,
    paddingBottom: 14,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20
  },
  dragBarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 16,
    marginBottom: 4
  },
  dragBar: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.18)'
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: spacing.md
  },
  summaryInfo: {
    flex: 1
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4
  },
  bestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(200, 205, 212, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(200, 205, 212, 0.35)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 1.5
  },
  bestBadgeText: {
    fontSize: 9.5,
    fontWeight: typography.weights.bold,
    color: colors.primaryBright
  },
  fastestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.35)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 1.5
  },
  fastestBadgeText: {
    fontSize: 9.5,
    fontWeight: typography.weights.bold,
    color: colors.fastestBright
  },
  altBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 1.5
  },
  altBadgeText: {
    fontSize: 9.5,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary
  },
  tollText: {
    fontSize: 10.5,
    fontWeight: typography.weights.semibold,
    color: colors.text.muted
  },
  etaRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 2
  },
  etaBig: {
    fontSize: 26,
    lineHeight: 30,
    fontWeight: typography.weights.extrabold,
    color: colors.text.bright
  },
  etaUnit: {
    fontSize: 12,
    fontWeight: typography.weights.bold,
    color: colors.primaryBright
  },
  distBig: {
    fontSize: 14,
    fontWeight: typography.weights.bold,
    color: colors.text.secondary
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  metaText: {
    fontSize: 10.5,
    color: colors.text.secondary
  },
  metaHighlight: {
    color: colors.primaryBright,
    fontWeight: typography.weights.bold
  },
  metaDot: {
    color: colors.text.muted,
    fontSize: 10
  },
  metaVal: {
    color: colors.text.bright,
    fontWeight: typography.weights.semibold
  },
  expandButton: {
    width: 34,
    height: 34,
    borderRadius: 12,
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
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    paddingVertical: 11,
    minHeight: 48,
    gap: 8,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8
  },
  startButtonLoading: {
    opacity: 0.8
  },
  startButtonText: {
    fontSize: 14,
    fontWeight: typography.weights.extrabold,
    color: '#080A0D',
    letterSpacing: 0.3
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  progressText: {
    fontSize: 10,
    fontWeight: typography.weights.extrabold,
    color: colors.primaryBright,
    letterSpacing: 0.6
  },
  progressTextComplete: {
    color: '#38BDF8'
  },
  arriveText: {
    fontSize: 10.5,
    fontWeight: typography.weights.bold,
    color: colors.text.secondary
  },
  progressTrack: {
    height: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primaryBright,
    borderRadius: 3
  },
  progressFillComplete: {
    backgroundColor: '#38BDF8'
  },
  arrivedTitle: {
    fontSize: 22,
    lineHeight: 26,
    fontWeight: typography.weights.extrabold,
    color: colors.text.bright
  },
  navBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  etaCol: {
    flex: 1,
    minWidth: 0
  },
  routePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2
  },
  routeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primaryBright
  },
  routeDotComplete: {
    backgroundColor: '#38BDF8'
  },
  restartDemoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    height: 42,
    gap: 6,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8
  },
  restartDemoButtonText: {
    fontSize: 12,
    fontWeight: typography.weights.extrabold,
    color: '#080A0D',
    letterSpacing: 0.3
  },
  routeName: {
    fontSize: 11,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium
  },
  playbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  alertTriggerBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.35)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  speedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 12,
    paddingHorizontal: 8,
    height: 36
  },
  speedToggleText: {
    fontSize: 11,
    fontWeight: typography.weights.extrabold,
    color: colors.fastestBright
  },
  playButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8
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
