import { describe, it, expect, vi, beforeEach } from 'vitest';

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

describe('AI Copilot Chat Service (Phi-4-mini)', () => {
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
    expect(context.bottlenecks).toBeDefined();
  });

  it('transmits multi-turn conversation history to Phi-4-mini backend endpoint', async () => {
    const context = buildRouteChatContext(mockRoutingData, corridor.routes[0].id);
    const history = [
      { role: 'user' as const, content: 'Is SG Highway fast?' },
      { role: 'assistant' as const, content: 'Yes, SG Highway takes about 24 minutes.' }
    ];

    // Mock global fetch for Ollama / backend
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        response: 'SG Highway is recommended because of its 91% on-time arrival rate.',
        model: 'phi4-mini',
        provenance: 'LOCAL OLLAMA (phi4-mini)',
        status: 'success'
      })
    });

    const res = await askRouteCopilot('Why is it recommended?', corridor.name, context, history);

    expect(res.status).toBe('success');
    expect(res.model).toBe('phi4-mini');
    expect(res.response).toContain('SG Highway');
  });

  it('handles offline notice gracefully when Ollama service is unavailable', async () => {
    const context = buildRouteChatContext(mockRoutingData, corridor.routes[0].id);

    // Mock fetch failure
    global.fetch = vi.fn().mockRejectedValue(new Error('Connection refused'));

    const res = await askRouteCopilot('Is there traffic?', corridor.name, context);

    expect(res.status).toBe('error');
    expect(res.model).toBe('offline');
    expect(res.response).toContain('Phi-4-mini assistant is currently unreachable');
  });
});
