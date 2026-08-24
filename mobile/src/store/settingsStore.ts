import { create } from 'zustand';
import { fetchHealth } from '../services/routingService';
import { toUserMessage } from '../services/api';

export type PreferenceProfile =
  | 'BALANCED'
  | 'MOST_RELIABLE'
  | 'LOWEST_TRAFFIC'
  | 'AVOID_TOLLS'
  | 'FASTEST';

interface SettingsState {
  preferenceProfile: PreferenceProfile;
  trafficMode: 'DEMO' | 'REAL';
  /** Minimum gap between surfaced alerts. Read by `navigationStore.stepSimulation`. */
  alertCooldownSeconds: number;
  /** Congestion increase (percentage points) required to call a route "worsening". */
  worseningThresholdPct: number;
  /** Master switch for proactive road alerts. */
  backgroundAlertsEnabled: boolean;
  /** Master switch for chimes/haptics. Combined with the in-drive mute toggle. */
  soundEnabled: boolean;
  systemHealth: any | null;
  isLoadingHealth: boolean;
  /** Non-null when the health check failed. */
  healthError: string | null;

  setPreferenceProfile: (profile: PreferenceProfile) => void;
  setTrafficMode: (mode: 'DEMO' | 'REAL') => void;
  setAlertCooldownSeconds: (seconds: number) => void;
  setWorseningThresholdPct: (pct: number) => void;
  toggleBackgroundAlerts: () => void;
  toggleSound: () => void;
  refreshHealth: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  preferenceProfile: 'BALANCED',
  trafficMode: 'DEMO',
  alertCooldownSeconds: 300,
  worseningThresholdPct: 10,
  backgroundAlertsEnabled: true,
  soundEnabled: true,
  systemHealth: null,
  isLoadingHealth: false,
  healthError: null,

  setPreferenceProfile: (preferenceProfile) => set({ preferenceProfile }),
  setTrafficMode: (trafficMode) => set({ trafficMode }),
  setAlertCooldownSeconds: (alertCooldownSeconds) => set({ alertCooldownSeconds }),
  setWorseningThresholdPct: (worseningThresholdPct) => set({ worseningThresholdPct }),
  toggleBackgroundAlerts: () =>
    set((state) => ({ backgroundAlertsEnabled: !state.backgroundAlertsEnabled })),
  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),

  refreshHealth: async () => {
    set({ isLoadingHealth: true, healthError: null });
    try {
      const health = await fetchHealth();
      set({ systemHealth: health, isLoadingHealth: false, healthError: null });
    } catch (err) {
      // Clear stale health so the UI cannot claim services are online.
      set({ isLoadingHealth: false, healthError: toUserMessage(err), systemHealth: null });
    }
  }
}));
