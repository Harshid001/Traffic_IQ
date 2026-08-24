import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AlertTriangle, Sparkles, X, ArrowRight, Zap, Check } from 'lucide-react-native';
import { useNavigationStore } from '../../store/navigationStore';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

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
      accessibilityLabel={`Live alert. ${activeAlert.title}. ${activeAlert.message}`}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconBox}>
            <AlertTriangle size={16} color={colors.warningBright} />
          </View>
          <View style={styles.headerTextCol}>
            <Text style={styles.alertCategory}>LIVE TRAFFIC ADVISORY</Text>
            <Text style={styles.alertTitle} numberOfLines={2}>
              {activeAlert.title}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.75}
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

      {/* Metrics Row */}
      {hasForecast && (
        <View style={styles.gridRow}>
          <View style={styles.gridCell}>
            <Text style={styles.gridCellLabel}>CURRENT DELAY</Text>
            <Text style={styles.gridCellVal}>{Math.round(activeAlert.current_cong!)}%</Text>
          </View>
          <View style={styles.gridCell}>
            <Text style={styles.gridCellLabel}>OUTLOOK (+20m)</Text>
            <Text style={[styles.gridCellVal, { color: colors.fastestBright }]}>
              {Math.round(activeAlert.fc20_cong!)}%
            </Text>
          </View>
          {activeAlert.expected_delay_min !== undefined && (
            <View style={styles.gridCell}>
              <Text style={styles.gridCellLabel}>EST. TIME LOSS</Text>
              <Text style={[styles.gridCellVal, { color: colors.dangerBright }]}>
                +{activeAlert.expected_delay_min}m
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={dismissActiveAlert}
          style={styles.dismissBtn}
          hitSlop={spacing.hitSlop}
        >
          <Text style={styles.dismissText}>Ignore</Text>
        </TouchableOpacity>

        {hasReroute && (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleAction}
            style={styles.rerouteBtn}
            accessibilityRole="button"
            accessibilityLabel="Accept recommended alternate route"
          >
            <Zap size={14} color={colors.text.onAccent} />
            <Text style={styles.rerouteBtnText}>
              {hasSavings ? `Switch Route (Save ${activeAlert.savings_min}m)` : 'Accept Faster Bypass'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export const PredictiveAlertCard = React.memo(PredictiveAlertCardBase);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.warningBorder,
    borderRadius: spacing.radius.xl,
    padding: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.warningSoft,
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerTextCol: {
    flex: 1
  },
  alertCategory: {
    fontSize: 9,
    fontWeight: typography.weights.extrabold,
    color: colors.warningBright,
    letterSpacing: 0.5
  },
  alertTitle: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
    color: colors.text.bright
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border
  },
  messageText: {
    fontSize: typography.sizes.caption,
    lineHeight: 18,
    color: colors.text.body,
    marginBottom: spacing.sm
  },
  gridRow: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: spacing.radius.md,
    padding: spacing.sm,
    gap: spacing.xs,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border
  },
  gridCell: {
    flex: 1,
    alignItems: 'center'
  },
  gridCellLabel: {
    fontSize: 9,
    fontWeight: typography.weights.bold,
    color: colors.text.muted,
    marginBottom: 2
  },
  gridCellVal: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.extrabold,
    color: colors.text.primary
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.sm
  },
  dismissBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6
  },
  dismissText: {
    fontSize: 11,
    color: colors.text.muted,
    fontWeight: typography.weights.semibold
  },
  rerouteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    borderRadius: spacing.radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 8
  },
  rerouteBtnText: {
    fontSize: 11,
    fontWeight: typography.weights.extrabold,
    color: colors.text.onAccent
  }
});
