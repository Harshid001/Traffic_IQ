import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Layers, AlertTriangle } from 'lucide-react-native';
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
          <Layers size={14} color={colors.info} />
          <Text style={styles.title}>SEGMENT CONGESTION MONITOR</Text>
        </View>
        <Text style={styles.subText}>
          {segments.length} {segments.length === 1 ? 'Segment' : 'Segments'}
        </Text>
      </View>

      {segments.length === 0 ? (
        <EmptyState
          title="No segments reported"
          message="The routing engine did not break this route into segments."
        />
      ) : (
        <View style={styles.segmentList}>
          {segments.map((seg, idx) => {
            // Only render a percentage when the server actually sent one.
            const hasCong = seg.congestion !== undefined && seg.congestion !== null;
            const cong = hasCong ? Math.round(seg.congestion) : null;
            const tier = cong === null ? null : congestionTier(cong);
            const segId = seg.id || `segment-${idx}`;
            const isSelected = selectedSegmentId === segId;

            return (
              <TouchableOpacity
                key={segId}
                activeOpacity={0.7}
                onPress={() => handleSelect(segId)}
                style={[styles.segmentItem, isSelected && styles.segmentItemSelected]}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={`${seg.name}. ${seg.length_km} kilometres, freeflow ${seg.freeflow_speed} kilometres per hour${cong !== null ? `, congestion ${cong} percent` : ''}${seg.incident_flag === 1 ? '. Hazard reported.' : ''}`}
                accessibilityHint="Loads the 24-hour profile for this segment"
              >
                <View style={styles.segmentItemLeft}>
                  <View style={styles.nameRow}>
                    <Text style={styles.segmentName} numberOfLines={1}>
                      {seg.name}
                    </Text>
                    {seg.incident_flag === 1 && (
                      <View style={styles.hazardBadge}>
                        <AlertTriangle size={10} color={colors.danger} />
                        <Text style={styles.hazardText}>Hazard</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.segmentSub}>
                    {seg.length_km} km • Freeflow: {seg.freeflow_speed} km/h
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
                      styles.congText,
                      tier === 'heavy'
                        ? styles.textHeavy
                        : tier === 'moderate'
                          ? styles.textModerate
                          : tier === 'freeflow'
                            ? styles.textFreeflow
                            : styles.textUnknown
                    ]}
                  >
                    {cong === null ? '—' : `${cong}%`}
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
    marginBottom: spacing.lg
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
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
    color: colors.text.muted
  },
  segmentList: {
    gap: spacing.sm
  },
  segmentItem: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.radius.md,
    padding: spacing.lg,
    minHeight: spacing.touchTargetMin,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md
  },
  segmentItemSelected: {
    borderColor: colors.primaryBorder,
    backgroundColor: colors.primaryFaint
  },
  segmentItemLeft: {
    flex: 1
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm
  },
  segmentName: {
    fontSize: typography.sizes.caption,
    lineHeight: typography.line.caption,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    flexShrink: 1
  },
  hazardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.dangerSoft,
    borderRadius: spacing.xs,
    paddingHorizontal: spacing.xs,
    paddingVertical: 1
  },
  hazardText: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    fontWeight: typography.weights.extrabold,
    color: colors.dangerBright
  },
  segmentSub: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    color: colors.text.secondary,
    marginTop: 2
  },
  congBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: spacing.radius.sm,
    borderWidth: 1
  },
  congFreeflow: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primaryBorder
  },
  congModerate: {
    backgroundColor: colors.fastestSoft,
    borderColor: colors.fastestBorder
  },
  congHeavy: {
    backgroundColor: colors.dangerSoft,
    borderColor: colors.dangerBorder
  },
  congUnknown: {
    backgroundColor: colors.neutral,
    borderColor: colors.border
  },
  congText: {
    fontSize: typography.sizes.caption,
    lineHeight: typography.line.caption,
    fontWeight: typography.weights.extrabold
  },
  textFreeflow: {
    color: colors.primary
  },
  textModerate: {
    color: colors.fastest
  },
  textHeavy: {
    color: colors.dangerBright
  },
  textUnknown: {
    color: colors.text.secondary
  }
});
