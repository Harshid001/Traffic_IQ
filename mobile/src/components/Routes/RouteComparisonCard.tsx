import React, { useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Zap, ShieldCheck, Check, ArrowRight, MapPin, Coins, Navigation } from 'lucide-react-native';
import { RouteData } from '../../services/routingService';
import { useNavigationStore } from '../../store/navigationStore';
import { normalizeReliability } from '../../utils/format';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface RouteComparisonCardProps {
  route: RouteData;
  type: 'best' | 'fastest' | 'alternative';
  timeDeltaMin?: number;
}

const RouteComparisonCardBase: React.FC<RouteComparisonCardProps> = ({ route, type, timeDeltaMin }) => {
  const selectedRouteId = useNavigationStore(s => s.selectedRouteId);
  const setSelectedRouteId = useNavigationStore(s => s.setSelectedRouteId);
  const setActiveTab = useNavigationStore(s => s.setActiveTab);

  const isSelected = route.id === selectedRouteId;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const isBest = type === 'best';
  const isFastest = type === 'fastest';

  const reliabilityPct = normalizeReliability(route.reliability?.reliability_score);

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, { toValue: 0.98, useNativeDriver: true, speed: 30 }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 20 }).start();
  }, [scaleAnim]);

  const handleSelect = useCallback(() => {
    setSelectedRouteId(route.id);
  }, [setSelectedRouteId, route.id]);

  const handleNavigate = useCallback(() => {
    setSelectedRouteId(route.id);
    setActiveTab('navigate');
  }, [setSelectedRouteId, setActiveTab, route.id]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handleSelect}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.card,
          isBest && styles.cardBest,
          isFastest && styles.cardFastest,
          isSelected && styles.cardSelected
        ]}
        accessibilityRole="radio"
        accessibilityState={{ checked: isSelected }}
      >
        {/* Top Badge Strip */}
        <View style={styles.topBadgeRow}>
          <View style={styles.tagGroup}>
            {isBest ? (
              <View style={styles.bestTag}>
                <ShieldCheck size={12} color={colors.primary} />
                <Text style={styles.bestTagText}>Smart Recommendation</Text>
              </View>
            ) : isFastest ? (
              <View style={styles.fastestTag}>
                <Zap size={12} color={colors.fastest} />
                <Text style={styles.fastestTagText}>Fastest Time</Text>
              </View>
            ) : (
              <View style={styles.altTag}>
                <Text style={styles.altTagText}>Alternative Route</Text>
              </View>
            )}

            {timeDeltaMin !== undefined && timeDeltaMin !== 0 && (
              <View style={styles.deltaPill}>
                <Text style={styles.deltaText}>
                  {timeDeltaMin > 0 ? `+${timeDeltaMin} min slower` : `${timeDeltaMin} min faster`}
                </Text>
              </View>
            )}
          </View>

          {isSelected ? (
            <View style={styles.selectedPill}>
              <Check size={12} color={colors.primary} />
              <Text style={styles.selectedPillText}>Selected</Text>
            </View>
          ) : (
            <Text style={styles.tapSelectText}>Tap to select</Text>
          )}
        </View>

        {/* Route Name & Big Numbers */}
        <View style={styles.nameRow}>
          <View style={styles.nameCol}>
            <Text style={styles.routeName}>{route.name}</Text>
            {route.summary ? <Text style={styles.routeSummary}>{route.summary}</Text> : null}
          </View>
          <View style={styles.etaBlock}>
            <Text style={styles.etaHero}>
              {route.predicted_eta_p50} <Text style={styles.etaUnit}>min</Text>
            </Text>
            <Text style={styles.distHero}>{route.distance_km} km</Text>
          </View>
        </View>

        {/* Metric Badges Strip */}
        <View style={styles.metricStrip}>
          <View style={styles.metricBadge}>
            <Text style={styles.metricLabel}>Traffic:</Text>
            <Text style={[styles.metricVal, { color: colors.primaryBright }]}>
              {route.congestion_category}
            </Text>
          </View>

          <View style={styles.metricBadge}>
            <Text style={styles.metricLabel}>On-Time:</Text>
            <Text style={styles.metricVal}>
              {reliabilityPct}%
            </Text>
          </View>

          <View style={styles.metricBadge}>
            <Text style={styles.metricLabel}>Tolls:</Text>
            <Text style={styles.metricVal}>
              ₹{route.toll_cost}
            </Text>
          </View>
        </View>

        {/* Action Button Row */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={handleNavigate}
            style={styles.previewBtn}
          >
            <MapPin size={14} color={colors.primary} />
            <Text style={styles.previewBtnText}>Preview On Map</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.75}
            onPress={handleNavigate}
            style={styles.driveBtn}
          >
            <Navigation size={14} color={colors.text.onAccent} />
            <Text style={styles.driveBtnText}>Start Trip</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export const RouteComparisonCard = React.memo(RouteComparisonCardBase);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: spacing.radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.cardPadding,
    marginBottom: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8
  },
  cardBest: {
    borderColor: colors.primaryBorder,
    backgroundColor: colors.primaryFaint
  },
  cardFastest: {
    borderColor: colors.fastestBorder,
    backgroundColor: colors.fastestFaint
  },
  cardSelected: {
    borderWidth: 1.5,
    borderColor: colors.primary
  },
  topBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm
  },
  tagGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs
  },
  bestTag: {
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
  bestTagText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.primary
  },
  fastestTag: {
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
  fastestTagText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.fastest
  },
  altTag: {
    backgroundColor: colors.neutral,
    borderRadius: spacing.radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2
  },
  altTagText: {
    fontSize: 10,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary
  },
  deltaPill: {
    backgroundColor: colors.card,
    borderRadius: spacing.radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: colors.border
  },
  deltaText: {
    fontSize: 10,
    color: colors.text.muted,
    fontWeight: typography.weights.medium
  },
  selectedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: spacing.radius.pill
  },
  selectedPillText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.primary
  },
  tapSelectText: {
    fontSize: 10,
    color: colors.text.muted
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    gap: spacing.md
  },
  nameCol: {
    flex: 1
  },
  routeName: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.extrabold,
    color: colors.text.bright
  },
  routeSummary: {
    fontSize: typography.sizes.caption,
    color: colors.text.secondary,
    marginTop: 2
  },
  etaBlock: {
    alignItems: 'flex-end'
  },
  etaHero: {
    fontSize: typography.sizes.h1,
    lineHeight: 28,
    fontWeight: typography.weights.extrabold,
    color: colors.text.bright
  },
  etaUnit: {
    fontSize: typography.sizes.caption,
    color: colors.primary,
    fontWeight: typography.weights.bold
  },
  distHero: {
    fontSize: typography.sizes.caption,
    fontWeight: typography.weights.semibold,
    color: colors.text.muted
  },
  metricStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: spacing.radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    marginBottom: spacing.md
  },
  metricBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1
  },
  metricLabel: {
    fontSize: 10,
    color: colors.text.muted
  },
  metricVal: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.text.primary
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm
  },
  previewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm
  },
  previewBtnText: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.primary
  },
  driveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.primary,
    borderRadius: spacing.radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 6
  },
  driveBtnText: {
    fontSize: 11,
    fontWeight: typography.weights.extrabold,
    color: colors.text.onAccent
  }
});
