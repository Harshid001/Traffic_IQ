import { describe, it, expect, vi } from 'vitest';

vi.mock('expo-constants', () => ({
  default: {
    expoConfig: {
      extra: { apiBaseUrl: 'http://localhost:8005' }
    }
  }
}));

vi.mock('react-native', () => ({
  Platform: {
    OS: 'web'
  },
  Vibration: {
    vibrate: vi.fn()
  }
}));

import { calculateRoutes, fetchHealth } from './routingService';
import { fetchTrafficDNA, fetchWhatIfDeparture } from './trafficService';
import { startNavigationSession, updateNavigationStep } from './navigationService';
import {
  getSimulatedRoutes,
  getSimulatedTrafficDNA,
  getSimulatedWhatIf,
  SIMULATED_CORRIDORS
} from './demoFallbackEngine';

describe('Tier 3 Demo Simulation Fallback Engine', () => {
  it('provides high-fidelity fallback data for all predefined corridors', () => {
    const corridors = [
      'ahmedabad_gandhinagar',
      'bangalore_tech_corridor',
      'delhi_cyber_corridor',
      'sf_airport_corridor'
    ];

    corridors.forEach((corridor) => {
      const res = getSimulatedRoutes({ corridor_preset: corridor });
      expect(res.routes.length).toBeGreaterThanOrEqual(2);
      expect(res.routing_provenance).toBe('DEMO');
      expect(res.traffic_provenance).toBe('DEMO');
      expect(res.best_route_id).toBeTruthy();
      expect(res.fastest_route_id).toBeTruthy();
      expect(res.explanation).toBeDefined();
      expect(res.explanation.validation_status).toBe('VALIDATED');

      const best = res.routes.find((r) => r.is_best);
      expect(best).toBeDefined();
      expect(best?.segments.length).toBeGreaterThan(0);
      expect(best?.coordinates.length).toBeGreaterThan(1);
    });
  });

  it('adjusts route scoring dynamically for preference profiles', () => {
    const avoidTolls = getSimulatedRoutes({
      corridor_preset: 'ahmedabad_gandhinagar',
      preference_profile: 'AVOID_TOLLS'
    });
    const bestAvoidTolls = avoidTolls.routes.find((r) => r.is_best);
    expect(bestAvoidTolls?.toll_cost).toBe(0);

    const fastest = getSimulatedRoutes({
      corridor_preset: 'ahmedabad_gandhinagar',
      preference_profile: 'FASTEST'
    });
    const bestFastest = fastest.routes.find((r) => r.is_best);
    expect(bestFastest?.is_fastest).toBe(true);
  });

  it('generates 24-hour Traffic DNA curve with valid morning/evening peaks', () => {
    const dnaRes = getSimulatedTrafficDNA('SEG_TEST_1');
    expect(dnaRes.segment_id).toBe('SEG_TEST_1');
    expect(dnaRes.dna.length).toBe(24);

    const morningPeak = dnaRes.dna[9]; // 9 AM
    const nightLow = dnaRes.dna[2]; // 2 AM
    expect(morningPeak.mean_congestion).toBeGreaterThan(nightLow.mean_congestion);
  });

  it('generates What-If departure scenarios with optimal window recommendation', () => {
    const routes = SIMULATED_CORRIDORS.ahmedabad_gandhinagar.routes;
    const whatIf = getSimulatedWhatIf(routes);
    expect(whatIf.departure_evaluations.length).toBe(4);
    expect(whatIf.optimal_departure_window).toBeDefined();
    expect(whatIf.recommendation).toContain('Best Departure');
  });
});

describe('Resilient Services Layer (Offline & Network Drop Handling)', () => {
  it('calculateRoutes falls back seamlessly to Tier 3 when network fails', async () => {
    // Force network failure for hermetic offline test
    const origFetch = global.fetch;
    global.fetch = vi.fn().mockRejectedValue(new Error('Network offline'));
    try {
      const res = await calculateRoutes({ corridor_preset: 'bangalore_tech_corridor' });
      expect(res).toBeDefined();
      expect(res.routes.length).toBeGreaterThan(0);
      expect(res.is_fallback).toBe(true);
      expect(res.routing_provenance).toBe('DEMO');
    } finally {
      global.fetch = origFetch;
    }
  });

  it('fetchHealth falls back to diagnostic simulation status', async () => {
    const origFetch = global.fetch;
    global.fetch = vi.fn().mockRejectedValue(new Error('Network offline'));
    try {
      const health = await fetchHealth();
      expect(health).toBeDefined();
      expect(health.status).toBe('DEMO_SIMULATION');
    } finally {
      global.fetch = origFetch;
    }
  });

  it('fetchTrafficDNA falls back to simulated DNA', async () => {
    const res = await fetchTrafficDNA('SEG_SG_HIGHWAY');
    expect(res.dna.length).toBe(24);
  });

  it('navigation session and step simulation fall back to client simulation', async () => {
    const route = SIMULATED_CORRIDORS.ahmedabad_gandhinagar.routes[0];
    const session = await startNavigationSession(route, [route], route.id, route.id);
    expect(session.status).toBe('NAVIGATING');
    expect(session.maneuvers.length).toBeGreaterThan(0);

    const step = await updateNavigationStep(0.3, route, [route], route.id);
    expect(step.remaining_distance_km).toBeLessThanOrEqual(route.distance_km);
    expect(step.heading_deg).toBeGreaterThanOrEqual(0);
  });
});
