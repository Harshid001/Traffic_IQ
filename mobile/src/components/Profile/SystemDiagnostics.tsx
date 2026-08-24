import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { Activity, RefreshCw, CheckCircle2, XCircle, Radio, Bell, Volume2, ShieldAlert, Sparkles, Server } from 'lucide-react-native';
import { useSettingsStore } from '../../store/settingsStore';
import { useNavigationStore } from '../../store/navigationStore';
import { Card } from '../Common/Card';
import { Badge } from '../Common/Badge';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

const HEALTH_REFRESH_MS = 30000;

const SystemDiagnosticsBase: React.FC = () => {
  const systemHealth = useSettingsStore(s => s.systemHealth);
  const refreshHealth = useSettingsStore(s => s.refreshHealth);
  const isLoadingHealth = useSettingsStore(s => s.isLoadingHealth);
  const trafficMode = useSettingsStore(s => s.trafficMode);
  const setTrafficMode = useSettingsStore(s => s.setTrafficMode);
  const backgroundAlertsEnabled = useSettingsStore(s => s.backgroundAlertsEnabled);
  const toggleBackgroundAlerts = useSettingsStore(s => s.toggleBackgroundAlerts);
  const soundEnabled = useSettingsStore(s => s.soundEnabled);
  const toggleSound = useSettingsStore(s => s.toggleSound);

  const fetchRoutes = useNavigationStore(s => s.fetchRoutes);
  const selectedCorridor = useNavigationStore(s => s.selectedCorridor);

  const [lastCheckedAt, setLastCheckedAt] = useState<number | null>(null);

  const doRefresh = useCallback(async () => {
    await refreshHealth();
    setLastCheckedAt(Date.now());
  }, [refreshHealth]);

  const doRefreshRef = useRef(doRefresh);
  doRefreshRef.current = doRefresh;

  useEffect(() => {
    doRefreshRef.current();
    const interval = setInterval(() => doRefreshRef.current(), HEALTH_REFRESH_MS);
    return () => clearInterval(interval);
  }, []);

  const handleTrafficModeToggle = useCallback(
    (mode: 'DEMO' | 'REAL') => {
      if (mode === trafficMode) return;
      setTrafficMode(mode);
      fetchRoutes(selectedCorridor, undefined, mode);
    },
    [trafficMode, setTrafficMode, fetchRoutes, selectedCorridor]
  );

  const services: Record<string, string> | null = systemHealth?.services ?? null;

  return (
    <View style={styles.container}>
      {/* Audio & Alert Preferences */}
      <Card style={styles.card}>
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Bell size={14} color={colors.primary} />
          </View>
          <View>
            <Text style={styles.title}>DRIVER ALERTS & AUDIO</Text>
            <Text style={styles.subTitle}>Voice guidance, hazard alarms & background alerts</Text>
          </View>
        </View>

        <View style={styles.switchGroup}>
          <View style={styles.switchRow}>
            <View style={styles.switchTextCol}>
              <Text style={styles.switchTitle}>Voice Navigation Guidance</Text>
              <Text style={styles.switchSub}>Turn-by-turn spoken directions and street names</Text>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={toggleSound}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFF"
            />
          </View>

          <View style={styles.switchDivider} />

          <View style={styles.switchRow}>
            <View style={styles.switchTextCol}>
              <Text style={styles.switchTitle}>Proactive Delay & Reroute Alerts</Text>
              <Text style={styles.switchSub}>Notify when a faster alternate route saves 5+ mins</Text>
            </View>
            <Switch
              value={backgroundAlertsEnabled}
              onValueChange={toggleBackgroundAlerts}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFF"
            />
          </View>
        </View>
      </Card>

      {/* Traffic Data Stream Source */}
      <Card style={styles.card}>
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Radio size={14} color={colors.info} />
          </View>
          <View>
            <Text style={styles.title}>LIVE TRAFFIC SOURCE</Text>
            <Text style={styles.subTitle}>TomTom live highway telemetry vs offline simulation</Text>
          </View>
        </View>

        <View style={styles.modeGrid}>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => handleTrafficModeToggle('REAL')}
            style={[styles.modeCard, trafficMode === 'REAL' && styles.modeCardActive]}
          >
            <View style={styles.modeHeader}>
              <View style={[styles.modeDot, { backgroundColor: colors.primary }]} />
              <Text style={[styles.modeTitle, trafficMode === 'REAL' && styles.modeTitleActive]}>
                TomTom Live Stream
              </Text>
            </View>
            <Text style={styles.modeDesc}>Real-time GPS vehicle speed and live bottleneck reports</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => handleTrafficModeToggle('DEMO')}
            style={[styles.modeCard, trafficMode === 'DEMO' && styles.modeCardActive]}
          >
            <View style={styles.modeHeader}>
              <View style={[styles.modeDot, { backgroundColor: colors.fastest }]} />
              <Text style={[styles.modeTitle, trafficMode === 'DEMO' && styles.modeTitleActive]}>
                Simulated Demo Flow
              </Text>
            </View>
            <Text style={styles.modeDesc}>Curated congestion scenarios for testing and offline drives</Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* Engine Status Summary */}
      <Card style={styles.card}>
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Server size={14} color={colors.primary} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title}>NAVIGATION ENGINE HEALTH</Text>
            <Text style={styles.subTitle}>FastAPI microservices & ML models</Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={doRefresh}
            disabled={isLoadingHealth}
            style={styles.refreshBtn}
          >
            <RefreshCw size={12} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>

        {services && (
          <View style={styles.serviceGrid}>
            {Object.entries(services).map(([name, status]) => {
              const isOk = /ok|healthy|online|running|active/i.test(status);
              return (
                <View key={name} style={styles.serviceCell}>
                  <View style={[styles.serviceStatusDot, { backgroundColor: isOk ? colors.primary : colors.danger }]} />
                  <Text style={styles.serviceName}>{name.toUpperCase()}</Text>
                  <Text style={[styles.serviceStatus, { color: isOk ? colors.primary : colors.danger }]}>
                    {status}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </Card>
    </View>
  );
};

export const SystemDiagnostics = React.memo(SystemDiagnosticsBase);

const styles = StyleSheet.create({
  container: {
    gap: spacing.md
  },
  card: {
    padding: spacing.cardPadding,
    borderRadius: spacing.radius.xl
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerText: {
    flex: 1
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
  refreshBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border
  },
  switchGroup: {
    backgroundColor: colors.surface,
    borderRadius: spacing.radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md
  },
  switchTextCol: {
    flex: 1
  },
  switchTitle: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
    color: colors.text.primary
  },
  switchSub: {
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 2
  },
  switchDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md
  },
  modeGrid: {
    gap: spacing.xs
  },
  modeCard: {
    backgroundColor: colors.surface,
    borderRadius: spacing.radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border
  },
  modeCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryFaint
  },
  modeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 2
  },
  modeDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5
  },
  modeTitle: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
    color: colors.text.secondary
  },
  modeTitleActive: {
    color: colors.primaryBright
  },
  modeDesc: {
    fontSize: 11,
    color: colors.text.muted,
    marginTop: 2
  },
  serviceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs
  },
  serviceCell: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: spacing.radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: '48%',
    flex: 1,
    gap: 5
  },
  serviceStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3
  },
  serviceName: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.text.secondary,
    flex: 1
  },
  serviceStatus: {
    fontSize: 9,
    fontWeight: typography.weights.extrabold
  }
});
