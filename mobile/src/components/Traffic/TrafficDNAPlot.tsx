import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Dna, ShieldCheck, Clock } from 'lucide-react-native';
import { RouteData } from '../../services/routingService';
import { useTrafficStore } from '../../store/trafficStore';
import { normalizeReliability } from '../../utils/format';
import { ErrorState } from '../Common/ErrorState';
import { EmptyState } from '../Common/EmptyState';
import { LoadingState } from '../Common/LoadingState';
import { Card } from '../Common/Card';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface TrafficDNAPlotProps {
  route: RouteData;
}

/** Hours rendered on the x-axis. The API returns all 24; this is the sampled view. */
const DISPLAY_HOURS = [0, 4, 8, 12, 16, 20];

const TrafficDNAPlotBase: React.FC<TrafficDNAPlotProps> = ({ route }) => {
  const dnaData = useTrafficStore(s => s.dnaData);
  const isLoadingDNA = useTrafficStore(s => s.isLoadingDNA);
  const dnaError = useTrafficStore(s => s.dnaError);
  const loadTrafficDNA = useTrafficStore(s => s.loadTrafficDNA);

  // The DNA profile is keyed per segment; use the route's first segment.
  const segmentId = route.segments?.[0]?.id ?? null;
  const segmentName = route.segments?.[0]?.name;
  const hours = segmentId ? dnaData[segmentId] : undefined;

  useEffect(() => {
    if (segmentId && !dnaData[segmentId] && !isLoadingDNA && !dnaError) {
      loadTrafficDNA(segmentId);
    }
  }, [segmentId, dnaData, isLoadingDNA, dnaError, loadTrafficDNA]);

  const currentHour = new Date().getHours();

  /**
   * Reduce the 24-hour series to the sampled x-axis. Values come straight from
   * the API; the previous hardcoded histogram is gone.
   */
  const bars = useMemo(() => {
    if (!hours || hours.length === 0) return [];
    return DISPLAY_HOURS.map((h) => {
      const match = hours.find(entry => entry.hour === h);
      return {
        hour: String(h).padStart(2, '0'),
        value: match ? Math.round(match.mean_congestion) : null,
        isCurrent: currentHour >= h && currentHour < h + 4
      };
    });
  }, [hours, currentHour]);

  const reliabilityPct = normalizeReliability(route.reliability?.reliability_score);
  const bufferIndex = route.reliability?.buffer_index;

  /**
   * Typical delay is derived from the buffer index against the median ETA,
   * not a literal. `buffer_index` is a fraction of trip duration.
   */
  const typicalDelayMin =
    bufferIndex !== undefined && bufferIndex !== null && route.predicted_eta_p50
      ? Math.round(bufferIndex * route.predicted_eta_p50 * 10) / 10
      : null;

  const renderChart = () => {
    if (!segmentId) {
      return (
        <EmptyState
          title="No segment data"
          message="This route has no segments to profile."
        />
      );
    }
    if (dnaError) {
      return (
        <ErrorState
          title="Traffic DNA unavailable"
          message={dnaError}
          onRetry={() => loadTrafficDNA(segmentId)}
        />
      );
    }
    if (isLoadingDNA && bars.length === 0) {
      return <LoadingState size="small" message="Loading 24-hour profile..." />;
    }
    if (bars.length === 0) {
      return (
        <EmptyState
          title="No historical profile"
          message="The server returned no hourly data for this segment."
          actionLabel="Reload"
          onAction={() => loadTrafficDNA(segmentId)}
        />
      );
    }

    return (
      <>
        <View style={styles.histogramContainer}>
          {bars.map((item) => {
            const isPeak = item.value !== null && item.value >= 70;
            return (
              <View key={item.hour} style={styles.barCol}>
                {item.value === null ? (
                  <View style={styles.barMissing} />
                ) : (
                  <View
                    style={[
                      styles.bar,
                      // Clamp to a 2% floor so a genuine 0 stays visible as a
                      // sliver instead of being inflated to a fake minimum.
                      { height: `${Math.max(2, item.value)}%` },
                      isPeak && !item.isCurrent && styles.barPeak,
                      item.isCurrent && styles.barCurrent
                    ]}
                  />
                )}
                <Text style={[styles.hourLabel, item.isCurrent && styles.hourLabelCurrent]}>
                  {item.hour}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
            <Text style={styles.legendLabel}>Low</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.warning }]} />
            <Text style={styles.legendLabel}>Peak</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.fastest }]} />
            <Text style={styles.legendLabel}>Current Hour</Text>
          </View>
        </View>
      </>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Dna size={14} color={colors.primary} />
          <Text style={styles.title}>TRAFFIC DNA (24-HOUR PROFILE)</Text>
        </View>
        <Text style={styles.subText} numberOfLines={1}>
          {segmentName || 'Historical'}
        </Text>
      </View>

      {renderChart()}

      {/* Metric Cards Footer */}
      <View style={styles.metricsRow}>
        <Card variant="nested" style={styles.metricCell}>
          <View style={styles.metricLabelRow}>
            <ShieldCheck size={12} color={colors.primary} />
            <Text style={styles.metricLabel}>HISTORICAL RELIABILITY</Text>
          </View>
          <Text style={styles.metricValue}>
            {route.reliability ? `${reliabilityPct}%` : '—'}
          </Text>
          <Text style={styles.metricSub}>
            {route.reliability?.reliability_label ?? 'Not reported'}
          </Text>
        </Card>

        <Card variant="nested" style={styles.metricCell}>
          <View style={styles.metricLabelRow}>
            <Clock size={12} color={colors.fastest} />
            <Text style={styles.metricLabel}>TYPICAL DELAY</Text>
          </View>
          <Text style={[styles.metricValue, { color: colors.fastest }]}>
            {typicalDelayMin !== null ? `+${typicalDelayMin} min` : '—'}
          </Text>
          <Text style={styles.metricSub}>
            {bufferIndex !== undefined && bufferIndex !== null
              ? `Buffer index ${Math.round(bufferIndex * 100)}%`
              : 'Not reported'}
          </Text>
        </Card>
      </View>
    </View>
  );
};

export const TrafficDNAPlot = React.memo(TrafficDNAPlotBase);

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: spacing.radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.cardPadding,
    marginBottom: spacing.lg
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
    gap: spacing.md
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
  subText: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    color: colors.text.muted,
    flexShrink: 1
  },
  histogramContainer: {
    height: 100,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.lg
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%'
  },
  bar: {
    width: 14,
    borderRadius: spacing.xs,
    backgroundColor: colors.primary,
    opacity: 0.65
  },
  barMissing: {
    width: 14,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.border
  },
  barPeak: {
    backgroundColor: colors.warning,
    opacity: 0.85
  },
  barCurrent: {
    backgroundColor: colors.fastest,
    opacity: 1
  },
  hourLabel: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    fontWeight: typography.weights.bold,
    color: colors.text.muted,
    marginTop: spacing.xs
  },
  hourLabelCurrent: {
    color: colors.fastest
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xl,
    marginBottom: spacing.lg,
    paddingHorizontal: 2
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  legendLabel: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    color: colors.text.secondary,
    fontWeight: typography.weights.semibold
  },
  metricsRow: {
    flexDirection: 'row',
    gap: spacing.md
  },
  metricCell: {
    flex: 1
  },
  metricLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs
  },
  metricLabel: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    fontWeight: typography.weights.extrabold,
    color: colors.text.muted,
    flex: 1
  },
  metricValue: {
    fontSize: typography.sizes.h2,
    lineHeight: typography.line.h2,
    fontWeight: typography.weights.extrabold,
    color: colors.text.bright,
    marginTop: 2
  },
  metricSub: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    color: colors.primary,
    marginTop: 1
  }
});
