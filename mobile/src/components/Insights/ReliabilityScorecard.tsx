import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ShieldCheck } from 'lucide-react-native';
import { RouteData } from '../../services/routingService';
import { EmptyState } from '../Common/EmptyState';
import { Card } from '../Common/Card';
import { Badge } from '../Common/Badge';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface ReliabilityScorecardProps {
  route: RouteData;
}

/** Renders `—` rather than inventing a number when a field is absent. */
const fmt = (value: number | null | undefined, unit = ' min'): string =>
  value === null || value === undefined || Number.isNaN(value) ? '—' : `${value}${unit}`;

const ReliabilityScorecardBase: React.FC<ReliabilityScorecardProps> = ({ route }) => {
  const rel = route.reliability;

  /**
   * Prefer the server-computed spread. The previous code always recomputed
   * (p90 - p10) / 2 locally and ignored `forecast_uncertainty_spread`, so the
   * displayed uncertainty could disagree with the model's own figure.
   */
  const uncertaintySpread = useMemo(() => {
    if (route.forecast_uncertainty_spread !== undefined && route.forecast_uncertainty_spread !== null) {
      return Math.round(route.forecast_uncertainty_spread * 10) / 10;
    }
    if (route.predicted_eta_p90 !== undefined && route.predicted_eta_p10 !== undefined) {
      return Math.round(((route.predicted_eta_p90 - route.predicted_eta_p10) / 2) * 10) / 10;
    }
    return null;
  }, [route.forecast_uncertainty_spread, route.predicted_eta_p90, route.predicted_eta_p10]);

  if (!rel) {
    return (
      <EmptyState
        title="Reliability not reported"
        message="The routing engine did not return reliability bounds for this route."
      />
    );
  }

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <ShieldCheck size={14} color={colors.primary} />
          <Text style={styles.title}>RELIABILITY & RISK BOUNDS</Text>
        </View>
        <Badge variant="primary" size="sm">
          {rel.reliability_label}
        </Badge>
      </View>

      {/* Percentiles Card */}
      <Card variant="nested" style={styles.percentilesCard}>
        <Text style={styles.cardHeader}>TRAVEL TIME DISTRIBUTION (PERCENTILES)</Text>

        <View style={styles.percentileRow}>
          <Text style={styles.percentileLabel}>P10 (Best Case Flow)</Text>
          <Text style={[styles.percentileVal, { color: colors.info }]}>
            {fmt(route.predicted_eta_p10)}
          </Text>
        </View>

        <View style={styles.percentileRow}>
          <Text style={[styles.percentileLabel, styles.percentileLabelKey]}>
            P50 (Median Expected)
          </Text>
          <Text style={[styles.percentileVal, styles.percentileValKey]}>
            {fmt(route.predicted_eta_p50)}
          </Text>
        </View>

        <View style={styles.percentileRow}>
          <Text style={styles.percentileLabel}>P90 (Worst Case Bottleneck)</Text>
          <Text style={[styles.percentileVal, { color: colors.fastest }]}>
            {fmt(route.predicted_eta_p90)}
          </Text>
        </View>

        <View style={styles.spreadRow}>
          <Text style={styles.spreadLabel}>Uncertainty Spread:</Text>
          <Text style={styles.spreadVal}>
            {uncertaintySpread === null ? '—' : `±${uncertaintySpread} min`}
          </Text>
        </View>
      </Card>

      {/* Buffer Index and P95 */}
      <View style={styles.bottomRow}>
        <Card variant="nested" style={styles.bottomCell}>
          <Text style={styles.bottomCellLabel}>BUFFER INDEX</Text>
          <Text style={[styles.bottomCellVal, { color: colors.primary }]}>
            {rel.buffer_index === undefined || rel.buffer_index === null
              ? '—'
              : `${Math.round(rel.buffer_index * 100)}%`}
          </Text>
        </Card>

        <Card variant="nested" style={styles.bottomCell}>
          <Text style={styles.bottomCellLabel}>P95 SAFETY TIME</Text>
          <Text style={styles.bottomCellVal}>{fmt(rel.p95_duration_min)}</Text>
        </Card>
      </View>
    </Card>
  );
};

export const ReliabilityScorecard = React.memo(ReliabilityScorecardBase);

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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1
  },
  title: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    fontWeight: typography.weights.extrabold,
    color: colors.text.strong,
    letterSpacing: typography.tracking.normal
  },
  percentilesCard: {
    marginBottom: spacing.lg,
    gap: spacing.sm
  },
  cardHeader: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    fontWeight: typography.weights.extrabold,
    color: colors.text.muted,
    marginBottom: 2
  },
  percentileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md
  },
  percentileLabel: {
    fontSize: typography.sizes.caption,
    lineHeight: typography.line.caption,
    color: colors.text.secondary,
    flex: 1
  },
  percentileLabelKey: {
    color: colors.text.bright,
    fontWeight: typography.weights.bold
  },
  percentileVal: {
    fontSize: typography.sizes.caption,
    lineHeight: typography.line.caption,
    fontWeight: typography.weights.extrabold
  },
  percentileValKey: {
    color: colors.primary,
    fontSize: typography.sizes.label,
    lineHeight: typography.line.label
  },
  spreadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 2
  },
  spreadLabel: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    color: colors.text.secondary
  },
  spreadVal: {
    fontSize: typography.sizes.caption,
    lineHeight: typography.line.caption,
    fontWeight: typography.weights.extrabold,
    color: colors.text.primary
  },
  bottomRow: {
    flexDirection: 'row',
    gap: spacing.md
  },
  bottomCell: {
    flex: 1
  },
  bottomCellLabel: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    fontWeight: typography.weights.extrabold,
    color: colors.text.muted
  },
  bottomCellVal: {
    fontSize: typography.sizes.label,
    lineHeight: typography.line.label,
    fontWeight: typography.weights.extrabold,
    color: colors.text.bright,
    marginTop: 2
  }
});
