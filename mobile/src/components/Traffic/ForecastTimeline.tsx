import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Activity, ArrowUpRight, ArrowDownRight, ArrowRight } from 'lucide-react-native';
import { RouteData } from '../../services/routingService';
import { EmptyState } from '../Common/EmptyState';
import { Card } from '../Common/Card';
import { Badge } from '../Common/Badge';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface ForecastTimelineProps {
  route: RouteData;
}

const congestionColor = (val: number): string => {
  if (val < 31) return colors.congestion.freeflow;
  if (val < 61) return colors.congestion.moderate;
  if (val < 81) return colors.congestion.heavy;
  return colors.congestion.severe;
};

const ForecastTimelineBase: React.FC<ForecastTimelineProps> = ({ route }) => {
  const hasCurrent = route.avg_congestion !== undefined && route.avg_congestion !== null;
  const currentCong = hasCurrent ? Math.round(route.avg_congestion) : null;

  /**
   * Only the +20m horizon is a real model output (`forecast_20m_p50`).
   * The +10m and +30m columns were previously invented from the trend string;
   * they are now shown as "not modelled" rather than presented as forecasts.
   */
  const fc20 =
    route.forecast_20m_p50 !== undefined && route.forecast_20m_p50 !== null
      ? Math.round(route.forecast_20m_p50)
      : null;

  /** Confidence is derived from the model's own uncertainty spread. */
  const confidencePct = useMemo(() => {
    const spread = route.forecast_uncertainty_spread;
    if (spread === undefined || spread === null || !route.predicted_eta_p50) return null;
    // Wider spread relative to the median ETA => lower confidence.
    const relative = spread / route.predicted_eta_p50;
    return Math.round(Math.min(99, Math.max(1, (1 - relative) * 100)));
  }, [route.forecast_uncertainty_spread, route.predicted_eta_p50]);

  const trendIcon = useMemo(() => {
    if (fc20 === null || currentCong === null) return <ArrowRight size={12} color={colors.text.secondary} />;
    if (fc20 > currentCong) return <ArrowUpRight size={12} color={colors.fastest} />;
    if (fc20 < currentCong) return <ArrowDownRight size={12} color={colors.primary} />;
    return <ArrowRight size={12} color={colors.text.secondary} />;
  }, [fc20, currentCong]);

  if (currentCong === null) {
    return (
      <EmptyState
        title="No traffic state reported"
        message="The routing engine did not return congestion data for this route."
      />
    );
  }

  const statusColor = congestionColor(currentCong);

  return (
    <View style={styles.container}>
      {/* Current Traffic Status Header Card */}
      <Card style={styles.currentCard}>
        <View style={styles.currentLeft}>
          <Text style={styles.sectionLabel}>CURRENT TRAFFIC STATE</Text>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {route.congestion_category || 'Unknown'}
            </Text>
          </View>
          {route.trend_description ? (
            <Text style={styles.statusSub}>{route.trend_description}</Text>
          ) : null}
        </View>

        <View style={styles.currentRight}>
          <Text style={[styles.congNumber, { color: statusColor }]}>{currentCong}%</Text>
          <Text style={styles.congLabel}>CONGESTION</Text>
        </View>
      </Card>

      {/* Chronos-2 Horizon Cards */}
      <Card>
        <View style={styles.forecastHeader}>
          <View style={styles.forecastTitleRow}>
            <Activity size={14} color={colors.fastest} />
            <Text style={styles.forecastTitle}>CHRONOS-2 PROBABILISTIC FORECAST</Text>
          </View>
          <Badge variant="neutral" size="sm" shape="pill">
            amazon/chronos-2
          </Badge>
        </View>

        <View style={styles.horizonRow}>
          <Card variant="nested" style={styles.horizonBlock}>
            <Text style={styles.horizonTime}>NOW</Text>
            <Text style={styles.horizonVal}>{currentCong}%</Text>
            <Text style={styles.horizonLabel}>Observed</Text>
          </Card>

          <Card variant="nested" style={[styles.horizonBlock, styles.horizonBlockKey]}>
            <Text style={[styles.horizonTime, { color: colors.fastest }]}>+20m</Text>
            <View style={styles.horizonValRow}>
              <Text style={[styles.horizonVal, { color: colors.fastest }]}>
                {fc20 === null ? '—' : `${fc20}%`}
              </Text>
              {trendIcon}
            </View>
            <Text style={[styles.horizonLabel, { color: colors.fastest }]}>P50 Forecast</Text>
          </Card>

          <Card variant="nested" style={styles.horizonBlock}>
            <Text style={styles.horizonTime}>TREND</Text>
            <Text style={styles.horizonVal}>
              {route.trend_delta_pct !== undefined && route.trend_delta_pct !== null
                ? `${route.trend_delta_pct > 0 ? '+' : ''}${Math.round(route.trend_delta_pct)}%`
                : '—'}
            </Text>
            <Text style={styles.horizonLabel} numberOfLines={1}>
              {route.trend ? route.trend.toLowerCase() : 'not reported'}
            </Text>
          </Card>
        </View>

        {/* Model Precision Progress Bar — derived, not a literal. */}
        <View style={styles.confidenceRow}>
          <View style={styles.confidenceLabelRow}>
            <Text style={styles.confidenceText}>Model Confidence</Text>
            <Text style={styles.confidenceVal}>
              {confidencePct === null ? 'Not reported' : `${confidencePct}%`}
            </Text>
          </View>
          <View style={styles.confidenceTrack}>
            <View style={[styles.confidenceFill, { width: `${confidencePct ?? 0}%` }]} />
          </View>
        </View>
      </Card>
    </View>
  );
};

export const ForecastTimeline = React.memo(ForecastTimelineBase);

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
    marginBottom: spacing.lg
  },
  currentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.lg
  },
  currentLeft: {
    flex: 1
  },
  sectionLabel: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    fontWeight: typography.weights.extrabold,
    color: colors.text.muted,
    letterSpacing: typography.tracking.normal
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: 2
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  statusText: {
    fontSize: typography.sizes.h3,
    lineHeight: typography.line.h3,
    fontWeight: typography.weights.extrabold,
    textTransform: 'capitalize'
  },
  statusSub: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    color: colors.text.secondary,
    marginTop: 2
  },
  currentRight: {
    alignItems: 'flex-end'
  },
  congNumber: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: typography.weights.extrabold
  },
  congLabel: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    fontWeight: typography.weights.extrabold,
    color: colors.text.muted
  },
  forecastHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    gap: spacing.md
  },
  forecastTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1
  },
  forecastTitle: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    fontWeight: typography.weights.extrabold,
    color: colors.text.strong,
    letterSpacing: typography.tracking.normal
  },
  horizonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg
  },
  horizonBlock: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md
  },
  horizonBlockKey: {
    borderColor: colors.fastestBorder,
    backgroundColor: colors.fastestFaint
  },
  horizonTime: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    fontWeight: typography.weights.extrabold,
    color: colors.text.secondary
  },
  horizonValRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 2
  },
  horizonVal: {
    fontSize: typography.sizes.body,
    lineHeight: typography.line.body,
    fontWeight: typography.weights.extrabold,
    color: colors.text.bright,
    marginTop: 2
  },
  horizonLabel: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    color: colors.text.muted,
    marginTop: 2,
    textTransform: 'capitalize'
  },
  confidenceRow: {
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  confidenceLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs
  },
  confidenceText: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    color: colors.text.secondary
  },
  confidenceVal: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    fontWeight: typography.weights.extrabold,
    color: colors.primary
  },
  confidenceTrack: {
    height: 4,
    backgroundColor: colors.neutral,
    borderRadius: 2,
    overflow: 'hidden'
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2
  }
});
