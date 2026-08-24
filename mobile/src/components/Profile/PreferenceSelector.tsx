import React, { useState, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, ActivityIndicator } from 'react-native';
import {
  Sliders,
  ShieldCheck,
  Zap,
  TrendingDown,
  Coins,
  Check,
  Car,
  Bike
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

const VEHICLES = [
  { id: 'car', label: 'Car / Sedan', icon: Car },
  { id: 'ev', label: 'Electric Vehicle (EV)', icon: Zap },
  { id: 'bike', label: 'Two-Wheeler / Bike', icon: Bike }
];

const PROFILES: ProfileOption[] = [
  {
    id: 'BALANCED',
    label: 'Smart Balanced (Recommended)',
    desc: 'Optimizes travel time, arrival reliability, and smooth traffic flow simultaneously.',
    icon: ShieldCheck
  },
  {
    id: 'FASTEST',
    label: 'Fastest Travel Time',
    desc: 'Prioritizes the lowest total duration regardless of congestion or tolls.',
    icon: Zap
  },
  {
    id: 'LOWEST_TRAFFIC',
    label: 'Smooth Traffic & Low Congestion',
    desc: 'Avoids stop-and-go junctions, bottlenecks, and dense city roads.',
    icon: TrendingDown
  },
  {
    id: 'AVOID_TOLLS',
    label: 'Avoid Highway Tolls',
    desc: 'Chooses free alternate avenues and bypasses toll booths.',
    icon: Coins
  }
];

type ToastKind = 'success' | 'error';

const PreferenceSelectorBase: React.FC = () => {
  const preferenceProfile = useSettingsStore(s => s.preferenceProfile);
  const setPreferenceProfile = useSettingsStore(s => s.setPreferenceProfile);
  const fetchRoutes = useNavigationStore(s => s.fetchRoutes);
  const selectedCorridor = useNavigationStore(s => s.selectedCorridor);
  const routesError = useNavigationStore(s => s.routesError);

  const [selectedVehicle, setSelectedVehicle] = useState('car');
  const [toast, setToast] = useState<{ kind: ToastKind; label: string } | null>(null);
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
        if (useNavigationStore.getState().routesError) {
          setPreferenceProfile(previous);
          showToast('error', `Failed to apply "${selected?.label ?? id}" profile.`);
        } else {
          showToast('success', `Applied "${selected?.label ?? id}" routing profile.`);
        }
      } catch {
        setPreferenceProfile(previous);
        showToast('error', `Failed to apply "${selected?.label ?? id}" profile.`);
      } finally {
        setPendingProfile(null);
      }
    },
    [preferenceProfile, pendingProfile, setPreferenceProfile, fetchRoutes, selectedCorridor, showToast]
  );

  return (
    <View style={styles.container}>
      {/* Vehicle Type Selector */}
      <Card style={styles.vehicleCard}>
        <Text style={styles.sectionTitle}>VEHICLE TYPE</Text>
        <View style={styles.vehicleRow}>
          {VEHICLES.map(v => {
            const isSelected = selectedVehicle === v.id;
            const Icon = v.icon;
            return (
              <TouchableOpacity
                key={v.id}
                activeOpacity={0.75}
                onPress={() => setSelectedVehicle(v.id)}
                style={[styles.vehicleBtn, isSelected && styles.vehicleBtnSelected]}
              >
                <Icon size={18} color={isSelected ? colors.primaryBright : colors.text.muted} />
                <Text style={[styles.vehicleBtnText, isSelected && styles.vehicleBtnTextSelected]}>
                  {v.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Card>

      {/* Routing Profile Options */}
      <Card style={styles.profileCard}>
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Sliders size={14} color={colors.primary} />
          </View>
          <View>
            <Text style={styles.title}>ROUTING OBJECTIVE</Text>
            <Text style={styles.subTitle}>How the engine ranks candidate routes</Text>
          </View>
        </View>

        <View style={styles.profileList}>
          {PROFILES.map(profile => {
            const isSelected = preferenceProfile === profile.id;
            const isPending = pendingProfile === profile.id;
            const Icon = profile.icon;

            return (
              <TouchableOpacity
                key={profile.id}
                activeOpacity={0.75}
                onPress={() => handleSelect(profile.id)}
                disabled={pendingProfile !== null}
                style={[
                  styles.profileItem,
                  isSelected && styles.profileItemSelected,
                  isPending && styles.profileItemPending
                ]}
                accessibilityRole="radio"
                accessibilityState={{ checked: isSelected, busy: isPending }}
              >
                <View style={styles.profileLeft}>
                  <View style={[styles.profileIcon, isSelected && styles.profileIconSelected]}>
                    <Icon size={16} color={isSelected ? colors.primary : colors.text.secondary} />
                  </View>
                  <View style={styles.profileTextCol}>
                    <Text style={[styles.profileLabel, isSelected && styles.profileLabelSelected]}>
                      {profile.label}
                    </Text>
                    <Text style={styles.profileDesc}>{profile.desc}</Text>
                  </View>
                </View>

                {isPending ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : isSelected ? (
                  <View style={styles.checkPill}>
                    <Check size={12} color={colors.text.onAccent} strokeWidth={3} />
                  </View>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>
      </Card>

      {/* Toast Feedback */}
      {toast && (
        <Animated.View
          style={[
            styles.toast,
            toast.kind === 'error' ? styles.toastError : styles.toastSuccess,
            { opacity: toastOpacity }
          ]}
        >
          <Text style={styles.toastText}>{toast.label}</Text>
        </Animated.View>
      )}
    </View>
  );
};

export const PreferenceSelector = React.memo(PreferenceSelectorBase);

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
    marginBottom: spacing.lg
  },
  vehicleCard: {
    padding: spacing.cardPadding,
    borderRadius: spacing.radius.xl
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: typography.weights.extrabold,
    color: colors.text.muted,
    letterSpacing: 0.5,
    marginBottom: spacing.sm
  },
  vehicleRow: {
    flexDirection: 'row',
    gap: spacing.xs
  },
  vehicleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    borderRadius: spacing.radius.lg,
    paddingVertical: 10,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border
  },
  vehicleBtnSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryFaint
  },
  vehicleBtnText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.text.muted
  },
  vehicleBtnTextSelected: {
    color: colors.primaryBright
  },
  profileCard: {
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
  profileList: {
    gap: spacing.xs
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: spacing.radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border
  },
  profileItemSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryFaint
  },
  profileItemPending: {
    opacity: 0.6
  },
  profileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1
  },
  profileIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border
  },
  profileIconSelected: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primaryBorder
  },
  profileTextCol: {
    flex: 1
  },
  profileLabel: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
    color: colors.text.primary
  },
  profileLabelSelected: {
    color: colors.primaryBright
  },
  profileDesc: {
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 2
  },
  checkPill: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  toast: {
    position: 'absolute',
    bottom: -10,
    left: spacing.cardPadding,
    right: spacing.cardPadding,
    borderRadius: spacing.radius.lg,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    zIndex: 100
  },
  toastSuccess: {
    backgroundColor: colors.primaryDark
  },
  toastError: {
    backgroundColor: colors.danger
  },
  toastText: {
    fontSize: typography.sizes.caption,
    fontWeight: typography.weights.bold,
    color: '#FFF'
  }
});
