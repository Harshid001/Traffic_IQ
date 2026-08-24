import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  calculateRoutes,
  explainRoute,
  getTrafficDna,
  simulateWhatIf,
  getEvaluationBenchmark,
  evaluateDrivingAlerts,
  getHealthStatus,
} from './api';

describe('Frontend API Service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('calculateRoutes should POST with X-API-Key and JSON body', async () => {
    const mockResponse = { fastest_route_id: 'route_1', best_route_id: 'route_1', routes: [] };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const params = { corridor_preset: 'bangalore_tech_corridor' };
    const result = await calculateRoutes(params);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toBe('/api/routes/calculate');
    expect(options.method).toBe('POST');
    expect(options.headers['Content-Type']).toBe('application/json');
    expect(options.headers['X-API-Key']).toBeDefined();
    expect(JSON.parse(options.body)).toEqual(params);
    expect(result).toEqual(mockResponse);
  });

  it('explainRoute should send verified_facts', async () => {
    const mockRes = { explanation: 'Test route explanation' };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockRes,
    });

    const facts = { fastest_route: { id: 'r1' }, best_route: { id: 'r1' } };
    const result = await explainRoute(facts);

    expect(global.fetch).toHaveBeenCalledWith('/api/routes/explain', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ verified_facts: facts }),
    }));
    expect(result).toEqual(mockRes);
  });

  it('getTrafficDna should encode segment_id query param', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ segment_id: 'SEG_1', dna: [] }),
    });

    await getTrafficDna('SEG_1');
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/traffic/dna?segment_id=SEG_1',
      expect.objectContaining({
        headers: expect.objectContaining({ 'X-API-Key': expect.any(String) }),
      })
    );
  });

  it('getHealthStatus should query /api/health', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'healthy' }),
    });

    const res = await getHealthStatus();
    expect(res.status).toBe('healthy');
  });

  it('throws an error on non-200 HTTP responses', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    });

    await expect(calculateRoutes({})).rejects.toThrow('HTTP error! status: 500');
  });
});
