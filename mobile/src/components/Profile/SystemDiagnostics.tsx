import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { Activity, RefreshCw, CheckCircle2, XCircle, Radio, Bell, Clock, ShieldAlert } from 'lucide-react-native';
import { useSettingsStore } from '../../store/settingsStore';
import { useNavigationStore } from '../../store/navigationStore';
import { ErrorState } from '../Common/ErrorState';
import { EmptyState } from '../Common/EmptyState';
import { Card } from '../Common/Card';
import { Badge } from '../Common/Badge';
import { isInsecureTransport, API_BASE_URL } from '../../services/api';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

const HEALTH_REFRESH_MS = 30000;

/** A service value is treated as unhealthy when it reads like a failure. */
const isUnhealthy = (value: string): boolean =>
  /offline|error|unavailable|failed|down|disconnected/i.test(value);

const SystemDiagnosticsBase: React.FC = () => {
  const systemHealth = useSettingsStore(s => s.systemHealth);
  const refreshHealth = useSettingsStore(s => s.refreshHealth);
  const isLoadingHealth = useSettingsStore(s => s.isLoadingHealth);
  const healthError = useSettingsStore(s => s.healthError);
  const trafficMode = useSettingsStore(s => s.trafficMode);
  const setTrafficMode = useSettingsStore(s => s.setTrafficMode);
  const backgroundAlertsEnabled = useSettingsStore(s => s.backgroundAlertsEnabled);
  const toggleBackgroundAlerts = useSettingsStore(s => s.toggleBackgroundAlerts);
  const soundEnabled = useSettingsStore(s => s.soundEnabled);
  const toggleSound = useSettingsStore(s => s.toggleSound);
  const alertCooldownSeconds = useSettingsStore(s => s.alertCooldownSeconds);
  const setAlertCooldownSeconds = useSettingsStore(s => s.setAlertCooldownSeconds);

  const fetchRoutes = useNavigationStore(s => s.fetchRoutes);
  const selectedCorridor = useNavigationStore(s => s.selectedCorridor);

  const [lastCheckedAt, setLastCheckedAt] = useState<number | null>(null);
  const [, forceTick] = useState(0);

  const doRefresh = useCallback(async () => {
    await refreshHealth();
    setLastCheckedAt(Date.now());
  }, [refreshHealth]);

  // Single 30s poll for the health endpoint.
  const doRefreshRef = useRef(doRefresh);
  doRefreshRef.current = doRefresh;

  useEffect(() => {
    doRefreshRef.current();
    const interval = setInterval(() => doRefreshRef.current(), HEALTH_REFRESH_MS);
    return () => clearInterval(interval);
  }, []);

  /**
   * One stable 1s interval to re-render the relative timestamp.
   * The previous version listed the counter in its own dependency array, which
   * tore down and recreated the interval on every single tick.
   */
  useEffect(() => {
    if (lastCheckedAt === null) return;
    const interval = setInterval(() => forceTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [lastCheckedAt]);

  const handleTrafficModeToggle = useCallback(
    (mode: 'DEMO' | 'REAL') => {
      if (mode === trafficMode) return;
      setTrafficMode(mode);
      fetchRoutes(selectedCorridor, undefined, mode);
    },
    [trafficMode, setTrafficMode, fetchRoutes, selectedCorridor]
  );

  const cycleCooldown = useCallback(() => {
    // 1 min -> 3 min -> 5 min -> 10 min -> back to 1 min
    const steps = [60, 180, 300, 600];
    const next = steps[(steps.indexOf(alertCooldownSeconds) + 1) % steps.length];
    setAlertCooldownSeconds(next);
  }, [alertCooldownSeconds, setAlertCooldownSeconds]);

  const services: Record<string, string> | null = systemHealth?.services ?? null;
  const secondsAgo = lastCheckedAt === null ? null : Math.floor((Date.now() - lastCheckedAt) / 1000);

  return (
    <View style={styles.container}>
      {/* Traffic Data Source Switcher */}
      <Card>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Radio size={14} color={colors.primary} />
            <Text style={styles.title}>TRAFFIC DATA SOURCE</Text>
          </View>
          <Badge variant="primary" size="sm">
            {trafficMode}
          </Badge>
        </View>

        <View style={styles.modeGrid}>
          {(['DEMO', 'REAL'] as const).map((mode) => {
            const isActive = trafficMode === mode;
            return (
              <TouchableOpacity
                key={mode}
                activeOpacity={0.7}
                onPress={() => handleTrafficModeToggle(mode)}
                style={[styles.modeButton, isActive && styles.modeButtonSelected]}
                accessibilityRole="radio"
                accessibilityState={{ checked: isActive }}
                accessibilityLabel={
                  mode === 'DEMO'
                    ? 'Demo simulation, deterministic evaluation'
                    : 'Live API from TomTom, real-world speed flow'
                }
              >
                <Text style={[styles.modeButtonTitle, isActive && styles.modeButtonTitleSelected]}>
                  {mode === 'DEMO' ? 'DEMO Simulation' : 'Live API (TomTom)'}
                </Text>
                <Text style={styles.modeButtonSub}>
                  {mode === 'DEMO' ? 'Deterministic evaluation' : 'Real-world speed flow'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Card>

      {/* Notifications & Sound Toggles */}
      <Card>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Bell size={14} color={colors.fastest} />
            <Text style={styles.title}>DRIVER ALERTS & AUDIO</Text>
          </View>
        </View>

        <View style={styles.switchRow}>
          <View style={styles.switchTextCol}>
            <Text style={styles.switchTitle}>Proactive Road Alerts</Text>
            <Text style={styles.switchSub}>
              Surface warnings for bottlenecks ahead while navigating
            </Text>
          </View>
          <Switch
            value={backgroundAlertsEnabled}
            onValueChange={toggleBackgroundAlerts}
            trackColor={{ false: colors.borderStrong, true: colors.primary }}
            thumbColor={colors.text.bright}
            accessibilityLabel="Proactive road alerts"
          />
        </View>

        <View style={[styles.switchRow, styles.switchRowBorder]}>
          <View style={styles.switchTextCol}>
            <Text style={styles.switchTitle}>Cockpit Chime & Haptics</Text>
            <Text style={styles.switchSub}>
              Tones on web, vibration on device, for maneuvers and traffic spikes
            </Text>
          </View>
          <Switch
            value={soundEnabled}
            onValueChange={toggleSound}
            trackColor={{ false: colors.borderStrong, true: colors.primary }}
            thumbColor={colors.text.bright}
            accessibilityLabel="Cockpit chime and haptics"
          />
        </View>

        {/* Cooldown is now read by the alert pipeline, so expose it. */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={cycleCooldown}
          style={[styles.switchRow, styles.switchRowBorder]}
          accessibilityRole="button"
          accessibilityLabel={`Alert cooldown, currently ${alertCooldownSeconds / 60} minutes. Tap to change.`}
        >
          <View style={styles.switchTextCol}>
            <Text style={styles.switchTitle}>Alert Cooldown</Text>
            <Text style={styles.switchSub}>Minimum gap before the next alert can appear</Text>
          </View>
          <View style={styles.stepperValue}>
            <Text style={styles.stepperValueText}>{alertCooldownSeconds / 60} min</Text>
          </View>
        </TouchableOpacity>
      </Card>

      {/* Backend Microservice Status */}
      <Card>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Activity size={14} color={colors.primary} />
            <Text style={styles.title}>BACKEND MICROSERVICES STATUS</Text>
          </View>
          <View style={styles.refreshRow}>
            {secondsAgo !== null && (
              <View style={styles.timestampRow}>
                <Clock size={11} color={colors.text.muted} />
                <Text style={styles.timestampText}>
                  {secondsAgo < 5 ? 'Just now' : `${secondsAgo}s ago`}
                </Text>
              </View>
            )}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={doRefresh}
              disabled={isLoadingHealth}
              style={[styles.refreshBtn, isLoadingHealth && styles.refreshBtnDisabled]}
              hitSlop={spacing.hitSlop}
              accessibilityRole="button"
              accessibilityLabel="Refresh backend service status"
              accessibilityState={{ disabled: isLoadingHealth, busy: isLoadingHealth }}
            >
              <RefreshCw
                size={14}
                color={isLoadingHealth ? colors.primary : colors.text.secondary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {healthError ? (
          <ErrorState
            title="Health check failed"
            message={healthError}
            onRetry={doRefresh}
          />
        ) : !services ? (
          <EmptyState
            title="No status reported"
            message="The server did not return a service list."
            actionLabel="Check again"
            onAction={doRefresh}
          />
        ) : (
          <View style={styles.serviceList}>
            {Object.entries(services).map(([key, val]) => {
              const value = String(val);
              const unhealthy = isUnhealthy(value);
              return (
                <Card variant="nested" key={key} style={styles.serviceItem}>
                  <Text style={styles.serviceName}>{key.replace(/_/g, ' ')}</Text>
                  <View style={styles.serviceValRow}>
                    {unhealthy ? (
                      <XCircle size={12} color={colors.danger} />
                    ) : (
                      <CheckCircle2 size={12} color={colors.primary} />
                    )}
                    <Text
                      style={[styles.serviceVal, unhealthy && styles.serviceValBad]}
                      numberOfLines={1}
                    >
                      {value}
                    </Text>
                  </View>
                </Card>
              );
            })}
          </View>
        )}

        {/* Surface cleartext transport rather than hiding it. */}
        {isInsecureTransport && (
          <View style={styles.warningRow}>
            <ShieldAlert size={12} color={colors.fastest} />
            <Text style={styles.warningText}>
              Connected over unencrypted HTTP ({API_BASE_URL}). Set
              EXPO_PUBLIC_API_BASE_URL to an HTTPS origin for release builds.
            </Text>
          </View>
        )}
      </Card>
    </View>
  );
};

export const SystemDiagnostics = React.memo(SystemDiagnosticsBase);

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
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
    letterSpacing: typography.tracking.normal,
    flexShrink: 1
  },
  modeGrid: {
    flexDirection: 'row',
    gap: spacing.md
  },
  modeButton: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.radius.md,
    padding: spacing.lg,
    minHeight: spacing.touchTargetMin,
    justifyContent: 'center'
  },
  modeButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryFaint
  },
  modeButtonTitle: {
    fontSize: typography.sizes.caption,
    lineHeight: typography.line.caption,
    fontWeight: typography.weights.bold,
    color: colors.text.body
  },
  modeButtonTitleSelected: {
    color: colors.primary
  },
  modeButtonSub: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    color: colors.text.muted,
    marginTop: 2
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    minHeight: spacing.touchTargetMin
  },
  switchRowBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
    marginTop: spacing.sm
  },
  switchTextCol: {
    flex: 1,
    paddingRight: spacing.lg
  },
  switchTitle: {
    fontSize: typography.sizes.caption,
    lineHeight: typography.line.caption,
    fontWeight: typography.weights.bold,
    color: colors.text.body
  },
  switchSub: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    color: colors.text.muted,
    marginTop: 1
  },
  stepperValue: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.radius.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm
  },
  stepperValueText: {
    fontSize: typography.sizes.caption,
    lineHeight: typography.line.caption,
    fontWeight: typography.weights.extrabold,
    color: colors.primary
  },
  refreshRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm
  },
  timestampRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3
  },
  timestampText: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    color: colors.text.muted
  },
  refreshBtn: {
    width: 32,
    height: 32,
    borderRadius: spacing.radius.sm,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center'
  },
  refreshBtnDisabled: {
    opacity: 0.5
  },
  serviceList: {
    gap: spacing.sm
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md
  },
  serviceName: {
    fontSize: typography.sizes.caption,
    lineHeight: typography.line.caption,
    color: colors.text.secondary,
    textTransform: 'capitalize',
    flexShrink: 1
  },
  serviceValRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexShrink: 1
  },
  serviceVal: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    flexShrink: 1
  },
  serviceValBad: {
    color: colors.danger
  },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  warningText: {
    flex: 1,
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    color: colors.fastest
  }
});
