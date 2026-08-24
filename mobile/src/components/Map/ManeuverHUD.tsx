import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable } from 'react-native';
import {
  ArrowUp,
  CornerUpRight,
  CornerUpLeft,
  ArrowUpRight,
  ArrowUpLeft,
  MapPin,
  Volume2,
  VolumeX,
  X,
  AlertTriangle,
  Radio,
  ShieldAlert,
  Flame,
  Check
} from 'lucide-react-native';
import { useNavigationStore } from '../../store/navigationStore';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { useLayout } from '../../theme/useLayout';

const HAZARD_OPTIONS = [
  { id: 'jam', label: 'Heavy Traffic Jam', icon: Flame, color: colors.hazard.jam },
  { id: 'police', label: 'Speed Camera / Police', icon: Radio, color: colors.hazard.police },
  { id: 'hazard', label: 'Road Hazard / Object', icon: AlertTriangle, color: colors.hazard.hazard },
  { id: 'work', label: 'Construction / Roadwork', icon: ShieldAlert, color: colors.hazard.work }
];

const ManeuverHUDBase: React.FC = () => {
  const currentManeuver = useNavigationStore(s => s.currentManeuver);
  const currentSpeedKmh = useNavigationStore(s => s.currentSpeedKmh);
  const speedLimitKmh = useNavigationStore(s => s.speedLimitKmh);
  const isMuted = useNavigationStore(s => s.isMuted);
  const toggleMute = useNavigationStore(s => s.toggleMute);
  const stopNavigation = useNavigationStore(s => s.stopNavigation);
  const upcomingSegment = useNavigationStore(s => s.upcomingSegment);
  const { labelMaxWidth, dialogMaxWidth } = useLayout();

  const [hazardModalOpen, setHazardModalOpen] = useState(false);
  const [reportedHazard, setReportedHazard] = useState<string | null>(null);

  const renderManeuverIcon = useCallback(() => {
    const iconProps = { size: 28, color: colors.primaryBright, strokeWidth: 2.6 } as const;
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

  const handleReportHazard = (hazardId: string) => {
    setReportedHazard(hazardId);
    setTimeout(() => {
      setReportedHazard(null);
      setHazardModalOpen(false);
    }, 1200);
  };

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

        {/* Action Controls */}
        <View style={styles.actionCol}>
          {/* Quick Hazard Report Button */}
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => setHazardModalOpen(true)}
            style={[styles.actionButton, styles.hazardButton]}
            hitSlop={spacing.hitSlop}
            accessibilityRole="button"
            accessibilityLabel="Report road hazard"
          >
            <AlertTriangle size={17} color={colors.warningBright} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.75}
            onPress={toggleMute}
            style={styles.actionButton}
            hitSlop={spacing.hitSlop}
            accessibilityRole="button"
            accessibilityLabel={isMuted ? 'Unmute voice guidance' : 'Mute voice guidance'}
          >
            {isMuted ? (
              <VolumeX size={17} color={colors.text.muted} />
            ) : (
              <Volume2 size={17} color={colors.primary} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.75}
            onPress={stopNavigation}
            style={[styles.actionButton, styles.exitButton]}
            hitSlop={spacing.hitSlop}
            accessibilityRole="button"
            accessibilityLabel="End navigation trip"
          >
            <X size={17} color={colors.dangerBright} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Floating Speedometer & Upcoming Segment Strip */}
      <View style={styles.telemetryStrip}>
        <View style={styles.speedPill}>
          <View style={styles.speedCol}>
            <Text style={styles.speedLabel}>SPEED</Text>
            <Text style={[styles.speedVal, isOverSpeed && styles.speedValOver]}>
              {currentSpeedKmh} <Text style={styles.speedUnit}>km/h</Text>
            </Text>
          </View>
          <View style={styles.speedDivider} />
          <View
            style={[styles.limitCircle, isOverSpeed && styles.limitCircleOver]}
            accessibilityLabel={`Speed limit ${speedLimitKmh}`}
          >
            <Text style={[styles.limitText, isOverSpeed && styles.limitTextOver]}>{speedLimitKmh}</Text>
          </View>
        </View>

        {upcomingSegment && (
          <View style={[styles.segmentPill, { maxWidth: labelMaxWidth }]}>
            <View
              style={[
                styles.segmentDot,
                upcomingCongestion && upcomingCongestion > 60
                  ? { backgroundColor: colors.danger }
                  : upcomingCongestion && upcomingCongestion > 30
                  ? { backgroundColor: colors.warning }
                  : { backgroundColor: colors.primary }
              ]}
            />
            <View style={styles.segmentTextCol}>
              <Text style={styles.segmentLabel}>NEXT ROAD</Text>
              <Text style={styles.segmentName} numberOfLines={1}>
                {upcomingSegment.name || 'Continuing ahead'}
              </Text>
            </View>
            {upcomingCongestion !== null && (
              <Text
                style={[
                  styles.segmentCong,
                  upcomingCongestion > 60
                    ? { color: colors.dangerBright }
                    : upcomingCongestion > 30
                    ? { color: colors.warningBright }
                    : { color: colors.primaryBright }
                ]}
              >
                {upcomingCongestion}%
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Driver Hazard Reporting Modal */}
      <Modal
        visible={hazardModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setHazardModalOpen(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setHazardModalOpen(false)}>
          <Pressable
            style={[styles.hazardModalContent, { maxWidth: dialogMaxWidth }]}
            onPress={e => e.stopPropagation()}
          >
            <View style={styles.hazardHeaderRow}>
              <View>
                <Text style={styles.hazardTitle}>REPORT ROAD CONDITION</Text>
                <Text style={styles.hazardSub}>Help fellow drivers with live incident updates</Text>
              </View>
              <TouchableOpacity onPress={() => setHazardModalOpen(false)} hitSlop={spacing.hitSlop}>
                <X size={18} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.hazardGrid}>
              {HAZARD_OPTIONS.map(opt => {
                const Icon = opt.icon;
                const isSuccess = reportedHazard === opt.id;
                return (
                  <TouchableOpacity
                    key={opt.id}
                    activeOpacity={0.8}
                    onPress={() => handleReportHazard(opt.id)}
                    style={[
                      styles.hazardCard,
                      isSuccess && { borderColor: colors.primary, backgroundColor: colors.primarySoft }
                    ]}
                  >
                    <View style={[styles.hazardIconCircle, { backgroundColor: opt.color + '22' }]}>
                      {isSuccess ? (
                        <Check size={20} color={colors.primary} strokeWidth={3} />
                      ) : (
                        <Icon size={20} color={opt.color} />
                      )}
                    </View>
                    <Text style={[styles.hazardCardText, isSuccess && { color: colors.primaryBright }]}>
                      {isSuccess ? 'Reported!' : opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

export const ManeuverHUD = React.memo(ManeuverHUDBase);

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm
  },
  hudBanner: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.primaryBorder,
    borderRadius: spacing.radius.xl,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: spacing.radius.lg,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6
  },
  guidanceCol: {
    flex: 1
  },
  distRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 2
  },
  distText: {
    fontSize: typography.sizes.h2,
    lineHeight: 24,
    fontWeight: typography.weights.extrabold,
    color: colors.primaryBright
  },
  roadPill: {
    backgroundColor: colors.card,
    borderRadius: spacing.radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 1,
    borderWidth: 1,
    borderColor: colors.border
  },
  roadText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.text.secondary
  },
  instructionText: {
    fontSize: typography.sizes.body,
    lineHeight: 18,
    fontWeight: typography.weights.bold,
    color: colors.text.bright
  },
  actionCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: spacing.radius.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center'
  },
  hazardButton: {
    backgroundColor: colors.warningSoft,
    borderColor: colors.warningBorder
  },
  exitButton: {
    backgroundColor: colors.dangerSoft,
    borderColor: colors.dangerBorder
  },
  telemetryStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm
  },
  speedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: spacing.radius.lg,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    gap: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6
  },
  speedCol: {
    alignItems: 'flex-start'
  },
  speedLabel: {
    fontSize: 9,
    fontWeight: typography.weights.extrabold,
    color: colors.text.muted,
    letterSpacing: 0.5
  },
  speedVal: {
    fontSize: typography.sizes.h3,
    lineHeight: 20,
    fontWeight: typography.weights.extrabold,
    color: colors.text.bright
  },
  speedValOver: {
    color: colors.dangerBright
  },
  speedUnit: {
    fontSize: 10,
    fontWeight: typography.weights.medium,
    color: colors.text.muted
  },
  speedDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border
  },
  limitCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.text.bright,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF'
  },
  limitCircleOver: {
    borderColor: colors.danger,
    backgroundColor: '#FEE2E2'
  },
  limitText: {
    fontSize: 11,
    fontWeight: typography.weights.extrabold,
    color: '#000'
  },
  limitTextOver: {
    color: colors.danger
  },
  segmentPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: spacing.radius.lg,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    gap: spacing.sm
  },
  segmentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary
  },
  segmentTextCol: {
    flex: 1
  },
  segmentLabel: {
    fontSize: 9,
    fontWeight: typography.weights.extrabold,
    color: colors.text.muted
  },
  segmentName: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: typography.weights.bold,
    color: colors.text.bright
  },
  segmentCong: {
    fontSize: 11,
    fontWeight: typography.weights.extrabold
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.scrim,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl
  },
  hazardModalContent: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: spacing.radius.xxl,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    padding: spacing.cardPaddingLg,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.7,
    shadowRadius: 24
  },
  hazardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg
  },
  hazardTitle: {
    fontSize: typography.sizes.label,
    fontWeight: typography.weights.extrabold,
    color: colors.text.bright,
    letterSpacing: 0.5
  },
  hazardSub: {
    fontSize: typography.sizes.caption,
    color: colors.text.secondary,
    marginTop: 2
  },
  hazardGrid: {
    gap: spacing.sm
  },
  hazardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.radius.lg,
    padding: spacing.md,
    gap: spacing.md
  },
  hazardIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center'
  },
  hazardCardText: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    flex: 1
  }
});
