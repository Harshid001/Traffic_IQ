import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AlertTriangle, Sparkles, X, ArrowRight } from 'lucide-react-native';
import { useNavigationStore } from '../../store/navigationStore';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

/**
 * Proactive road alert.
 *
 * Renders inline within the overlay stack owned by `NavigateScreen`, so it can
 * no longer be drawn on top of the maneuver HUD. Previously this card was
 * absolutely positioned at `top: 90, zIndex: 45` while the HUD sat at
 * `top: 10, zIndex: 35`, which put the alert over the in-drive controls.
 */
const PredictiveAlertCardBase: React.FC = () => {
  const activeAlert = useNavigationStore(s => s.activeAlert);
  const dismissActiveAlert = useNavigationStore(s => s.dismissActiveAlert);
  const acceptReroute = useNavigationStore(s => s.acceptReroute);
  const routingData = useNavigationStore(s => s.routingData);

  const handleAction = useCallback(() => {
    if (!activeAlert) return;
    const targetId = activeAlert.better_route_id || routingData?.best_route_id;
    if (targetId) {
      acceptReroute(targetId);
    } else {
      dismissActiveAlert();
    }
  }, [activeAlert, routingData?.best_route_id, acceptReroute, dismissActiveAlert]);

  if (!activeAlert) return null;

  const hasForecast =
    activeAlert.current_cong !== undefined && activeAlert.fc20_cong !== undefined;
  const hasSavings = activeAlert.savings_min !== undefined && activeAlert.savings_min > 0;
  const hasReroute = Boolean(activeAlert.better_route_id || routingData?.best_route_id);

  return (
    <View
      style={styles.card}
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
      accessibilityLabel={`Predictive road alert. ${activeAlert.title}. ${activeAlert.message}`}
    >
      {/* Glow Strip */}
      <View style={styles.glowStrip} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconBox}>
            <AlertTriangle size={16} color={colors.fastest} />
          </View>
          <View style={styles.headerTextCol}>
            <Text style={styles.alertCategory}>PREDICTIVE ROAD ALERT</Text>
            <Text style={styles.alertTitle} numberOfLines={2}>
              {activeAlert.title}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={dismissActiveAlert}
          style={styles.closeBtn}
          hitSlop={spacing.hitSlop}
          accessibilityRole="button"
          accessibilityLabel="Dismiss alert"
        >
          <X size={16} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>

      {/* Message */}
      <Text style={styles.messageText}>{activeAlert.message}</Text>

      {/* Forecast Numbers Grid */}
      {hasForecast && (
        <View style={styles.gridRow}>
          <View style={styles.gridCell}>
            <Text style={styles.gridCellLabel}>CURRENT</Text>
            <Text style={styles.gridCellVal}>{Math.round(activeAlert.current_cong!)}%</Text>
          </View>
          <View style={styles.gridCell}>
            <Text style={styles.gridCellLabel}>+20 MIN</Text>
            <Text style={[styles.gridCellVal, { color: colors.fastest }]}>
              {Math.round(activeAlert.fc20_cong!)}%
            </Text>
          </View>
          {/* Only shown when the server reported a delay — no `|| 4.5` default. */}
          {activeAlert.expected_delay_min !== undefined && (
            <View style={styles.gridCell}>
              <Text style={styles.gridCellLabel}>EST. DELAY</Text>
              <Text style={[styles.gridCellVal, { color: colors.danger }]}>
                +{activeAlert.expected_delay_min}m
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Savings Callout */}
      {hasSavings && (
        <View style={styles.savingsBox}>
          <View style={styles.savingsLeft}>
            <Sparkles size={14} color={colors.primary} />
            <Text style={styles.savingsText}>
              Alternative saves ~{activeAlert.savings_min} min
            </Text>
          </View>
        </View>
      )}

      {/* Action Button */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handleAction}
        style={styles.rerouteButton}
        accessibilityRole="button"
        accessibilityLabel={
          hasReroute
            ? activeAlert.action_label || 'Accept reroute'
            : 'Dismiss alert'
        }
      >
        <Text style={styles.rerouteButtonText}>
          {hasReroute
            ? activeAlert.better_route_id
              ? 'Accept Reroute'
              : 'Switch to Best Alternative'
            : 'Acknowledge'}
        </Text>
        <ArrowRight size={14} color={colors.text.onAccent} strokeWidth={2.5} />
      </TouchableOpacity>
    </View>
  );
};

export const PredictiveAlertCard = React.memo(PredictiveAlertCardBase);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.fastestBorder,
    borderRadius: spacing.radius.xl,
    padding: spacing.cardPadding,
    shadowColor: colors.fastest,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    position: 'relative',
    overflow: 'hidden'
  },
  glowStrip: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: colors.fastest
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    gap: spacing.md
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: spacing.radius.md,
    backgroundColor: colors.fastestSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md
  },
  headerTextCol: {
    flex: 1
  },
  alertCategory: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    fontWeight: typography.weights.extrabold,
    color: colors.fastest,
    letterSpacing: typography.tracking.normal
  },
  alertTitle: {
    fontSize: typography.sizes.label,
    lineHeight: typography.line.label,
    fontWeight: typography.weights.bold,
    color: colors.text.bright
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: spacing.radius.sm,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center'
  },
  messageText: {
    fontSize: typography.sizes.caption,
    lineHeight: typography.line.caption,
    color: colors.text.body,
    marginBottom: spacing.lg
  },
  gridRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg
  },
  gridCell: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.radius.sm,
    padding: spacing.md,
    alignItems: 'center'
  },
  gridCellLabel: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    fontWeight: typography.weights.extrabold,
    color: colors.text.muted
  },
  gridCellVal: {
    fontSize: typography.sizes.caption,
    lineHeight: typography.line.caption,
    fontWeight: typography.weights.extrabold,
    color: colors.text.primary,
    marginTop: 2
  },
  savingsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    borderRadius: spacing.radius.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg
  },
  savingsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1
  },
  savingsText: {
    fontSize: typography.sizes.caption,
    lineHeight: typography.line.caption,
    fontWeight: typography.weights.bold,
    color: colors.primaryBright,
    flex: 1
  },
  rerouteButton: {
    backgroundColor: colors.fastest,
    borderRadius: spacing.radius.lg,
    minHeight: spacing.touchTargetMin,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm
  },
  rerouteButtonText: {
    fontSize: typography.sizes.caption,
    fontWeight: typography.weights.extrabold,
    color: colors.text.onAccent,
    letterSpacing: typography.tracking.normal,
    textTransform: 'uppercase'
  }
});
