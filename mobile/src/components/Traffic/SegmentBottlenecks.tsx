import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Layers, AlertTriangle, CheckCircle, Navigation } from 'lucide-react-native';
import { RouteData } from '../../services/routingService';
import { useTrafficStore } from '../../store/trafficStore';
import { EmptyState } from '../Common/EmptyState';
import { Card } from '../Common/Card';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface SegmentBottlenecksProps {
  route: RouteData;
}

const congestionTier = (cong: number): 'freeflow' | 'moderate' | 'heavy' => {
  if (cong >= 60) return 'heavy';
  if (cong >= 35) return 'moderate';
  return 'freeflow';
};

const SegmentBottlenecksBase: React.FC<SegmentBottlenecksProps> = ({ route }) => {
  const selectedSegmentId = useTrafficStore(s => s.selectedSegmentId);
  const setSelectedSegmentId = useTrafficStore(s => s.setSelectedSegmentId);

  const segments = route.segments ?? [];

  const handleSelect = useCallback(
    (id: string) => setSelectedSegmentId(id),
    [setSelectedSegmentId]
  );

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconCircle}>
            <Layers size={14} color={colors.info} />
          </View>
          <View>
            <Text style={styles.title}>LIVE ROAD SEGMENTS & BOTTLENECK MONITOR</Text>
            <Text style={styles.subTitle}>Step-by-step traffic speed and hazard detection</Text>
          </View>
        </View>
        <Text style={styles.countBadge}>
          {segments.length} {segments.length === 1 ? 'Segment' : 'Segments'}
        </Text>
      </View>

      {segments.length === 0 ? (
        <EmptyState
          title="No road segments found"
          message="The routing service has not broken this path into segments."
        />
      ) : (
        <View style={styles.segmentList}>
          {segments.map((seg, idx) => {
            const hasCong = seg.congestion !== undefined && seg.congestion !== null;
            const cong = hasCong ? Math.round(seg.congestion) : null;
            const tier = cong === null ? null : congestionTier(cong);
            const segId = seg.id || `segment-${idx}`;
            const isSelected = selectedSegmentId === segId;

            return (
              <TouchableOpacity
                key={segId}
                activeOpacity={0.75}
                onPress={() => handleSelect(segId)}
                style={[styles.segmentItem, isSelected && styles.segmentItemSelected]}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
              >
                <View style={styles.segmentIndexCol}>
                  <Text style={styles.segmentIndex}>{idx + 1}</Text>
                </View>

                <View style={styles.segmentItemLeft}>
                  <View style={styles.nameRow}>
                    <Text style={styles.segmentName} numberOfLines={1}>
                      {seg.name}
                    </Text>
                    {seg.incident_flag === 1 && (
                      <View style={styles.hazardBadge}>
                        <AlertTriangle size={10} color={colors.danger} />
                        <Text style={styles.hazardText}>Delay Incident</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.segmentSub}>
                    {seg.length_km} km • Free-flow speed: {seg.freeflow_speed} km/h
                  </Text>
                </View>

                <View
                  style={[
                    styles.congBadge,
                    tier === 'heavy'
                      ? styles.congHeavy
                      : tier === 'moderate'
                      ? styles.congModerate
                      : tier === 'freeflow'
                      ? styles.congFreeflow
                      : styles.congUnknown
                  ]}
                >
                  <Text
                    style={[
                      styles.congBadgeText,
                      tier === 'heavy'
                        ? styles.congHeavyText
                        : tier === 'moderate'
                        ? styles.congModerateText
                        : tier === 'freeflow'
                        ? styles.congFreeflowText
                        : styles.congUnknownText
                    ]}
                  >
                    {cong !== null ? `${cong}% Delay` : 'Normal'}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </Card>
  );
};

export const SegmentBottlenecks = React.memo(SegmentBottlenecksBase);

const styles = StyleSheet.create({
  container: {
    padding: spacing.cardPadding,
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
    backgroundColor: colors.infoSoft,
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
  countBadge: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.text.muted
  },
  segmentList: {
    gap: spacing.xs
  },
  segmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: spacing.radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm
  },
  segmentItemSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryFaint
  },
  segmentIndexCol: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border
  },
  segmentIndex: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.text.muted
  },
  segmentItemLeft: {
    flex: 1
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 2
  },
  segmentName: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    flex: 1
  },
  hazardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.dangerSoft,
    borderRadius: spacing.radius.sm,
    paddingHorizontal: 5,
    paddingVertical: 1
  },
  hazardText: {
    fontSize: 9,
    fontWeight: typography.weights.bold,
    color: colors.dangerBright
  },
  segmentSub: {
    fontSize: 11,
    color: colors.text.secondary
  },
  congBadge: {
    borderRadius: spacing.radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4
  },
  congHeavy: {
    backgroundColor: colors.dangerSoft
  },
  congModerate: {
    backgroundColor: colors.fastestSoft
  },
  congFreeflow: {
    backgroundColor: colors.primarySoft
  },
  congUnknown: {
    backgroundColor: colors.card
  },
  congBadgeText: {
    fontSize: 10,
    fontWeight: typography.weights.extrabold
  },
  congHeavyText: {
    color: colors.dangerBright
  },
  congModerateText: {
    color: colors.fastestBright
  },
  congFreeflowText: {
    color: colors.primary
  },
  congUnknownText: {
    color: colors.text.muted
  }
});
