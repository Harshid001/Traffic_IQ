import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Pressable } from 'react-native';
import { Lock, Navigation, ArrowRight, X, BellRing } from 'lucide-react-native';
import { useNavigationStore } from '../../store/navigationStore';
import { EmptyState } from '../Common/EmptyState';
import { formatClock, formatLongDate } from '../../utils/format';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { useLayout } from '../../theme/useLayout';

const LockScreenAlertModalBase: React.FC = () => {
  const showLockScreenModal = useNavigationStore(s => s.showLockScreenModal);
  const setShowLockScreenModal = useNavigationStore(s => s.setShowLockScreenModal);
  const activeAlert = useNavigationStore(s => s.activeAlert);
  const routingData = useNavigationStore(s => s.routingData);
  const acceptReroute = useNavigationStore(s => s.acceptReroute);

  // Live clock, ticking while the preview is open.
  const [now, setNow] = useState(() => new Date());
  const { dialogMaxWidth } = useLayout();
  useEffect(() => {
    if (!showLockScreenModal) return;
    const interval = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(interval);
  }, [showLockScreenModal]);

  if (!showLockScreenModal) return null;

  const close = () => setShowLockScreenModal(false);

  const handleAction = () => {
    const targetId = activeAlert?.better_route_id || routingData?.best_route_id;
    if (targetId) acceptReroute(targetId);
    close();
  };

  const savings = activeAlert?.savings_min;
  const actionLabel =
    savings !== undefined && savings > 0
      ? `Accept Reroute (-${Math.round(savings)}m)`
      : 'Accept Reroute';

  return (
    <Modal visible transparent animationType="fade" onRequestClose={close}>
      {/* The backdrop is now genuinely tappable, matching the instruction below. */}
      <Pressable
        style={styles.backdrop}
        onPress={close}
        accessibilityRole="button"
        accessibilityLabel="Close lock screen preview"
      >
        <View style={styles.topBar} pointerEvents="box-none">
          <View style={styles.lockRow}>
            <Lock size={12} color={colors.primary} />
            <Text style={styles.lockText}>Lock Screen Simulation</Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={close}
            style={styles.closeBtn}
            hitSlop={spacing.hitSlop}
            accessibilityRole="button"
            accessibilityLabel="Close lock screen preview"
          >
            <X size={16} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>

        {/* Center Clock & Push Notification. `onPress={() => {}}` keeps taps
            inside the card from dismissing the modal. */}
        <Pressable accessible={false} style={[styles.centerContainer, { maxWidth: dialogMaxWidth }]} onPress={() => {}}>
          <Text style={styles.clockTime}>{formatClock(now)}</Text>
          <Text style={styles.clockDate}>{formatLongDate(now)}</Text>

          {activeAlert ? (
            <View style={styles.pushCard}>
              <View style={styles.pushHeader}>
                <View style={styles.pushHeaderLeft}>
                  <View style={styles.appIcon}>
                    <Navigation
                      size={12}
                      color={colors.text.onAccent}
                      strokeWidth={3}
                      style={{ transform: [{ rotate: '45deg' }] }}
                    />
                  </View>
                  <Text style={styles.appName}>TrafficIQ</Text>
                  <Text style={styles.pushTime}>now</Text>
                </View>
                <BellRing size={14} color={colors.fastest} />
              </View>

              <Text style={styles.pushTitle}>{activeAlert.title}</Text>
              <Text style={styles.pushMessage}>{activeAlert.message}</Text>

              <View style={styles.pushActions}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleAction}
                  style={styles.acceptButton}
                  accessibilityRole="button"
                  accessibilityLabel={actionLabel}
                >
                  <Text style={styles.acceptButtonText}>{actionLabel}</Text>
                  <ArrowRight size={12} color={colors.text.onAccent} strokeWidth={2.5} />
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={close}
                  style={styles.dismissButton}
                  accessibilityRole="button"
                  accessibilityLabel="Dismiss alert preview"
                >
                  <Text style={styles.dismissButtonText}>Dismiss</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            /* No fabricated sample alert: show the real "nothing to show" state. */
            <EmptyState
              title="No active alert"
              message="Start navigating to see how proactive alerts appear on your lock screen."
              icon={<BellRing size={20} color={colors.text.secondary} />}
            />
          )}

          <Text style={styles.hintText}>
            Proactive background notifications alert you before you reach severe bottlenecks.
          </Text>
        </Pressable>

        <Text style={styles.bottomHint}>Tap Dismiss or outside to return</Text>
      </Pressable>
    </Modal>
  );
};

export const LockScreenAlertModal = React.memo(LockScreenAlertModalBase);

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.scrimStrong,
    padding: spacing.xxl,
    justifyContent: 'space-between'
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.lg
  },
  lockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm
  },
  lockText: {
    fontSize: typography.sizes.caption,
    lineHeight: typography.line.caption,
    color: colors.text.secondary,
    fontWeight: typography.weights.semibold
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: spacing.radius.sm,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center'
  },
  centerContainer: {
    alignItems: 'center',
    width: '100%',
    alignSelf: 'center'
  },
  clockTime: {
    fontSize: 48,
    lineHeight: 56,
    fontWeight: typography.weights.extrabold,
    color: colors.text.bright
  },
  clockDate: {
    fontSize: typography.sizes.label,
    lineHeight: typography.line.label,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
    marginBottom: spacing.xxl
  },
  pushCard: {
    width: '100%',
    backgroundColor: colors.overlayCard,
    borderWidth: 1,
    borderColor: colors.fastestBorder,
    borderRadius: spacing.radius.xxl,
    padding: spacing.cardPadding,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16
  },
  pushHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm
  },
  pushHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm
  },
  appIcon: {
    width: 20,
    height: 20,
    borderRadius: spacing.sm,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  appName: {
    fontSize: typography.sizes.caption,
    lineHeight: typography.line.caption,
    fontWeight: typography.weights.bold,
    color: colors.text.bright
  },
  pushTime: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    color: colors.text.muted
  },
  pushTitle: {
    fontSize: typography.sizes.label,
    lineHeight: typography.line.label,
    fontWeight: typography.weights.bold,
    color: colors.text.bright,
    marginBottom: 3
  },
  pushMessage: {
    fontSize: typography.sizes.caption,
    lineHeight: typography.line.caption,
    color: colors.text.body,
    marginBottom: spacing.lg
  },
  pushActions: {
    flexDirection: 'row',
    gap: spacing.md
  },
  acceptButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: spacing.radius.md,
    minHeight: spacing.touchTargetMin,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs
  },
  acceptButtonText: {
    fontSize: typography.sizes.caption,
    fontWeight: typography.weights.extrabold,
    color: colors.text.onAccent
  },
  dismissButton: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.radius.md,
    paddingHorizontal: spacing.cardPadding,
    minHeight: spacing.touchTargetMin,
    alignItems: 'center',
    justifyContent: 'center'
  },
  dismissButtonText: {
    fontSize: typography.sizes.caption,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary
  },
  hintText: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.xxl
  },
  bottomHint: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    // Was #475569 at 2.62:1 — effectively invisible. Now 5.65:1.
    color: colors.text.dimmed,
    textAlign: 'center',
    marginBottom: spacing.lg
  }
});
