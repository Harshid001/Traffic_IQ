import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Activity, ArrowUpRight, ArrowDownRight, ArrowRight, Clock, Sparkles } from 'lucide-react-native';
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
  const [selectedOffset, setSelectedOffset] = useState<number>(0);

  const hasCurrent = route.avg_congestion !== undefined && route.avg_congestion !== null;
  const currentCong = hasCurrent ? Math.round(route.avg_congestion) : null;

  const fc20 =
    route.forecast_20m_p50 !== undefined && route.forecast_20m_p50 !== null
      ? Math.round(route.forecast_20m_p50)
      : null;

  const baseEta = route.predicted_eta_p50 || 28;

  // Generate interactive departure windows
  const departureWindows = useMemo(() => {
    const congNow = currentCong ?? 35;
    const cong20 = fc20 ?? (route.trend === 'improving' ? congNow - 8 : congNow + 6);
    return [
      { offset: 0, label: 'Leave Now', cong: congNow, eta: baseEta },
      {
        offset: 15,
        label: '+15 min',
        cong: Math.round((congNow + cong20) / 2),
        eta: Math.round(baseEta + (cong20 > congNow ? 2 : -3))
      },
      { offset: 30, label: '+30 min', cong: cong20, eta: Math.round(baseEta + (cong20 > congNow ? 5 : -6)) },
      {
        offset: 60,
        label: '+1 hour',
        cong: Math.max(15, Math.round(cong20 * 0.85)),
        eta: Math.max(18, Math.round(baseEta - 4))
      }
    ];
  }, [currentCong, fc20, baseEta, route.trend]);

  const activeWindow = departureWindows.find(w => w.offset === selectedOffset) || departureWindows[0];

  if (currentCong === null) {
    return (
      <EmptyState
        title="No traffic state reported"
        message="The routing engine did not return congestion data for this route."
      />
    );
  }

  const statusColor = congestionColor(activeWindow.cong);

  return (
    <View style={styles.container}>
      {/* Current & Departure Outlook Card */}
      <Card style={styles.currentCard}>
        <View style={styles.currentLeft}>
          <Text style={styles.sectionLabel}>TRAFFIC OUTLOOK</Text>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {activeWindow.cong < 31
                ? 'Smooth Free-Flow'
                : activeWindow.cong < 61
                ? 'Moderate Delays'
                : 'Heavy Congestion'}
            </Text>
          </View>
          <Text style={styles.statusSub}>
            {selectedOffset === 0
              ? `Current corridor state with ${currentCong}% congestion.`
              : `Projected ETA if departing in ${activeWindow.label}: ~${activeWindow.eta} mins.`}
          </Text>
        </View>

        <View style={styles.currentRight}>
          <Text style={[styles.congNumber, { color: statusColor }]}>{activeWindow.cong}%</Text>
          <Text style={styles.congLabel}>CONGESTION</Text>
        </View>
      </Card>

      {/* Interactive Departure Time Selector */}
      <Card>
        <View style={styles.forecastHeader}>
          <View style={styles.forecastTitleRow}>
            <Clock size={14} color={colors.fastest} />
            <Text style={styles.forecastTitle}>DEPARTURE TIME PLANNER</Text>
          </View>
          <View style={styles.smartBadge}>
            <Sparkles size={11} color={colors.primary} />
            <Text style={styles.smartBadgeText}>Smart Forecast</Text>
          </View>
        </View>

        <View style={styles.windowsGrid}>
          {departureWindows.map(item => {
            const isSelected = item.offset === selectedOffset;
            const cColor = congestionColor(item.cong);
            return (
              <TouchableOpacity
                key={item.offset}
                activeOpacity={0.75}
                onPress={() => setSelectedOffset(item.offset)}
                style={[
                  styles.windowCard,
                  isSelected && styles.windowCardSelected,
                  { borderColor: isSelected ? colors.primary : colors.border }
                ]}
              >
                <Text style={[styles.windowLabel, isSelected && { color: colors.primaryBright }]}>
                  {item.label}
                </Text>
                <Text style={styles.windowEta}>{item.eta} min</Text>
                <View style={styles.windowCongRow}>
                  <View style={[styles.windowDot, { backgroundColor: cColor }]} />
                  <Text style={[styles.windowCongText, { color: cColor }]}>{item.cong}%</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </Card>
    </View>
  );
};

export const ForecastTimeline = React.memo(ForecastTimelineBase);

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
    marginBottom: spacing.lg
  },
  currentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.cardPadding,
    borderRadius: spacing.radius.xl
  },
  currentLeft: {
    flex: 1
  },
  sectionLabel: {
    fontSize: 9,
    fontWeight: typography.weights.extrabold,
    color: colors.text.muted,
    letterSpacing: 0.5,
    marginBottom: 2
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 2
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  statusText: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.extrabold
  },
  statusSub: {
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 2
  },
  currentRight: {
    alignItems: 'flex-end',
    marginLeft: spacing.md
  },
  congNumber: {
    fontSize: typography.sizes.h1,
    lineHeight: 30,
    fontWeight: typography.weights.extrabold
  },
  congLabel: {
    fontSize: 9,
    fontWeight: typography.weights.extrabold,
    color: colors.text.muted,
    letterSpacing: 0.5
  },
  forecastHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md
  },
  forecastTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs
  },
  forecastTitle: {
    fontSize: 10,
    fontWeight: typography.weights.extrabold,
    color: colors.text.bright,
    letterSpacing: 0.5
  },
  smartBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.primarySoft,
    borderRadius: spacing.radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2
  },
  smartBadgeText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.primary
  },
  windowsGrid: {
    flexDirection: 'row',
    gap: spacing.xs
  },
  windowCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: spacing.radius.lg,
    padding: spacing.sm,
    alignItems: 'center',
    borderWidth: 1
  },
  windowCardSelected: {
    backgroundColor: colors.primaryFaint
  },
  windowLabel: {
    fontSize: 10,
    fontWeight: typography.weights.extrabold,
    color: colors.text.muted,
    marginBottom: 2
  },
  windowEta: {
    fontSize: 13,
    fontWeight: typography.weights.extrabold,
    color: colors.text.bright,
    marginBottom: 4
  },
  windowCongRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3
  },
  windowDot: {
    width: 6,
    height: 6,
    borderRadius: 3
  },
  windowCongText: {
    fontSize: 10,
    fontWeight: typography.weights.bold
  }
});
