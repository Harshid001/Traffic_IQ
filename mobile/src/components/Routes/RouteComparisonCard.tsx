import React, { useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Zap, ShieldCheck, Check, ArrowRight, Star } from 'lucide-react-native';
import { RouteData } from '../../services/routingService';
import { useNavigationStore } from '../../store/navigationStore';
import { normalizeReliability } from '../../utils/format';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface RouteComparisonCardProps {
  route: RouteData;
  type: 'best' | 'fastest' | 'alternative';
}

const RouteComparisonCardBase: React.FC<RouteComparisonCardProps> = ({ route, type }) => {
  const selectedRouteId = useNavigationStore(s => s.selectedRouteId);
  const setSelectedRouteId = useNavigationStore(s => s.setSelectedRouteId);
  const setActiveTab = useNavigationStore(s => s.setActiveTab);

  const isSelected = route.id === selectedRouteId;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const isBest = type === 'best';
  const isFastest = type === 'fastest';

  // Reliability may arrive as a decimal fraction (0.64) or a percentage (64).
  const reliabilityPct = normalizeReliability(route.reliability?.reliability_score);

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true, speed: 30 }).start();
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

  const typeLabel = isBest ? 'Best for you' : isFastest ? 'Fastest route' : 'Alternative route';

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
        accessibilityLabel={`${typeLabel}: ${route.name}. ${route.predicted_eta_p50} minutes, ${route.distance_km} kilometres. Traffic ${route.congestion_category}. Reliability ${reliabilityPct} percent. Toll ${route.toll_cost} rupees.`}
        accessibilityHint={isSelected ? 'Currently selected' : 'Tap to select this route'}
      >
        {/* Top Badge Strip */}
        <View style={styles.topBadgeRow}>
          {isBest ? (
            <View style={styles.bestTag}>
              <ShieldCheck size={12} color={colors.primary} />
              <Text style={styles.bestTagText}>Best For You</Text>
            </View>
          ) : isFastest ? (
            <View style={styles.fastestTag}>
              <Zap size={12} color={colors.fastest} />
              <Text style={styles.fastestTagText}>Fastest</Text>
            </View>
          ) : (
            <View style={styles.altTag}>
              <Text style={styles.altTagText}>Alternative</Text>
            </View>
          )}

          {isSelected ? (
            <View style={styles.selectedPill}>
              <Check size={12} color={colors.primary} />
              <Text style={styles.selectedPillText}>Selected</Text>
            </View>
          ) : (
            <Text style={styles.tapSelectText}>Tap to select</Text>
          )}
        </View>

        {/* Name and Major Numbers */}
        <View style={styles.nameRow}>
          <View style={styles.nameCol}>
            <Text style={styles.routeName}>{route.name}</Text>
            {route.summary ? <Text style={styles.routeSummary}>{route.summary}</Text> : null}
          </View>
          <View style={styles.etaCol}>
            <Text style={styles.etaNumber}>
              {route.predicted_eta_p50} <Text style={styles.etaUnit}>min</Text>
            </Text>
            <Text style={styles.distText}>{route.distance_km} km</Text>
          </View>
        </View>

        {/* 3 Metrics */}
        <View style={styles.metricsRow}>
          <View style={styles.metricCell}>
            <Text style={styles.metricLabel}>TRAFFIC</Text>
            <Text style={[styles.metricVal, { color: colors.primary }]}>
              {route.congestion_category || '—'}
            </Text>
          </View>
          <View style={styles.metricCell}>
            <Text style={styles.metricLabel}>RELIABILITY</Text>
            <Text style={[styles.metricVal, { color: colors.text.bright }]}>
              {route.reliability ? `${reliabilityPct}%` : '—'}
            </Text>
          </View>
          <View style={styles.metricCell}>
            <Text style={styles.metricLabel}>TOLL</Text>
            <Text style={[styles.metricVal, { color: colors.text.body }]}>₹{route.toll_cost}</Text>
          </View>
        </View>

        {/* Footer Navigation Action */}
        <View style={styles.footerRow}>
          <View style={styles.highlightRow}>
            {isBest ? (
              <Star size={11} color={colors.text.secondary} />
            ) : isFastest ? (
              <Zap size={11} color={colors.text.secondary} />
            ) : null}
            <Text style={styles.highlightText} numberOfLines={2}>
              {isBest
                ? 'Balances congestion risk and reliability'
                : isFastest
                  ? 'Lowest nominal travel time'
                  : 'Candidate considered during scoring'}
            </Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleNavigate}
            style={styles.navButton}
            hitSlop={spacing.hitSlop}
            accessibilityRole="button"
            accessibilityLabel={`Navigate using ${route.name}`}
          >
            <Text style={styles.navButtonText}>Navigate</Text>
            <ArrowRight size={12} color={colors.text.bright} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

/**
 * Memoized: `RoutesScreen` renders this for every candidate route, and each one
 * subscribes to the store independently.
 */
export const RouteComparisonCard = React.memo(RouteComparisonCardBase);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: spacing.radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.cardPadding,
    marginBottom: spacing.lg
  },
  cardBest: {
    borderColor: colors.primaryBorder,
    backgroundColor: colors.primaryTint
  },
  cardFastest: {
    borderColor: colors.fastestBorder,
    backgroundColor: colors.fastestTint
  },
  cardSelected: {
    borderWidth: 1.5,
    borderColor: colors.primary
  },
  topBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    gap: spacing.md
  },
  bestTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    borderRadius: spacing.radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 3
  },
  bestTagText: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    fontWeight: typography.weights.extrabold,
    color: colors.primary,
    textTransform: 'uppercase'
  },
  fastestTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.fastestSoft,
    borderWidth: 1,
    borderColor: colors.fastestBorder,
    borderRadius: spacing.radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 3
  },
  fastestTagText: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    fontWeight: typography.weights.extrabold,
    color: colors.fastest,
    textTransform: 'uppercase'
  },
  altTag: {
    backgroundColor: colors.neutral,
    borderRadius: spacing.radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 3
  },
  altTagText: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    fontWeight: typography.weights.bold,
    color: colors.text.secondary,
    textTransform: 'uppercase'
  },
  selectedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs
  },
  selectedPillText: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    fontWeight: typography.weights.bold,
    color: colors.primary
  },
  tapSelectText: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    color: colors.text.muted
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    gap: spacing.lg
  },
  nameCol: {
    flex: 1
  },
  routeName: {
    fontSize: typography.sizes.label,
    lineHeight: typography.line.label,
    fontWeight: typography.weights.bold,
    color: colors.text.bright
  },
  routeSummary: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    color: colors.text.secondary,
    marginTop: 1
  },
  etaCol: {
    alignItems: 'flex-end'
  },
  etaNumber: {
    fontSize: typography.sizes.h1,
    lineHeight: typography.line.h1,
    fontWeight: typography.weights.extrabold,
    color: colors.text.bright
  },
  etaUnit: {
    fontSize: typography.sizes.micro,
    fontWeight: typography.weights.regular,
    color: colors.text.secondary
  },
  distText: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    fontWeight: typography.weights.semibold,
    color: colors.text.body
  },
  metricsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginBottom: spacing.md
  },
  metricCell: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: spacing.radius.sm,
    padding: spacing.md,
    alignItems: 'center'
  },
  metricLabel: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    fontWeight: typography.weights.extrabold,
    color: colors.text.muted
  },
  metricVal: {
    fontSize: typography.sizes.caption,
    lineHeight: typography.line.caption,
    fontWeight: typography.weights.bold,
    marginTop: 2,
    textTransform: 'capitalize'
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1
  },
  highlightText: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    color: colors.text.secondary,
    flex: 1
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.neutral,
    borderRadius: spacing.radius.sm,
    paddingHorizontal: spacing.lg,
    minHeight: 36,
    justifyContent: 'center'
  },
  navButtonText: {
    fontSize: typography.sizes.caption,
    fontWeight: typography.weights.bold,
    color: colors.text.bright
  }
});
