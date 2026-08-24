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

import { askRouteCopilot, buildRouteChatContext } from './chatService';
import { SIMULATED_CORRIDORS } from './demoFallbackEngine';

describe('AI Copilot Chat Service', () => {
  const corridor = SIMULATED_CORRIDORS.ahmedabad_gandhinagar;
  const mockRoutingData: any = {
    corridor_name: corridor.name,
    routes: corridor.routes,
    best_route_id: corridor.routes[0].id,
    fastest_route_id: corridor.routes[1]?.id || corridor.routes[0].id
  };

  it('builds rich route context accurately from corridor telemetry', () => {
    const context = buildRouteChatContext(mockRoutingData, corridor.routes[0].id);
    expect(context.corridor_name).toContain('Ahmedabad');
    expect(context.best_route).toBeDefined();
    expect(context.best_route?.distance_km).toBe(18.2);
    expect(context.reliability_score).toBe(0.91);
  });

  it('answers "why" recommendation queries with grounded facts', async () => {
    const context = buildRouteChatContext(mockRoutingData, corridor.routes[0].id);
    const res = await askRouteCopilot('Why is this route recommended?', corridor.name, context);

    expect(res.status).toBe('success');
    expect(res.response).toContain('SG Highway');
    expect(res.response).toMatch(/reliability|on-time/i);
    expect(res.model).toBe('phi4-mini');
  });

  it('answers toll and cost queries with exact toll figures', async () => {
    const context = buildRouteChatContext(mockRoutingData, corridor.routes[0].id);
    const res = await askRouteCopilot('Are there any tolls on this route?', corridor.name, context);

    expect(res.status).toBe('success');
    expect(res.response).toMatch(/toll|₹/i);
  });

  it('answers departure and forecast timing queries', async () => {
    const context = buildRouteChatContext(mockRoutingData, corridor.routes[0].id);
    const res = await askRouteCopilot('When should I leave to avoid traffic?', corridor.name, context);

    expect(res.status).toBe('success');
    expect(res.response).toMatch(/congestion|departure|peak|rush/i);
  });

  it('answers bottleneck and hazard queries with segment details', async () => {
    const context = buildRouteChatContext(mockRoutingData, corridor.routes[0].id);
    const res = await askRouteCopilot('Are there any bottlenecks or hazards ahead?', corridor.name, context);

    expect(res.status).toBe('success');
    expect(res.response).toMatch(/traffic|congestion|flow|speed/i);
  });
});
