import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  ShieldCheck,
  Zap,
  TrendingDown,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Minus,
  Clock,
  Coins,
  Scale
} from 'lucide-react-native';
import { RouteData } from '../../services/routingService';
import { normalizeReliability } from '../../utils/format';
import { Card } from '../Common/Card';
import { Badge } from '../Common/Badge';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface TradeoffMatrixProps {
  fastestRoute: RouteData;
  bestRoute: RouteData;
}

interface Comparison {
  key: string;
  label: string;
  icon: React.ReactNode;
  delta: number;
  text: string;
}

const TradeoffMatrixBase: React.FC<TradeoffMatrixProps> = ({ fastestRoute, bestRoute }) => {
  const durationDiff = useMemo(
    () => Math.round((bestRoute.predicted_eta_p50 - fastestRoute.predicted_eta_p50) * 10) / 10,
    [bestRoute.predicted_eta_p50, fastestRoute.predicted_eta_p50]
  );

  const comparisons = useMemo<Comparison[]>(() => {
    const rows: Comparison[] = [];

    const congestionDelta = Math.round(fastestRoute.avg_congestion - bestRoute.avg_congestion);
    rows.push({
      key: 'congestion',
      label: 'Traffic Delay Risk',
      icon:
        congestionDelta > 0 ? (
          <TrendingDown size={14} color={colors.primary} />
        ) : congestionDelta < 0 ? (
          <TrendingUp size={14} color={colors.fastest} />
        ) : (
          <Minus size={14} color={colors.text.secondary} />
        ),
      delta: congestionDelta,
      text:
        congestionDelta === 0
          ? 'Identical'
          : `${Math.abs(congestionDelta)}% ${congestionDelta > 0 ? 'Less Traffic' : 'More Traffic'}`
    });

    const bestRel = bestRoute.reliability ? normalizeReliability(bestRoute.reliability.reliability_score) : null;
    const fastestRel = fastestRoute.reliability
      ? normalizeReliability(fastestRoute.reliability.reliability_score)
      : null;

    if (bestRel !== null && fastestRel !== null) {
      const relDelta = bestRel - fastestRel;
      rows.push({
        key: 'reliability',
        label: 'Arrival Predictability',
        icon:
          relDelta > 0 ? (
            <ArrowUp size={14} color={colors.primary} />
          ) : relDelta < 0 ? (
            <ArrowDown size={14} color={colors.fastest} />
          ) : (
            <Minus size={14} color={colors.text.secondary} />
          ),
        delta: relDelta,
        text: relDelta === 0 ? 'Same' : `${Math.abs(relDelta)}% ${relDelta > 0 ? 'More Reliable' : 'Less Reliable'}`
      });
    }

    const tollDelta = (fastestRoute.toll_cost || 0) - (bestRoute.toll_cost || 0);
    rows.push({
      key: 'toll',
      label: 'Toll Savings',
      icon: <Coins size={14} color={tollDelta > 0 ? colors.primary : colors.text.secondary} />,
      delta: tollDelta,
      text: tollDelta === 0 ? 'Same Tolls' : tollDelta > 0 ? `Save ₹${tollDelta}` : `Extra ₹${Math.abs(tollDelta)}`
    });

    return rows;
  }, [bestRoute, fastestRoute]);

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconCircle}>
            <Scale size={14} color={colors.fastest} />
          </View>
          <View style={styles.headerTitleCol}>
            <Text style={styles.title} numberOfLines={1}>Route Trade-off</Text>
            <Text style={styles.subTitle} numberOfLines={1}>Smart choice vs fastest path</Text>
          </View>
        </View>
        <View style={styles.badgeWrapper}>
          <Badge variant="fastest" size="sm">
            {durationDiff > 0 ? `+${durationDiff}m trade` : 'Time Parity'}
          </Badge>
        </View>
      </View>

      {/* Side by Side Route Header */}
      <View style={styles.vsRow}>
        <View style={[styles.vsCard, styles.vsCardBest]}>
          <View style={styles.vsCardTop}>
            <ShieldCheck size={12} color={colors.primary} />
            <Text style={styles.vsCardLabel}>SMART CHOICE</Text>
          </View>
          <Text style={styles.vsCardName} numberOfLines={1}>
            {bestRoute.name}
          </Text>
          <Text style={styles.vsCardEta}>{bestRoute.predicted_eta_p50} min</Text>
        </View>

        <View style={styles.vsDivider}>
          <Text style={styles.vsText}>VS</Text>
        </View>

        <View style={[styles.vsCard, styles.vsCardFastest]}>
          <View style={styles.vsCardTop}>
            <Zap size={12} color={colors.fastest} />
            <Text style={[styles.vsCardLabel, { color: colors.fastest }]}>FASTEST</Text>
          </View>
          <Text style={styles.vsCardName} numberOfLines={1}>
            {fastestRoute.name}
          </Text>
          <Text style={styles.vsCardEta}>{fastestRoute.predicted_eta_p50} min</Text>
        </View>
      </View>

      {/* Tradeoff Rows */}
      <View style={styles.comparisonList}>
        {comparisons.map(comp => (
          <View key={comp.key} style={styles.compRow}>
            <View style={styles.compLeft}>
              {comp.icon}
              <Text style={styles.compLabel}>{comp.label}</Text>
            </View>
            <View
              style={[
                styles.compBadge,
                comp.delta > 0
                  ? styles.compBadgeGood
                  : comp.delta < 0
                  ? styles.compBadgeWarn
                  : styles.compBadgeNeutral
              ]}
            >
              <Text
                style={[
                  styles.compBadgeText,
                  comp.delta > 0
                    ? { color: colors.primary }
                    : comp.delta < 0
                    ? { color: colors.fastest }
                    : { color: colors.text.muted }
                ]}
              >
                {comp.text}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </Card>
  );
};

export const TradeoffMatrix = React.memo(TradeoffMatrixBase);

const styles = StyleSheet.create({
  container: {
    padding: spacing.cardPadding,
    marginBottom: spacing.lg,
    borderRadius: spacing.radius.xl
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    gap: spacing.sm
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
    minWidth: 0
  },
  headerTitleCol: {
    flex: 1,
    minWidth: 0
  },
  badgeWrapper: {
    flexShrink: 0
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.fastestSoft,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  title: {
    fontSize: 12,
    fontWeight: typography.weights.extrabold,
    color: colors.text.bright
  },
  subTitle: {
    fontSize: 10,
    color: colors.text.muted,
    marginTop: 1
  },
  vsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md
  },
  vsCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: spacing.radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border
  },
  vsCardBest: {
    borderColor: colors.primaryBorder,
    backgroundColor: colors.primaryFaint
  },
  vsCardFastest: {
    borderColor: colors.fastestBorder,
    backgroundColor: colors.fastestFaint
  },
  vsCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2
  },
  vsCardLabel: {
    fontSize: 9,
    fontWeight: typography.weights.extrabold,
    color: colors.primary,
    letterSpacing: 0.5
  },
  vsCardName: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: 4
  },
  vsCardEta: {
    fontSize: typography.sizes.h3,
    fontWeight: typography.weights.extrabold,
    color: colors.text.bright
  },
  vsDivider: {
    paddingHorizontal: 4
  },
  vsText: {
    fontSize: 10,
    fontWeight: typography.weights.extrabold,
    color: colors.text.dimmed
  },
  comparisonList: {
    gap: spacing.xs
  },
  compRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: spacing.radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border
  },
  compLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm
  },
  compLabel: {
    fontSize: 11,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary
  },
  compBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: spacing.radius.sm
  },
  compBadgeGood: {
    backgroundColor: colors.primarySoft
  },
  compBadgeWarn: {
    backgroundColor: colors.fastestSoft
  },
  compBadgeNeutral: {
    backgroundColor: colors.card
  },
  compBadgeText: {
    fontSize: 10,
    fontWeight: typography.weights.bold
  }
});
