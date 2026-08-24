import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('expo-constants', () => ({
  default: {
    expoConfig: { extra: {} }
  }
}));

vi.mock('@react-native-async-storage/async-storage', () => {
  const store = new Map<string, string>();
  return {
    default: {
      getItem: vi.fn(async (key: string) => store.get(key) ?? null),
      setItem: vi.fn(async (key: string, value: string) => {
        store.set(key, value);
      }),
      removeItem: vi.fn(async (key: string) => {
        store.delete(key);
      }),
    }
  };
});

import { useSettingsStore } from './settingsStore';

describe('SettingsStore Onboarding & Tutorial state', () => {
  beforeEach(() => {
    useSettingsStore.setState({
      hasCompletedOnboarding: false,
      showOnboardingTutorial: false
    });
  });

  it('initializes with onboarding incomplete on fresh start', () => {
    const state = useSettingsStore.getState();
    expect(state.hasCompletedOnboarding).toBe(false);
  });

  it('completes onboarding and closes tutorial modal', () => {
    useSettingsStore.getState().completeOnboarding();
    const state = useSettingsStore.getState();
    expect(state.hasCompletedOnboarding).toBe(true);
    expect(state.showOnboardingTutorial).toBe(false);
  });

  it('allows replaying tutorial via setShowOnboardingTutorial', () => {
    useSettingsStore.getState().completeOnboarding();
    useSettingsStore.getState().setShowOnboardingTutorial(true);
    expect(useSettingsStore.getState().showOnboardingTutorial).toBe(true);
  });

  it('resets onboarding state on fresh start action', () => {
    useSettingsStore.getState().completeOnboarding();
    expect(useSettingsStore.getState().hasCompletedOnboarding).toBe(true);

    useSettingsStore.getState().resetOnboarding();
    expect(useSettingsStore.getState().hasCompletedOnboarding).toBe(false);
    expect(useSettingsStore.getState().showOnboardingTutorial).toBe(true);
  });
});
