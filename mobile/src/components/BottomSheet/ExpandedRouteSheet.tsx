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
  GripHorizontal,
  Clock,
  Coins,
  Activity,
  Sparkles
} from 'lucide-react-native';
import { useNavigationStore } from '../../store/navigationStore';
import { normalizeReliability } from '../../utils/format';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { useLayout } from '../../theme/useLayout';

const ExpandedRouteSheetBase: React.FC = () => {
  const { sheetMaxHeight } = useLayout();
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
    <View style={[styles.container, { maxHeight: sheetMaxHeight }]}>
      {/* Top Header with Drag Handle & Close */}
      <View style={styles.topHeader}>
        <View style={styles.dragBarSlot}>
          <GripHorizontal size={20} color={colors.borderStrong} />
        </View>
        <TouchableOpacity
          activeOpacity={0.75}
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
        {/* Selected Route Title & Hero Metrics */}
        <View style={styles.routeHeader}>
          <View style={styles.titleBadgeRow}>
            {selectedRoute.is_best ? (
              <View style={styles.bestBadge}>
                <ShieldCheck size={12} color={colors.primary} />
                <Text style={styles.bestBadgeText}>Smart Recommendation</Text>
              </View>
            ) : selectedRoute.is_fastest ? (
              <View style={styles.fastestBadge}>
                <Zap size={12} color={colors.fastest} />
                <Text style={styles.fastestBadgeText}>Fastest Route</Text>
              </View>
            ) : (
              <View style={styles.altBadge}>
                <Text style={styles.altBadgeText}>Alternative Option</Text>
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

        {/* Key Metrics Grid */}
        <View style={styles.metricGrid}>
          <View style={styles.metricCell}>
            <View style={styles.metricHeaderRow}>
              <Activity size={12} color={colors.primary} />
              <Text style={styles.metricLabel}>LIVE TRAFFIC</Text>
            </View>
            <Text style={[styles.metricVal, { color: colors.primaryBright }]}>
              {selectedRoute.congestion_category}
            </Text>
          </View>

          <View style={styles.metricCell}>
            <View style={styles.metricHeaderRow}>
              <ShieldCheck size={12} color={colors.info} />
              <Text style={styles.metricLabel}>ON-TIME</Text>
            </View>
            <Text style={[styles.metricVal, { color: colors.text.bright }]}>
              {selectedRoute.reliability ? `${reliabilityPct}%` : 'High'}
            </Text>
          </View>

          <View style={styles.metricCell}>
            <View style={styles.metricHeaderRow}>
              <Coins size={12} color={colors.text.secondary} />
              <Text style={styles.metricLabel}>TOLL</Text>
            </View>
            <Text style={[styles.metricVal, { color: colors.text.strong }]}>
              ₹{selectedRoute.toll_cost}
            </Text>
          </View>
        </View>



        {/* Available Alternative Routes List */}
        <View style={styles.routesSection}>
          <Text style={styles.sectionTitle}>ALL CANDIDATE ROUTES</Text>
          {routes.map((r) => {
            const isSelected = r.id === selectedRouteId;
            return (
              <TouchableOpacity
                key={r.id}
                activeOpacity={0.75}
                onPress={() => setSelectedRouteId(r.id)}
                style={[styles.routeCard, isSelected && styles.routeCardSelected]}
                accessibilityRole="radio"
                accessibilityState={{ checked: isSelected }}
              >
                <View style={styles.routeCardLeft}>
                  <View style={styles.routeCardBadgeRow}>
                    {r.is_best ? (
                      <View style={styles.inlineTag}>
                        <Star size={10} color={colors.primary} />
                        <Text style={styles.routeCardBestTag}>RECOMMENDED</Text>
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
            <Text style={styles.sectionTitle}>TURN-BY-TURN GUIDANCE</Text>
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
              {isStartingNavigation ? 'Preparing Guidance...' : navStarted ? 'Navigation Started' : 'Start Navigation'}
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
    minHeight: 360,
    flex: 1,
    backgroundColor: 'rgba(17, 21, 26, 0.98)',
    borderTopWidth: 1.2,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
    borderTopLeftRadius: spacing.radius.xxl,
    borderTopRightRadius: spacing.radius.xxl,
    paddingHorizontal: spacing.cardPadding,
    paddingBottom: spacing.xxl
  },
  topHeader: {
    height: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs
  },
  dragBarSlot: {
    flex: 1,
    alignItems: 'center'
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)'
  },
  scrollContent: {
    paddingBottom: spacing.xxl
  },
  routeHeader: {
    marginBottom: spacing.md
  },
  titleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs
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
    paddingVertical: 2
  },
  bestBadgeText: {
    fontSize: 10,
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
    paddingVertical: 2
  },
  fastestBadgeText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.fastestBright
  },
  altBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2
  },
  altBadgeText: {
    fontSize: 10,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary
  },
  routeName: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
    flex: 1
  },
  etaRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.md
  },
  etaHero: {
    fontSize: typography.sizes.hero,
    lineHeight: 38,
    fontWeight: typography.weights.extrabold,
    color: colors.text.bright
  },
  etaUnit: {
    fontSize: typography.sizes.h3,
    fontWeight: typography.weights.semibold,
    color: colors.primaryBright
  },
  distHero: {
    fontSize: typography.sizes.h2,
    fontWeight: typography.weights.bold,
    color: colors.text.secondary
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md
  },
  metricCell: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: 'rgba(22, 27, 34, 0.92)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: spacing.md
  },
  metricHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4
  },
  metricLabel: {
    fontSize: 8.5,
    fontWeight: typography.weights.extrabold,
    color: colors.text.muted,
    letterSpacing: 0.5
  },
  metricVal: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold
  },
  whyBox: {
    backgroundColor: 'rgba(200, 205, 212, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(200, 205, 212, 0.22)',
    borderRadius: 14,
    padding: spacing.md,
    marginBottom: spacing.md
  },
  whyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 4
  },
  whyHeaderText: {
    fontSize: 10,
    fontWeight: typography.weights.extrabold,
    color: colors.primaryBright,
    letterSpacing: 0.5
  },
  whyText: {
    fontSize: typography.sizes.caption,
    lineHeight: 18,
    color: colors.text.body
  },
  routesSection: {
    marginBottom: spacing.md
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: typography.weights.extrabold,
    color: colors.text.muted,
    letterSpacing: 0.5,
    marginBottom: spacing.sm
  },
  routeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(22, 27, 34, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    padding: spacing.md,
    marginBottom: spacing.sm
  },
  routeCardSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(200, 205, 212, 0.12)'
  },
  routeCardLeft: {
    flex: 1
  },
  routeCardBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 2
  },
  inlineTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.surface,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4
  },
  routeCardBestTag: {
    fontSize: 9,
    fontWeight: typography.weights.extrabold,
    color: colors.primaryBright
  },
  routeCardFastestTag: {
    fontSize: 9,
    fontWeight: typography.weights.extrabold,
    color: colors.fastestBright
  },
  routeCardAltTag: {
    fontSize: 9,
    fontWeight: typography.weights.bold,
    color: colors.text.muted
  },
  routeCardName: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    flex: 1
  },
  routeCardSub: {
    fontSize: typography.sizes.caption,
    color: colors.text.secondary,
    marginTop: 2
  },
  routeCardRight: {
    alignItems: 'flex-end'
  },
  routeCardEta: {
    fontSize: typography.sizes.h3,
    fontWeight: typography.weights.extrabold,
    color: colors.text.bright
  },
  routeCardEtaUnit: {
    fontSize: 11,
    color: colors.primaryBright
  },
  selectedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 2
  },
  selectedTagText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.primaryBright
  },
  maneuversSection: {
    marginBottom: spacing.md
  },
  maneuverItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    gap: spacing.md
  },
  maneuverNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)'
  },
  maneuverNumText: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.text.secondary
  },
  maneuverTextCol: {
    flex: 1
  },
  maneuverInstruction: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary
  },
  maneuverRoad: {
    fontSize: typography.sizes.caption,
    color: colors.text.muted,
    marginTop: 1
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
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    paddingVertical: spacing.md,
    minHeight: 50,
    gap: spacing.sm,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8
  },
  startButtonLoading: {
    opacity: 0.8
  },
  startButtonText: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.extrabold,
    color: '#080A0D',
    letterSpacing: 0.5
  }
});
