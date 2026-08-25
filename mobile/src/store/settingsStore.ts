import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { fetchHealth } from '../services/routingService';
import { toUserMessage } from '../services/api';
import { universalStorage } from './storage';

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
  hasCompletedOnboarding: boolean;
  showOnboardingTutorial: boolean;
  systemHealth: any | null;
  isLoadingHealth: boolean;
  /** Non-null when the health check failed. */
  healthError: string | null;

  /** Direct Cloud Gemini API Key for zero-server mobile AI operation */
  geminiApiKey: string;
  /** Active Cloud AI model name */
  aiModel: string;
  /** Selected AI Provider */
  aiProvider: 'auto' | 'gemini' | 'ollama';

  setPreferenceProfile: (profile: PreferenceProfile) => void;
  setTrafficMode: (mode: 'DEMO' | 'REAL') => void;
  setAlertCooldownSeconds: (seconds: number) => void;
  setWorseningThresholdPct: (pct: number) => void;
  setGeminiApiKey: (key: string) => void;
  setAiModel: (model: string) => void;
  setAiProvider: (provider: 'auto' | 'gemini' | 'ollama') => void;
  toggleBackgroundAlerts: () => void;
  toggleSound: () => void;
  refreshHealth: () => Promise<void>;
  completeOnboarding: () => void;
  setShowOnboardingTutorial: (show: boolean) => void;
  resetOnboarding: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      preferenceProfile: 'BALANCED',
      trafficMode: 'DEMO',
      alertCooldownSeconds: 300,
      worseningThresholdPct: 10,
      backgroundAlertsEnabled: true,
      soundEnabled: true,
      hasCompletedOnboarding: false,
      showOnboardingTutorial: false,
      systemHealth: null,
      isLoadingHealth: false,
      healthError: null,
      geminiApiKey: '',
      aiModel: 'gemini-2.0-flash',
      aiProvider: 'auto',

      setPreferenceProfile: (preferenceProfile) => set({ preferenceProfile }),
      setTrafficMode: (trafficMode) => set({ trafficMode }),
      setAlertCooldownSeconds: (alertCooldownSeconds) => set({ alertCooldownSeconds }),
      setWorseningThresholdPct: (worseningThresholdPct) => set({ worseningThresholdPct }),
      setGeminiApiKey: (geminiApiKey) => set({ geminiApiKey: geminiApiKey.trim() }),
      setAiModel: (aiModel) => set({ aiModel }),
      setAiProvider: (aiProvider) => set({ aiProvider }),
      toggleBackgroundAlerts: () =>
        set((state) => ({ backgroundAlertsEnabled: !state.backgroundAlertsEnabled })),
      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),

      completeOnboarding: () => set({ hasCompletedOnboarding: true, showOnboardingTutorial: false }),
      setShowOnboardingTutorial: (showOnboardingTutorial) => set({ showOnboardingTutorial }),
      resetOnboarding: () => set({ hasCompletedOnboarding: false, showOnboardingTutorial: true }),

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
    }),
    {
      name: 'trafficiq-settings',
      storage: createJSONStorage(() => universalStorage),
      partialize: (state) => ({
        preferenceProfile: state.preferenceProfile,
        trafficMode: state.trafficMode,
        alertCooldownSeconds: state.alertCooldownSeconds,
        worseningThresholdPct: state.worseningThresholdPct,
        backgroundAlertsEnabled: state.backgroundAlertsEnabled,
        soundEnabled: state.soundEnabled,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        geminiApiKey: state.geminiApiKey,
        aiModel: state.aiModel,
        aiProvider: state.aiProvider,
      }),
    }
  )
);
