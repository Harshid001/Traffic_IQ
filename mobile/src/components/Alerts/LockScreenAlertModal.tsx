import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Pressable } from 'react-native';
import { Lock, Navigation, ArrowRight, X, BellRing, Zap } from 'lucide-react-native';
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
      ? `Accept Reroute (Save ${Math.round(savings)}m)`
      : 'Accept Faster Route';

  return (
    <Modal visible transparent animationType="fade" onRequestClose={close}>
      <Pressable
        style={styles.backdrop}
        onPress={close}
        accessibilityRole="button"
        accessibilityLabel="Close lock screen preview"
      >
        <View style={styles.topBar} pointerEvents="box-none">
          <View style={styles.lockRow}>
            <Lock size={12} color={colors.primary} />
            <Text style={styles.lockText}>Lock Screen Notification Center</Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={close}
            style={styles.closeBtn}
            hitSlop={spacing.hitSlop}
            accessibilityRole="button"
            accessibilityLabel="Close lock screen preview"
          >
            <X size={16} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>

        <Pressable accessible={false} style={[styles.centerContainer, { maxWidth: dialogMaxWidth }]} onPress={e => e.stopPropagation()}>
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
                  <Text style={styles.pushDot}>•</Text>
                  <Text style={styles.pushTime}>Just now</Text>
                </View>
                <BellRing size={14} color={colors.fastest} />
              </View>

              <Text style={styles.pushTitle}>{activeAlert.title}</Text>
              <Text style={styles.pushMessage}>{activeAlert.message}</Text>

              <View style={styles.pushActions}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={handleAction}
                  style={styles.actionButton}
                >
                  <Zap size={13} color={colors.text.onAccent} />
                  <Text style={styles.actionButtonText}>{actionLabel}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={close}
                  style={styles.dismissButton}
                >
                  <Text style={styles.dismissButtonText}>Dismiss</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <EmptyState
                title="No active lockscreen alerts"
                message="Alerts trigger automatically when heavy congestion develops along your route."
              />
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export const LockScreenAlertModal = React.memo(LockScreenAlertModalBase);

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.82)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.cardPadding
  },
  topBar: {
    position: 'absolute',
    top: spacing.xl,
    left: spacing.cardPadding,
    right: spacing.cardPadding,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  lockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: spacing.radius.pill,
    borderWidth: 1,
    borderColor: colors.border
  },
  lockText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.primary
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border
  },
  centerContainer: {
    width: '100%',
    alignItems: 'center',
    gap: spacing.md
  },
  clockTime: {
    fontSize: 56,
    lineHeight: 64,
    fontWeight: typography.weights.extrabold,
    color: colors.text.bright,
    letterSpacing: -1
  },
  clockDate: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
    marginBottom: spacing.lg
  },
  pushCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.primaryBorder,
    borderRadius: spacing.radius.xxl,
    padding: spacing.cardPaddingLg,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.7,
    shadowRadius: 20
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
    gap: 6
  },
  appIcon: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  appName: {
    fontSize: 11,
    fontWeight: typography.weights.extrabold,
    color: colors.text.bright
  },
  pushDot: {
    fontSize: 10,
    color: colors.text.muted
  },
  pushTime: {
    fontSize: 10,
    color: colors.text.muted
  },
  pushTitle: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
    color: colors.text.bright,
    marginBottom: 4
  },
  pushMessage: {
    fontSize: typography.sizes.caption,
    lineHeight: 18,
    color: colors.text.body,
    marginBottom: spacing.md
  },
  pushActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    borderRadius: spacing.radius.lg,
    paddingVertical: 10
  },
  actionButtonText: {
    fontSize: 11,
    fontWeight: typography.weights.extrabold,
    color: colors.text.onAccent
  },
  dismissButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: 10
  },
  dismissButtonText: {
    fontSize: 11,
    color: colors.text.muted,
    fontWeight: typography.weights.semibold
  },
  emptyCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: spacing.radius.xl,
    padding: spacing.cardPadding,
    borderWidth: 1,
    borderColor: colors.border
  }
});
