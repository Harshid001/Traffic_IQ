import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ShieldCheck, CheckCircle2, AlertCircle, Clock } from 'lucide-react-native';
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

const fmt = (value: number | null | undefined, unit = ' min'): string =>
  value === null || value === undefined || Number.isNaN(value) ? '—' : `${Math.round(value)}${unit}`;

const ReliabilityScorecardBase: React.FC<ReliabilityScorecardProps> = ({ route }) => {
  const rel = route.reliability;

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
        message="The routing engine did not return confidence metrics for this route."
      />
    );
  }

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconCircle}>
            <ShieldCheck size={14} color={colors.primary} />
          </View>
          <View style={styles.headerTitleCol}>
            <Text style={styles.title} numberOfLines={1}>On-Time Confidence</Text>
            <Text style={styles.subTitle} numberOfLines={1}>Arrival bounds & buffer</Text>
          </View>
        </View>
        <View style={styles.badgeWrapper}>
          <Badge variant="primary" size="sm">
            {rel.reliability_label}
          </Badge>
        </View>
      </View>

      {/* 3-Column Best / Typical / Worst Case */}
      <View style={styles.boundGrid}>
        <View style={styles.boundCell}>
          <Text style={styles.boundLabel}>BEST CASE</Text>
          <Text style={[styles.boundEta, { color: colors.primaryBright }]}>
            {fmt(route.predicted_eta_p10)}
          </Text>
          <Text style={styles.boundSub}>Free-flow traffic</Text>
        </View>

        <View style={[styles.boundCell, styles.boundCellMiddle]}>
          <Text style={[styles.boundLabel, { color: colors.primaryBright }]}>EXPECTED</Text>
          <Text style={[styles.boundEta, { color: colors.text.bright, fontSize: 18 }]}>
            {fmt(route.predicted_eta_p50)}
          </Text>
          <Text style={styles.boundSub}>Most likely ETA</Text>
        </View>

        <View style={styles.boundCell}>
          <Text style={styles.boundLabel}>WORST CASE</Text>
          <Text style={[styles.boundEta, { color: colors.fastestBright }]}>
            {fmt(route.predicted_eta_p90)}
          </Text>
          <Text style={styles.boundSub}>Heavy rush hour</Text>
        </View>
      </View>

      {/* Driver Buffer Recommendation */}
      <View style={styles.bufferBanner}>
        <Clock size={14} color={colors.primary} />
        <Text style={styles.bufferText}>
          Recommended Buffer:{' '}
          <Text style={styles.bufferHighlight}>
            {uncertaintySpread !== null ? `+${Math.ceil(uncertaintySpread)} mins` : '+5 mins'}
          </Text>{' '}
          for a 95% guaranteed on-time arrival.
        </Text>
      </View>
    </Card>
  );
};

export const ReliabilityScorecard = React.memo(ReliabilityScorecardBase);

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
    backgroundColor: colors.primarySoft,
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
  boundGrid: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: spacing.radius.lg,
    padding: spacing.sm,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border
  },
  boundCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.xs
  },
  boundCellMiddle: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: colors.border
  },
  boundLabel: {
    fontSize: 9,
    fontWeight: typography.weights.extrabold,
    color: colors.text.muted,
    letterSpacing: 0.5,
    marginBottom: 2
  },
  boundEta: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.extrabold,
    marginBottom: 2
  },
  boundSub: {
    fontSize: 9,
    color: colors.text.secondary
  },
  bufferBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.card,
    borderRadius: spacing.radius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border
  },
  bufferText: {
    fontSize: 11,
    color: colors.text.body,
    flex: 1
  },
  bufferHighlight: {
    fontWeight: typography.weights.bold,
    color: colors.primaryBright
  }
});
