import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Activity, ShieldCheck, Clock, Calendar, Sparkles } from 'lucide-react-native';
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

const DISPLAY_HOURS = [0, 4, 8, 12, 16, 20];

const TrafficDNAPlotBase: React.FC<TrafficDNAPlotProps> = ({ route }) => {
  const dnaData = useTrafficStore(s => s.dnaData);
  const isLoadingDNA = useTrafficStore(s => s.isLoadingDNA);
  const dnaError = useTrafficStore(s => s.dnaError);
  const loadTrafficDNA = useTrafficStore(s => s.loadTrafficDNA);

  const [selectedHour, setSelectedHour] = useState<number | null>(null);

  const segmentId = route.segments?.[0]?.id ?? null;
  const segmentName = route.segments?.[0]?.name;
  const hours = segmentId ? dnaData[segmentId] : undefined;

  useEffect(() => {
    if (segmentId && !dnaData[segmentId] && !isLoadingDNA && !dnaError) {
      loadTrafficDNA(segmentId);
    }
  }, [segmentId, dnaData, isLoadingDNA, dnaError, loadTrafficDNA]);

  const currentHour = new Date().getHours();

  const bars = useMemo(() => {
    if (!hours || hours.length === 0) return [];
    return DISPLAY_HOURS.map((h) => {
      const match = hours.find(entry => entry.hour === h);
      return {
        rawHour: h,
        hour: `${h}:00`,
        value: match ? Math.round(match.mean_congestion) : null,
        isCurrent: currentHour >= h && currentHour < h + 4
      };
    });
  }, [hours, currentHour]);

  const reliabilityPct = normalizeReliability(route.reliability?.reliability_score);

  const renderChart = () => {
    if (!segmentId) {
      return (
        <EmptyState
          title="No segment data"
          message="This route has no road segments to profile."
        />
      );
    }
    if (dnaError) {
      return (
        <ErrorState
          title="Traffic profile unavailable"
          message={dnaError}
          onRetry={() => loadTrafficDNA(segmentId)}
        />
      );
    }
    if (isLoadingDNA && bars.length === 0) {
      return <LoadingState size="small" message="Analyzing 24-hour congestion trends..." />;
    }
    if (bars.length === 0) {
      return (
        <EmptyState
          title="No historical trend"
          message="The server returned no hourly data for this corridor."
          actionLabel="Retry"
          onAction={() => loadTrafficDNA(segmentId)}
        />
      );
    }

    return (
      <View style={styles.chartContainer}>
        {/* Peak Hours Insight Banner */}
        <View style={styles.peakBanner}>
          <Sparkles size={12} color={colors.primary} />
          <Text style={styles.peakText}>
            Best travel windows are <Text style={styles.peakHighlight}>Early Morning (before 8 AM)</Text> and <Text style={styles.peakHighlight}>Late Evening (after 8 PM)</Text>.
          </Text>
        </View>

        {/* 24-Hour Bar Chart */}
        <View style={styles.barGrid}>
          {bars.map((bar) => {
            const isSelected = selectedHour === bar.rawHour || (selectedHour === null && bar.isCurrent);
            const val = bar.value ?? 25;
            const barHeight = Math.max(16, Math.min(100, val));
            const barColor =
              val > 60
                ? colors.danger
                : val > 35
                ? colors.fastest
                : colors.primary;

            return (
              <TouchableOpacity
                key={bar.hour}
                activeOpacity={0.8}
                onPress={() => setSelectedHour(bar.rawHour)}
                style={styles.barCol}
              >
                <Text style={[styles.barVal, isSelected && { color: colors.text.bright, fontWeight: '800' }]}>
                  {val}%
                </Text>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      { height: `${barHeight}%`, backgroundColor: barColor },
                      isSelected && styles.barFillSelected
                    ]}
                  />
                </View>
                <Text style={[styles.barLabel, (bar.isCurrent || isSelected) && styles.barLabelActive]}>
                  {bar.hour}
                </Text>
                {bar.isCurrent && <View style={styles.currentDot} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Summary Footer */}
        <View style={styles.summaryFooter}>
          <View style={styles.summaryItem}>
            <Clock size={12} color={colors.text.secondary} />
            <Text style={styles.summaryLabel}>Peak Rush Hour: <Text style={styles.summaryVal}>5:00 PM - 7:30 PM</Text></Text>
          </View>
          <View style={styles.summaryItem}>
            <ShieldCheck size={12} color={colors.primary} />
            <Text style={styles.summaryLabel}>Corridor Reliability: <Text style={styles.summaryVal}>{reliabilityPct}%</Text></Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconCircle}>
            <Calendar size={14} color={colors.primary} />
          </View>
          <View>
            <Text style={styles.title}>24-HOUR COMMUTE RHYTHM</Text>
            <Text style={styles.subTitle}>
              {segmentName ? `Hourly traffic patterns along ${segmentName}` : 'Hourly congestion trends'}
            </Text>
          </View>
        </View>
      </View>

      {renderChart()}
    </Card>
  );
};

export const TrafficDNAPlot = React.memo(TrafficDNAPlotBase);

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
    marginBottom: spacing.md
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontSize: 10,
    fontWeight: typography.weights.extrabold,
    color: colors.text.bright,
    letterSpacing: 0.5
  },
  subTitle: {
    fontSize: 10,
    color: colors.text.muted,
    marginTop: 1
  },
  chartContainer: {
    gap: spacing.md
  },
  peakBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    borderRadius: spacing.radius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border
  },
  peakText: {
    fontSize: 10,
    color: colors.text.body,
    flex: 1
  },
  peakHighlight: {
    fontWeight: typography.weights.bold,
    color: colors.primaryBright
  },
  barGrid: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 140,
    paddingTop: spacing.sm,
    paddingBottom: 4
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
    gap: 4
  },
  barVal: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.text.muted
  },
  barTrack: {
    width: 22,
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: spacing.radius.pill,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border
  },
  barFill: {
    width: '100%',
    borderRadius: spacing.radius.pill
  },
  barFillSelected: {
    borderWidth: 1.5,
    borderColor: '#FFF'
  },
  barLabel: {
    fontSize: 10,
    fontWeight: typography.weights.semibold,
    color: colors.text.muted,
    marginTop: 2
  },
  barLabelActive: {
    color: colors.primaryBright,
    fontWeight: typography.weights.extrabold
  },
  currentDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
    marginTop: 1
  },
  summaryFooter: {
    gap: 4,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs
  },
  summaryLabel: {
    fontSize: 11,
    color: colors.text.secondary
  },
  summaryVal: {
    fontWeight: typography.weights.bold,
    color: colors.text.bright
  }
});
