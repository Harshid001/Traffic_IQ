import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import {
  ShieldCheck,
  Zap,
  ChevronDown,
  Check,
  Navigation2,
  Star,
  AlertTriangle,
  GripHorizontal
} from 'lucide-react-native';
import { useNavigationStore } from '../../store/navigationStore';
import { normalizeReliability } from '../../utils/format';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

const ExpandedRouteSheetBase: React.FC = () => {
  const routingData = useNavigationStore(s => s.routingData);
  const selectedRouteId = useNavigationStore(s => s.selectedRouteId);
  const setSelectedRouteId = useNavigationStore(s => s.setSelectedRouteId);
  const startNavigation = useNavigationStore(s => s.startNavigation);
  const isNavigating = useNavigationStore(s => s.isNavigating);
  const isStartingNavigation = useNavigationStore(s => s.isStartingNavigation);
  const navigationError = useNavigationStore(s => s.navigationError);
  const toggleBottomSheet = useNavigationStore(s => s.toggleBottomSheet);
  const maneuvers = useNavigationStore(s => s.maneuvers);

  const [navStarted, setNavStarted] = useState(false);

  const routes = routingData?.routes ?? [];
  const selectedRoute = routes.find(r => r.id === selectedRouteId) || routes[0];

  // Reliability may arrive as a decimal fraction (0.64) or a percentage (64).
  // This guard was missing here, so the sheet rendered "0.64%".
  const reliabilityPct = normalizeReliability(selectedRoute?.reliability?.reliability_score);

  const handleStart = useCallback(async () => {
    setNavStarted(false);
    try {
      await startNavigation();
      setNavStarted(true);
    } catch {
      setNavStarted(false);
    }
  }, [startNavigation]);

  if (!selectedRoute) return null;

  const congestion =
    selectedRoute.avg_congestion === undefined || selectedRoute.avg_congestion === null
      ? null
      : Math.round(selectedRoute.avg_congestion);

  return (
    <View style={styles.container}>
      {/* Drag Bar & Close */}
      <View style={styles.topHeader}>
        <View style={styles.dragBarSlot}>
          <GripHorizontal size={20} color={colors.borderStrong} />
        </View>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={toggleBottomSheet}
          style={styles.closeButton}
          hitSlop={spacing.hitSlop}
          accessibilityRole="button"
          accessibilityLabel="Collapse route details"
        >
          <ChevronDown size={18} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Selected Route Title & Big Numbers */}
        <View style={styles.routeHeader}>
          <View style={styles.titleBadgeRow}>
            {selectedRoute.is_best ? (
              <View style={styles.bestBadge}>
                <ShieldCheck size={12} color={colors.primary} />
                <Text style={styles.bestBadgeText}>Best Route</Text>
              </View>
            ) : selectedRoute.is_fastest ? (
              <View style={styles.fastestBadge}>
                <Zap size={12} color={colors.fastest} />
                <Text style={styles.fastestBadgeText}>Fastest Route</Text>
              </View>
            ) : (
              <View style={styles.altBadge}>
                <Text style={styles.altBadgeText}>Alternative</Text>
              </View>
            )}
            <Text style={styles.routeName} numberOfLines={1}>
              {selectedRoute.name}
            </Text>
          </View>

          <View style={styles.etaRow}>
            <Text style={styles.etaHero}>
              {selectedRoute.predicted_eta_p50} <Text style={styles.etaUnit}>min</Text>
            </Text>
            <Text style={styles.distHero}>{selectedRoute.distance_km} km</Text>
          </View>
        </View>

        {/* 4-Cell Metric Grid */}
        <View style={styles.metricGrid}>
          <View style={styles.metricCell}>
            <Text style={styles.metricLabel}>TRAFFIC STATE</Text>
            <Text style={[styles.metricVal, { color: colors.primary }]}>
              {selectedRoute.congestion_category}
              {congestion !== null ? ` (${congestion}%)` : ''}
            </Text>
          </View>

          <View style={styles.metricCell}>
            <Text style={styles.metricLabel}>RELIABILITY</Text>
            <Text style={[styles.metricVal, { color: colors.text.bright }]}>
              {selectedRoute.reliability
                ? `${reliabilityPct}% (${selectedRoute.reliability.reliability_label})`
                : '—'}
            </Text>
          </View>

          <View style={styles.metricCell}>
            <Text style={styles.metricLabel}>CHRONOS FORECAST</Text>
            <Text style={[styles.metricVal, { color: colors.fastest }]}>
              {selectedRoute.trend || '—'}
              {selectedRoute.forecast_20m_p50 !== undefined && selectedRoute.forecast_20m_p50 !== null
                ? ` (${Math.round(selectedRoute.forecast_20m_p50)}% @ +20m)`
                : ''}
            </Text>
          </View>

          <View style={styles.metricCell}>
            <Text style={styles.metricLabel}>TOLL ROAD</Text>
            <Text style={[styles.metricVal, { color: colors.text.strong }]}>
              ₹{selectedRoute.toll_cost}
            </Text>
          </View>
        </View>

        {/* "WHY THIS ROUTE?" summary. Only asserts what the payload supports. */}
        <View style={styles.whyBox}>
          <View style={styles.whyHeader}>
            <ShieldCheck size={14} color={colors.primary} />
            <Text style={styles.whyHeaderText}>WHY THIS ROUTE?</Text>
          </View>
          <Text style={styles.whyText}>
            {selectedRoute.is_best
              ? `Selected for the best balance of congestion${congestion !== null ? ` (${congestion}%)` : ''}${selectedRoute.reliability ? ` and reliability (${reliabilityPct}%)` : ''}.`
              : selectedRoute.is_fastest
                ? `Lowest nominal travel time (${selectedRoute.predicted_eta_p50} min).`
                : 'A candidate route considered during multi-objective scoring.'}
          </Text>
        </View>

        {/* Available Routes List */}
        <View style={styles.routesSection}>
          <Text style={styles.sectionTitle}>AVAILABLE CANDIDATE ROUTES</Text>
          {routes.map((r) => {
            const isSelected = r.id === selectedRouteId;
            return (
              <TouchableOpacity
                key={r.id}
                activeOpacity={0.7}
                onPress={() => setSelectedRouteId(r.id)}
                style={[styles.routeCard, isSelected && styles.routeCardSelected]}
                accessibilityRole="radio"
                accessibilityState={{ checked: isSelected }}
                accessibilityLabel={`${r.name}. ${r.predicted_eta_p50} minutes, ${r.distance_km} kilometres, ${r.congestion_category}, toll ${r.toll_cost} rupees.`}
              >
                <View style={styles.routeCardLeft}>
                  <View style={styles.routeCardBadgeRow}>
                    {r.is_best ? (
                      <View style={styles.inlineTag}>
                        <Star size={10} color={colors.primary} />
                        <Text style={styles.routeCardBestTag}>BEST</Text>
                      </View>
                    ) : r.is_fastest ? (
                      <View style={styles.inlineTag}>
                        <Zap size={10} color={colors.fastest} />
                        <Text style={styles.routeCardFastestTag}>FASTEST</Text>
                      </View>
                    ) : (
                      <Text style={styles.routeCardAltTag}>ALT</Text>
                    )}
                    <Text style={styles.routeCardName} numberOfLines={1}>
                      {r.name}
                    </Text>
                  </View>
                  <Text style={styles.routeCardSub}>
                    {r.distance_km} km • {r.congestion_category} • Toll: ₹{r.toll_cost}
                  </Text>
                </View>

                <View style={styles.routeCardRight}>
                  <Text style={styles.routeCardEta}>
                    {r.predicted_eta_p50} <Text style={styles.routeCardEtaUnit}>min</Text>
                  </Text>
                  {isSelected && (
                    <View style={styles.selectedTag}>
                      <Check size={12} color={colors.primary} />
                      <Text style={styles.selectedTagText}>Selected</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Turn-by-Turn Maneuvers if Navigating */}
        {isNavigating && maneuvers.length > 0 && (
          <View style={styles.maneuversSection}>
            <Text style={styles.sectionTitle}>TURN-BY-TURN MANEUVERS</Text>
            {maneuvers.map((m, idx) => (
              <View key={`${m.step}-${idx}`} style={styles.maneuverItem}>
                <View style={styles.maneuverNum}>
                  <Text style={styles.maneuverNumText}>{idx + 1}</Text>
                </View>
                <View style={styles.maneuverTextCol}>
                  <Text style={styles.maneuverInstruction}>{m.instruction}</Text>
                  <Text style={styles.maneuverRoad}>
                    {m.road_name} ({m.distance_km} km)
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {navigationError && (
          <View style={styles.errorRow}>
            <AlertTriangle size={12} color={colors.danger} />
            <Text style={styles.errorText}>{navigationError}</Text>
          </View>
        )}

        {/* Start Navigation Action Button */}
        {!isNavigating && (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleStart}
            disabled={isStartingNavigation}
            style={[styles.startButton, isStartingNavigation && styles.startButtonLoading]}
            accessibilityRole="button"
            accessibilityLabel={
              isStartingNavigation
                ? 'Starting navigation'
                : `Start navigation on ${selectedRoute.name}`
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
              {isStartingNavigation
                ? 'Starting...'
                : navStarted
                  ? 'Navigation Started'
                  : 'Start Navigation'}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

export const ExpandedRouteSheet = React.memo(ExpandedRouteSheetBase);

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: spacing.radius.xxl,
    borderTopRightRadius: spacing.radius.xxl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    maxHeight: 560,
    padding: spacing.cardPadding
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md
  },
  dragBarSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // Offset the close button so the grip stays optically centred.
    paddingLeft: 38
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: spacing.radius.md,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center'
  },
  scrollContent: {
    paddingBottom: spacing.xxl
  },
  routeHeader: {
    marginBottom: spacing.xl
  },
  titleBadgeRow: {
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
  routeName: {
    fontSize: typography.sizes.caption,
    lineHeight: typography.line.caption,
    color: colors.text.secondary,
    fontWeight: typography.weights.semibold,
    flex: 1
  },
  etaRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.lg,
    marginTop: spacing.xs
  },
  etaHero: {
    fontSize: typography.sizes.hero,
    lineHeight: typography.line.hero,
    fontWeight: typography.weights.extrabold,
    color: colors.text.bright
  },
  etaUnit: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.regular,
    color: colors.text.secondary
  },
  distHero: {
    fontSize: typography.sizes.h3,
    lineHeight: typography.line.h3,
    fontWeight: typography.weights.semibold,
    color: colors.text.body
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xl
  },
  metricCell: {
    // `flexBasis` keeps two cells per row without a hardcoded percentage width
    // that breaks when the gap changes.
    flexGrow: 1,
    flexBasis: '46%',
    backgroundColor: colors.card,
    borderRadius: spacing.radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg
  },
  metricLabel: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    fontWeight: typography.weights.extrabold,
    color: colors.text.muted,
    letterSpacing: typography.tracking.normal
  },
  metricVal: {
    fontSize: typography.sizes.caption,
    lineHeight: typography.line.caption,
    fontWeight: typography.weights.bold,
    marginTop: 3,
    textTransform: 'capitalize'
  },
  whyBox: {
    backgroundColor: colors.primaryFaint,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    borderRadius: spacing.radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl
  },
  whyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs
  },
  whyHeaderText: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    fontWeight: typography.weights.extrabold,
    color: colors.primary,
    letterSpacing: typography.tracking.normal
  },
  whyText: {
    fontSize: typography.sizes.caption,
    lineHeight: typography.line.caption,
    color: colors.text.body
  },
  routesSection: {
    marginBottom: spacing.xl
  },
  sectionTitle: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    fontWeight: typography.weights.extrabold,
    color: colors.text.muted,
    letterSpacing: typography.tracking.normal,
    marginBottom: spacing.md
  },
  routeCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.radius.md,
    padding: spacing.lg,
    minHeight: spacing.touchTargetMin,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    gap: spacing.md
  },
  routeCardSelected: {
    backgroundColor: colors.primaryFaint,
    borderColor: colors.primary
  },
  routeCardLeft: {
    flex: 1
  },
  routeCardBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 3
  },
  inlineTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3
  },
  routeCardBestTag: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    fontWeight: typography.weights.extrabold,
    color: colors.primary
  },
  routeCardFastestTag: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    fontWeight: typography.weights.extrabold,
    color: colors.fastest
  },
  routeCardAltTag: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    fontWeight: typography.weights.bold,
    color: colors.text.secondary
  },
  routeCardName: {
    fontSize: typography.sizes.caption,
    lineHeight: typography.line.caption,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    flex: 1
  },
  routeCardSub: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    color: colors.text.secondary
  },
  routeCardRight: {
    alignItems: 'flex-end'
  },
  routeCardEta: {
    fontSize: typography.sizes.h3,
    lineHeight: typography.line.h3,
    fontWeight: typography.weights.extrabold,
    color: colors.text.bright
  },
  routeCardEtaUnit: {
    fontSize: typography.sizes.micro,
    fontWeight: typography.weights.regular,
    color: colors.text.secondary
  },
  selectedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 2
  },
  selectedTagText: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    fontWeight: typography.weights.bold,
    color: colors.primary
  },
  maneuversSection: {
    marginBottom: spacing.xl
  },
  maneuverItem: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.radius.md,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm
  },
  maneuverNum: {
    width: 24,
    height: 24,
    borderRadius: spacing.radius.sm,
    backgroundColor: colors.neutral,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg
  },
  maneuverNumText: {
    fontSize: typography.sizes.micro,
    fontWeight: typography.weights.extrabold,
    color: colors.primary
  },
  maneuverTextCol: {
    flex: 1
  },
  maneuverInstruction: {
    fontSize: typography.sizes.caption,
    lineHeight: typography.line.caption,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary
  },
  maneuverRoad: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    color: colors.text.secondary,
    marginTop: 1
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
  },
  startButton: {
    backgroundColor: colors.primary,
    borderRadius: spacing.radius.xl,
    minHeight: spacing.touchTargetComfortable,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md
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
  }
});
