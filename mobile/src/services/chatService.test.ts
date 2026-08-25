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

import {
  askRouteCopilot,
  buildRouteChatContext,
  queryDirectGeminiApi,
  testAiConnection,
  generateAutonomousCopilotResponse
} from './chatService';
import { SIMULATED_CORRIDORS } from './demoFallbackEngine';

describe('AI Copilot Chat Service (Direct Cloud Gemini & Zero-Server Setup)', () => {
  const corridor = SIMULATED_CORRIDORS.ahmedabad_gandhinagar;
  const mockRoutingData: any = {
    corridor_name: corridor.name,
    routes: corridor.routes,
    best_route_id: corridor.routes[0].id,
    fastest_route_id: corridor.routes[1]?.id || corridor.routes[0].id
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('builds rich route context accurately from corridor telemetry', () => {
    const context = buildRouteChatContext(mockRoutingData, corridor.routes[0].id);
    expect(context.corridor_name).toContain('Ahmedabad');
    expect(context.best_route).toBeDefined();
    expect(context.best_route?.distance_km).toBe(18.2);
    expect(context.reliability_score).toBe(0.91);
    expect(context.bottlenecks).toBeDefined();
  });

  it('queries Google Gemini Cloud API directly with telemetry and multi-turn history', async () => {
    const context = buildRouteChatContext(mockRoutingData, corridor.routes[0].id);
    const history = [
      { role: 'user' as const, content: 'Which route has fewer bottlenecks?' },
      { role: 'assistant' as const, content: 'SG Highway has clear flow right now.' }
    ];

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: 'SG Highway is recommended with 91% reliability and 28 min ETA.'
                }
              ]
            }
          }
        ]
      })
    });

    const res = await queryDirectGeminiApi(
      'Why is SG Highway better?',
      corridor.name,
      context,
      history,
      undefined,
      'test-gemini-key',
      'gemini-2.0-flash'
    );

    expect(res).not.toBeNull();
    expect(res?.status).toBe('success');
    expect(res?.model).toBe('gemini-2.0-flash');
    expect(res?.provenance).toContain('GOOGLE GEMINI');
    expect(res?.response).toContain('SG Highway');
  });

  it('measures connection latency and verifies key via testAiConnection', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [{ text: 'Online and ready.' }]
            }
          }
        ]
      })
    });

    const testRes = await testAiConnection('valid-test-key', 'gemini-2.0-flash');
    expect(testRes.success).toBe(true);
    expect(testRes.latencyMs).toBeGreaterThanOrEqual(0);
    expect(testRes.message).toContain('Connected successfully to Google Gemini');
  });

  it('gracefully handles missing API key in testAiConnection', async () => {
    const testRes = await testAiConnection('', 'gemini-2.0-flash');
    expect(testRes.success).toBe(false);
    expect(testRes.message).toContain('No Google Gemini API Key provided');
  });

  it('permanently provides live telemetry answers when no server or API key is set', async () => {
    const context = buildRouteChatContext(mockRoutingData, corridor.routes[0].id);

    // Mock fetch failure (server/ollama offline and no cloud key)
    global.fetch = vi.fn().mockRejectedValue(new Error('Connection refused'));

    const res = await askRouteCopilot('Why is this route recommended?', corridor.name, context);

    expect(res.status).toBe('success');
    expect(res.response).toContain(corridor.routes[0].name);
    expect(res.response).toContain('recommended');
  });
});
