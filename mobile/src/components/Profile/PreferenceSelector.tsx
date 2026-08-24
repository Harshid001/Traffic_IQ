import React, { useState, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, ActivityIndicator } from 'react-native';
import {
  Sliders,
  ShieldCheck,
  Zap,
  TrendingDown,
  DollarSign,
  Check,
  RefreshCw,
  AlertTriangle
} from 'lucide-react-native';
import { useSettingsStore, PreferenceProfile } from '../../store/settingsStore';
import { useNavigationStore } from '../../store/navigationStore';
import { Card } from '../Common/Card';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface ProfileOption {
  id: PreferenceProfile;
  label: string;
  desc: string;
  icon: any;
}

const PROFILES: ProfileOption[] = [
  {
    id: 'BALANCED',
    label: 'Balanced (Smart Multi-Objective)',
    desc: 'Optimizes travel time, reliability, and congestion risk simultaneously.',
    icon: ShieldCheck
  },
  {
    id: 'MOST_RELIABLE',
    label: 'Most Reliable Route',
    desc: 'Prioritizes routes with lowest variance and buffer delay index.',
    icon: ShieldCheck
  },
  {
    id: 'LOWEST_TRAFFIC',
    label: 'Lowest Congestion Flow',
    desc: 'Avoids heavy bottlenecks and dense arterial intersections.',
    icon: TrendingDown
  },
  {
    id: 'AVOID_TOLLS',
    label: 'Avoid Toll Highways',
    desc: 'Penalizes toll plazas and expressway surcharge links.',
    icon: DollarSign
  },
  {
    id: 'FASTEST',
    label: 'Pure Raw Fastest Speed',
    desc: 'Minimizes expected duration regardless of congestion or tolls.',
    icon: Zap
  }
];

type ToastKind = 'success' | 'error';

const PreferenceSelectorBase: React.FC = () => {
  const preferenceProfile = useSettingsStore(s => s.preferenceProfile);
  const setPreferenceProfile = useSettingsStore(s => s.setPreferenceProfile);
  const fetchRoutes = useNavigationStore(s => s.fetchRoutes);
  const selectedCorridor = useNavigationStore(s => s.selectedCorridor);
  const routesError = useNavigationStore(s => s.routesError);

  const [toast, setToast] = useState<{ kind: ToastKind; label: string } | null>(null);
  /** The profile currently being applied, so its row can show a spinner. */
  const [pendingProfile, setPendingProfile] = useState<PreferenceProfile | null>(null);
  const toastOpacity = useRef(new Animated.Value(0)).current;

  const showToast = useCallback(
    (kind: ToastKind, label: string) => {
      setToast({ kind, label });
      toastOpacity.setValue(0);
      Animated.sequence([
        Animated.timing(toastOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.delay(2200),
        Animated.timing(toastOpacity, { toValue: 0, duration: 300, useNativeDriver: true })
      ]).start(() => setToast(null));
    },
    [toastOpacity]
  );

  const handleSelect = useCallback(
    async (id: PreferenceProfile) => {
      if (id === preferenceProfile || pendingProfile !== null) return;

      const previous = preferenceProfile;
      const selected = PROFILES.find(p => p.id === id);

      setPreferenceProfile(id);
      setPendingProfile(id);
      try {
        await fetchRoutes(selectedCorridor, id);
        // `fetchRoutes` records failures in the store rather than throwing.
        if (useNavigationStore.getState().routesError) {
          setPreferenceProfile(previous);
          showToast('error', 'Route recalculation failed. Preference reverted.');
        } else {
          showToast('success', `Routes recalculated: ${selected?.label ?? id}`);
        }
      } finally {
        setPendingProfile(null);
      }
    },
    [preferenceProfile, pendingProfile, setPreferenceProfile, fetchRoutes, selectedCorridor, showToast]
  );

  const isBusy = pendingProfile !== null;

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Sliders size={14} color={colors.primary} />
          <Text style={styles.title}>ROUTING OBJECTIVE PROFILE</Text>
        </View>
        {/* `isRefetching` used to be tracked and never rendered. */}
        {isBusy ? (
          <View style={styles.busyRow}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.busyText}>Recalculating</Text>
          </View>
        ) : (
          <Text style={styles.subText}>Scoring Weights</Text>
        )}
      </View>

      <View style={styles.profileList}>
        {PROFILES.map((p) => {
          const isSelected = preferenceProfile === p.id;
          const isPending = pendingProfile === p.id;
          const Icon = p.icon;

          return (
            <TouchableOpacity
              key={p.id}
              activeOpacity={0.7}
              onPress={() => handleSelect(p.id)}
              disabled={isBusy}
              style={[
                styles.profileItem,
                isSelected && styles.profileItemSelected,
                isBusy && !isPending && styles.profileItemDimmed
              ]}
              accessibilityRole="radio"
              accessibilityState={{ checked: isSelected, disabled: isBusy, busy: isPending }}
              accessibilityLabel={`${p.label}. ${p.desc}`}
            >
              <View style={styles.profileItemLeft}>
                <View style={[styles.iconBox, isSelected && styles.iconBoxSelected]}>
                  <Icon size={14} color={isSelected ? colors.primary : colors.text.secondary} />
                </View>
                <View style={styles.profileTextCol}>
                  <Text style={[styles.profileTitle, isSelected && styles.profileTitleSelected]}>
                    {p.label}
                  </Text>
                  <Text style={styles.profileDesc}>{p.desc}</Text>
                </View>
              </View>

              {isPending ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : isSelected ? (
                <Check size={16} color={colors.primary} />
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Toast notification */}
      {toast && (
        <Animated.View
          style={[
            styles.toast,
            toast.kind === 'error' && styles.toastError,
            { opacity: toastOpacity }
          ]}
          accessibilityLiveRegion="polite"
        >
          {toast.kind === 'error' ? (
            <AlertTriangle size={12} color={colors.danger} />
          ) : (
            <RefreshCw size={12} color={colors.primary} />
          )}
          <Text style={[styles.toastText, toast.kind === 'error' && styles.toastTextError]}>
            {toast.label}
          </Text>
        </Animated.View>
      )}
    </Card>
  );
};

export const PreferenceSelector = React.memo(PreferenceSelectorBase);

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
  busyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm
  },
  busyText: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    fontWeight: typography.weights.bold,
    color: colors.primary
  },
  profileList: {
    gap: spacing.sm
  },
  profileItem: {
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
  profileItemSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryFaint
  },
  profileItemDimmed: {
    opacity: 0.5
  },
  profileItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: spacing.radius.sm,
    backgroundColor: colors.neutral,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md
  },
  iconBoxSelected: {
    backgroundColor: colors.primarySoft
  },
  profileTextCol: {
    flex: 1
  },
  profileTitle: {
    fontSize: typography.sizes.caption,
    lineHeight: typography.line.caption,
    fontWeight: typography.weights.bold,
    color: colors.text.body
  },
  profileTitleSelected: {
    color: colors.primary
  },
  profileDesc: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    color: colors.text.muted,
    marginTop: 1
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    backgroundColor: colors.primaryFaint,
    borderWidth: 1,
    borderColor: colors.primaryBorderSoft,
    borderRadius: spacing.radius.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md
  },
  toastError: {
    backgroundColor: colors.dangerSoft,
    borderColor: colors.dangerBorder
  },
  toastText: {
    flex: 1,
    fontSize: typography.sizes.caption,
    lineHeight: typography.line.caption,
    fontWeight: typography.weights.semibold,
    color: colors.primary
  },
  toastTextError: {
    color: colors.dangerBright
  }
});
