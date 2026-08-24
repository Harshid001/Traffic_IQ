import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import {
  ArrowUp,
  CornerUpRight,
  CornerUpLeft,
  ArrowUpRight,
  ArrowUpLeft,
  MapPin,
  Volume2,
  VolumeX,
  X
} from 'lucide-react-native';
import { useNavigationStore } from '../../store/navigationStore';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { useLayout } from '../../theme/useLayout';

/**
 * In-drive guidance banner.
 *
 * This component no longer positions itself absolutely; `NavigateScreen` owns
 * the top overlay stack so the HUD and the predictive alert card cannot occupy
 * the same coordinates.
 */
const ManeuverHUDBase: React.FC = () => {
  const currentManeuver = useNavigationStore(s => s.currentManeuver);
  const currentSpeedKmh = useNavigationStore(s => s.currentSpeedKmh);
  const speedLimitKmh = useNavigationStore(s => s.speedLimitKmh);
  const isMuted = useNavigationStore(s => s.isMuted);
  const toggleMute = useNavigationStore(s => s.toggleMute);
  const stopNavigation = useNavigationStore(s => s.stopNavigation);
  const upcomingSegment = useNavigationStore(s => s.upcomingSegment);
  const { labelMaxWidth } = useLayout();

  const renderManeuverIcon = useCallback(() => {
    const iconProps = { size: 28, color: colors.primary, strokeWidth: 2.5 } as const;
    switch (currentManeuver?.type) {
      case 'turn-right':
        return <CornerUpRight {...iconProps} />;
      case 'turn-left':
        return <CornerUpLeft {...iconProps} />;
      case 'slight-right':
        return <ArrowUpRight {...iconProps} />;
      case 'slight-left':
        return <ArrowUpLeft {...iconProps} />;
      case 'arrive':
        return <MapPin {...iconProps} />;
      case 'straight':
      default:
        return <ArrowUp {...iconProps} />;
    }
  }, [currentManeuver?.type]);

  if (!currentManeuver) return null;

  const isOverSpeed = currentSpeedKmh > speedLimitKmh;
  const upcomingCongestion =
    upcomingSegment?.congestion === undefined || upcomingSegment?.congestion === null
      ? null
      : Math.round(upcomingSegment.congestion);

  return (
    <View style={styles.container}>
      {/* Primary Maneuver HUD Banner */}
      <View style={styles.hudBanner}>
        <View style={styles.leftRow}>
          <View style={styles.iconBox}>{renderManeuverIcon()}</View>

          <View style={styles.guidanceCol}>
            <View style={styles.distRow}>
              <Text style={styles.distText}>
                {currentManeuver.dist_to_action_m ? `${currentManeuver.dist_to_action_m} m` : 'Ahead'}
              </Text>
              {currentManeuver.road_name ? (
                <View style={styles.roadPill}>
                  <Text style={styles.roadText} numberOfLines={1}>
                    {currentManeuver.road_name}
                  </Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.instructionText} numberOfLines={2}>
              {currentManeuver.instruction}
            </Text>
          </View>
        </View>

        {/* Action Controls. Both are 44x44 — these are the two most
            safety-critical controls in the app and were previously 32x32
            and completely unlabelled. */}
        <View style={styles.actionCol}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={toggleMute}
            style={styles.actionButton}
            hitSlop={spacing.hitSlop}
            accessibilityRole="button"
            accessibilityLabel={isMuted ? 'Unmute voice guidance' : 'Mute voice guidance'}
            accessibilityState={{ selected: isMuted }}
          >
            {isMuted ? (
              <VolumeX size={18} color={colors.text.muted} />
            ) : (
              <Volume2 size={18} color={colors.primary} />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={stopNavigation}
            style={[styles.actionButton, styles.exitButton]}
            hitSlop={spacing.hitSlop}
            accessibilityRole="button"
            accessibilityLabel="Exit navigation"
          >
            <X size={18} color={colors.danger} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Floating Speedometer & Upcoming Segment Strip */}
      <View style={styles.telemetryStrip}>
        <View style={styles.speedPill}>
          <View>
            <Text style={styles.speedLabel}>SPEED</Text>
            <Text
              style={[styles.speedVal, isOverSpeed && styles.speedValOver]}
              accessibilityLabel={`Current speed ${currentSpeedKmh} kilometres per hour${isOverSpeed ? ', over the limit' : ''}`}
            >
              {currentSpeedKmh} <Text style={styles.speedUnit}>km/h</Text>
            </Text>
          </View>
          <View style={styles.speedDivider} />
          <View style={styles.limitCircle} accessibilityLabel={`Speed limit ${speedLimitKmh}`}>
            <Text style={styles.limitText}>{speedLimitKmh}</Text>
          </View>
        </View>

        {upcomingSegment && (
          <View style={[styles.segmentPill, { maxWidth: labelMaxWidth }]}>
            <View style={styles.segmentDot} />
            <View style={styles.segmentTextCol}>
              <Text style={styles.segmentLabel}>NEXT ROAD</Text>
              <Text style={styles.segmentName} numberOfLines={1}>
                {upcomingSegment.name || 'Ahead'}
              </Text>
            </View>
            {upcomingCongestion !== null && (
              <Text style={styles.segmentCong}>{upcomingCongestion}%</Text>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

export const ManeuverHUD = React.memo(ManeuverHUDBase);

const styles = StyleSheet.create({
  container: {
    gap: spacing.md
  },
  hudBanner: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.primaryBorder,
    borderRadius: spacing.radius.xl,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: spacing.radius.lg,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg
  },
  guidanceCol: {
    flex: 1
  },
  distRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm
  },
  distText: {
    fontSize: typography.sizes.h2,
    lineHeight: typography.line.h2,
    fontWeight: typography.weights.extrabold,
    color: colors.text.bright
  },
  roadPill: {
    backgroundColor: colors.neutral,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: spacing.radius.sm,
    flexShrink: 1
  },  roadText: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    color: colors.text.body,
    fontWeight: typography.weights.semibold
  },
  instructionText: {
    fontSize: typography.sizes.label,
    lineHeight: typography.line.label,
    color: colors.text.body,
    fontWeight: typography.weights.medium,
    marginTop: 2
  },
  actionCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm
  },
  actionButton: {
    width: spacing.touchTargetMin,
    height: spacing.touchTargetMin,
    borderRadius: spacing.radius.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center'
  },
  exitButton: {
    backgroundColor: colors.dangerSoft,
    borderColor: colors.dangerBorder
  },
  telemetryStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md
  },
  speedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.overlaySurface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm
  },
  speedLabel: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    fontWeight: typography.weights.extrabold,
    color: colors.text.muted
  },
  speedVal: {
    fontSize: typography.sizes.h3,
    lineHeight: typography.line.h3,
    fontWeight: typography.weights.extrabold,
    color: colors.primary
  },
  speedValOver: {
    color: colors.danger
  },
  speedUnit: {
    fontSize: typography.sizes.micro,
    fontWeight: typography.weights.regular,
    color: colors.text.secondary
  },
  speedDivider: {
    width: 1,
    height: 22,
    backgroundColor: colors.borderStrong,
    marginHorizontal: spacing.md
  },
  limitCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: colors.danger,
    backgroundColor: colors.text.bright,
    alignItems: 'center',
    justifyContent: 'center'
  },
  limitText: {
    fontSize: typography.sizes.micro,
    fontWeight: typography.weights.extrabold,
    color: colors.text.onLight
  },
  segmentPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.overlaySurface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    flexShrink: 1
  },
  segmentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginRight: spacing.sm
  },
  segmentTextCol: {
    flex: 1
  },
  segmentLabel: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    fontWeight: typography.weights.extrabold,
    color: colors.text.muted
  },
  segmentName: {
    fontSize: typography.sizes.caption,
    lineHeight: typography.line.caption,
    fontWeight: typography.weights.semibold,
    color: colors.text.strong
  },
  segmentCong: {
    fontSize: typography.sizes.caption,
    lineHeight: typography.line.caption,
    fontWeight: typography.weights.extrabold,
    color: colors.fastest,
    marginLeft: spacing.sm
  }
});
