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
  IndianRupee
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
  /** Signed delta where positive always means "best route is better". */
  delta: number;
  text: string;
}

const TradeoffMatrixBase: React.FC<TradeoffMatrixProps> = ({ fastestRoute, bestRoute }) => {
  const durationDiff = useMemo(
    () => Math.round((bestRoute.predicted_eta_p50 - fastestRoute.predicted_eta_p50) * 10) / 10,
    [bestRoute.predicted_eta_p50, fastestRoute.predicted_eta_p50]
  );

  /**
   * Every row below reports the true measured delta. The previous version wrapped
   * these in `Math.max(12, …)` / `Math.max(10, …)`, so a 1-point difference —
   * or a difference in the wrong direction — was displayed as "12% Lower".
   *
   * Reliability is normalized on both sides before subtracting, since one route
   * can arrive as a fraction and the other as a percentage.
   */
  const comparisons = useMemo<Comparison[]>(() => {
    const rows: Comparison[] = [];

    const congestionDelta = Math.round(fastestRoute.avg_congestion - bestRoute.avg_congestion);
    rows.push({
      key: 'congestion',
      label: 'Congestion',
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
          ? 'Same'
          : `${Math.abs(congestionDelta)}% ${congestionDelta > 0 ? 'lower' : 'higher'}`
    });

    const bestRel = bestRoute.reliability ? normalizeReliability(bestRoute.reliability.reliability_score) : null;
    const fastestRel = fastestRoute.reliability
      ? normalizeReliability(fastestRoute.reliability.reliability_score)
      : null;

    if (bestRel !== null && fastestRel !== null) {
      const relDelta = bestRel - fastestRel;
      rows.push({
        key: 'reliability',
        label: 'Historical reliability',
        icon:
          relDelta > 0 ? (
            <ArrowUp size={14} color={colors.primary} />
          ) : relDelta < 0 ? (
            <ArrowDown size={14} color={colors.fastest} />
          ) : (
            <Minus size={14} color={colors.text.secondary} />
          ),
        delta: relDelta,
        text: relDelta === 0 ? 'Same' : `${Math.abs(relDelta)}% ${relDelta > 0 ? 'higher' : 'lower'}`
      });
    }

    const bestBuffer = bestRoute.reliability?.buffer_index;
    const fastestBuffer = fastestRoute.reliability?.buffer_index;
    if (bestBuffer !== undefined && bestBuffer !== null && fastestBuffer !== undefined && fastestBuffer !== null) {
      const bufferDelta = Math.round((fastestBuffer - bestBuffer) * 100);
      rows.push({
        key: 'buffer',
        label: 'Delay risk (buffer index)',
        icon:
          bufferDelta > 0 ? (
            <ArrowDown size={14} color={colors.primary} />
          ) : bufferDelta < 0 ? (
            <ArrowUp size={14} color={colors.fastest} />
          ) : (
            <Minus size={14} color={colors.text.secondary} />
          ),
        delta: bufferDelta,
        text:
          bufferDelta === 0
            ? 'Same'
            : `${Math.abs(bufferDelta)}pp ${bufferDelta > 0 ? 'lower' : 'higher'}`
      });
    }

    const tollDelta = Math.round(fastestRoute.toll_cost - bestRoute.toll_cost);
    // Only show the toll row when the costs actually differ — the old code
    // rendered "(Save ₹0)" whenever they matched.
    if (tollDelta !== 0) {
      rows.push({
        key: 'toll',
        label: 'Toll cost',
        icon: <IndianRupee size={14} color={tollDelta > 0 ? colors.primary : colors.fastest} />,
        delta: tollDelta,
        text: `₹${Math.abs(tollDelta)} ${tollDelta > 0 ? 'cheaper' : 'more expensive'}`
      });
    }

    return rows;
  }, [fastestRoute, bestRoute]);

  const advantages = comparisons.filter(c => c.delta > 0);
  const tradeoffs = comparisons.filter(c => c.delta < 0);
  const neutral = comparisons.filter(c => c.delta === 0);

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>WHY IS BEST DIFFERENT?</Text>
        <Badge variant="primary" size="sm">
          Trade-Off
        </Badge>
      </View>

      {/* Side-by-Side Comparison Box */}
      <View style={styles.sideBySideRow}>
        <Card variant="nested" style={[styles.routeBox, styles.fastestBox]}>
          <View style={styles.boxTagRow}>
            <Zap size={11} color={colors.fastest} />
            <Text style={styles.fastestTagText}>Fastest</Text>
          </View>
          <Text style={styles.boxEta}>
            {fastestRoute.predicted_eta_p50} <Text style={styles.boxEtaUnit}>min</Text>
          </Text>
          <Text style={styles.boxSub}>{fastestRoute.distance_km} km</Text>
        </Card>

        <Card variant="nested" style={[styles.routeBox, styles.bestBox]}>
          <View style={styles.boxTagRow}>
            <ShieldCheck size={11} color={colors.primary} />
            <Text style={styles.bestTagText}>Best</Text>
          </View>
          <Text style={styles.boxEta}>
            {bestRoute.predicted_eta_p50} <Text style={styles.boxEtaUnit}>min</Text>
          </Text>
          <Text style={styles.boxSub}>{bestRoute.distance_km} km</Text>
        </Card>
      </View>

      {/* Difference Pill */}
      <View style={styles.diffPill}>
        <View style={styles.diffLabelRow}>
          <Clock size={12} color={colors.text.secondary} />
          <Text style={styles.diffLabel}>Nominal ETA difference</Text>
        </View>
        <Text
          style={[
            styles.diffVal,
            durationDiff > 0 && styles.diffValWorse,
            durationDiff < 0 && styles.diffValBetter
          ]}
        >
          {durationDiff === 0
            ? 'None'
            : `${durationDiff > 0 ? '+' : ''}${durationDiff} min`}
        </Text>
      </View>

      {advantages.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ADVANTAGES OF BEST ROUTE</Text>
          {advantages.map(row => (
            <View key={row.key} style={[styles.row, styles.rowAdvantage]}>
              <View style={styles.rowLeft}>
                {row.icon}
                <Text style={styles.rowText}>{row.label}</Text>
              </View>
              <Text style={styles.rowValAdvantage}>{row.text}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Trade-offs are now shown rather than silently suppressed. */}
      {tradeoffs.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TRADE-OFFS ACCEPTED</Text>
          {tradeoffs.map(row => (
            <View key={row.key} style={[styles.row, styles.rowTradeoff]}>
              <View style={styles.rowLeft}>
                {row.icon}
                <Text style={styles.rowText}>{row.label}</Text>
              </View>
              <Text style={styles.rowValTradeoff}>{row.text}</Text>
            </View>
          ))}
        </View>
      )}

      {neutral.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>NO DIFFERENCE</Text>
          {neutral.map(row => (
            <View key={row.key} style={[styles.row, styles.rowNeutral]}>
              <View style={styles.rowLeft}>
                {row.icon}
                <Text style={styles.rowText}>{row.label}</Text>
              </View>
              <Text style={styles.rowValNeutral}>{row.text}</Text>
            </View>
          ))}
        </View>
      )}

      {comparisons.length === 0 && (
        <Text style={styles.noComparison}>
          The routing engine did not return comparable metrics for these two routes.
        </Text>
      )}
    </Card>
  );
};

export const TradeoffMatrix = React.memo(TradeoffMatrixBase);

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg
  },
  title: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    fontWeight: typography.weights.extrabold,
    color: colors.text.body,
    letterSpacing: typography.tracking.normal
  },
  sideBySideRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg
  },
  routeBox: {
    flex: 1
  },
  fastestBox: {
    borderColor: colors.fastestBorder
  },
  bestBox: {
    borderColor: colors.primaryBorder
  },
  boxTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 2
  },
  fastestTagText: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    fontWeight: typography.weights.extrabold,
    color: colors.fastest,
    textTransform: 'uppercase'
  },
  bestTagText: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    fontWeight: typography.weights.extrabold,
    color: colors.primary,
    textTransform: 'uppercase'
  },
  boxEta: {
    fontSize: typography.sizes.h2,
    lineHeight: typography.line.h2,
    fontWeight: typography.weights.extrabold,
    color: colors.text.bright
  },
  boxEtaUnit: {
    fontSize: typography.sizes.micro,
    fontWeight: typography.weights.regular,
    color: colors.text.secondary
  },
  boxSub: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    color: colors.text.secondary,
    marginTop: 1
  },
  diffPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.radius.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.md
  },
  diffLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1
  },
  diffLabel: {
    fontSize: typography.sizes.caption,
    lineHeight: typography.line.caption,
    color: colors.text.secondary
  },
  diffVal: {
    fontSize: typography.sizes.caption,
    lineHeight: typography.line.caption,
    fontWeight: typography.weights.extrabold,
    color: colors.text.primary
  },
  diffValWorse: {
    color: colors.fastest
  },
  diffValBetter: {
    color: colors.primary
  },
  section: {
    gap: spacing.sm,
    marginBottom: spacing.lg
  },
  sectionTitle: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    fontWeight: typography.weights.extrabold,
    color: colors.text.muted,
    letterSpacing: typography.tracking.normal,
    marginBottom: 2
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: spacing.radius.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md
  },
  rowAdvantage: {
    backgroundColor: colors.primaryFaint,
    borderColor: colors.primaryBorderSoft
  },
  rowTradeoff: {
    backgroundColor: colors.fastestFaint,
    borderColor: colors.fastestBorder
  },
  rowNeutral: {
    backgroundColor: colors.card,
    borderColor: colors.border
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1
  },
  rowText: {
    fontSize: typography.sizes.caption,
    lineHeight: typography.line.caption,
    color: colors.text.body,
    flex: 1
  },
  rowValAdvantage: {
    fontSize: typography.sizes.caption,
    lineHeight: typography.line.caption,
    fontWeight: typography.weights.extrabold,
    color: colors.primary
  },
  rowValTradeoff: {
    fontSize: typography.sizes.caption,
    lineHeight: typography.line.caption,
    fontWeight: typography.weights.extrabold,
    color: colors.fastest
  },
  rowValNeutral: {
    fontSize: typography.sizes.caption,
    lineHeight: typography.line.caption,
    fontWeight: typography.weights.bold,
    color: colors.text.secondary
  },
  noComparison: {
    fontSize: typography.sizes.caption,
    lineHeight: typography.line.caption,
    color: colors.text.secondary,
    fontStyle: 'italic'
  }
});
