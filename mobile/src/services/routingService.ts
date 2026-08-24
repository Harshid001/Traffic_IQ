import { fetchJson } from './api';
import { getSimulatedRoutes } from './demoFallbackEngine';

export interface RouteSegment {
  id: string;
  name: string;
  length_km: number;
  freeflow_speed: number;
  current_speed: number;
  congestion: number;
  trend?: string;
  forecast_20m_p50?: number;
  incident_flag?: number;
  history_20m?: number[];
}

export interface RouteData {
  id: string;
  name: string;
  summary: string;
  distance_km: number;
  base_duration_min: number;
  live_duration_min: number;
  predicted_eta_p10: number;
  predicted_eta_p50: number;
  predicted_eta_p90: number;
  forecast_uncertainty_spread: number;
  toll_cost: number;
  avg_congestion: number;
  congestion_category: string;
  trend: string;
  trend_delta_pct: number;
  trend_description: string;
  forecast_20m_p50: number;
  route_health: {
    health_score: number;
    health_label: string;
  };
  reliability: {
    reliability_score: number;
    reliability_label: string;
    p80_duration_min: number;
    p95_duration_min: number;
    buffer_index: number;
  };
  has_incident: boolean;
  score: number;
  is_fastest: boolean;
  is_best: boolean;
  segments: RouteSegment[];
  segment_forecasts?: any[];
  coordinates: [number, number][];
}

export interface RoutingResponse {
  origin: { name: string; lat: number; lon: number };
  destination: { name: string; lat: number; lon: number };
  corridor_name: string;
  routing_provenance: string;
  traffic_provenance: string;
  forecasting_model: string;
  preference_profile: string;
  fastest_route_id: string;
  best_route_id: string;
  are_different: boolean;
  routes: RouteData[];
  verified_facts: any;
  explanation: {
    text: string;
    provenance: string;
    validation_status: string;
    validator_checks: {
      layer_1_numbers: string;
      layer_2_facts: string;
      layer_3_decisions: string;
    };
  };
  /** Timestamp when this response was received or generated */
  fetched_at?: number;
  /** True when generated via Tier 3 client-side fallback simulation */
  is_fallback?: boolean;
}

export interface CalculateRoutesParams {
  origin_lat?: number;
  origin_lon?: number;
  dest_lat?: number;
  dest_lon?: number;
  corridor_preset?: string;
  preference_profile?: string;
  force_traffic_mode?: string;
}

export async function calculateRoutes(
  params: CalculateRoutesParams,
  signal?: AbortSignal
): Promise<RoutingResponse> {
  try {
    const res = await fetchJson<RoutingResponse>('/api/routes/calculate', {
      method: 'POST',
      body: JSON.stringify(params),
      signal,
      timeoutMs: 6000
    });
    return {
      ...res,
      fetched_at: Date.now(),
      is_fallback: false
    };
  } catch (err) {
    // Drop seamlessly to Tier 3 High-Fidelity Demo Simulation fallback
    try {
      const simulated = getSimulatedRoutes(params);
      return {
        ...simulated,
        fetched_at: Date.now(),
        is_fallback: true
      };
    } catch (fallbackErr) {
      // Only throw if even the Tier 3 fallback fails
      throw err;
    }
  }
}

export async function fetchHealth(signal?: AbortSignal): Promise<any> {
  try {
    return await fetchJson<any>('/api/health', { signal, timeoutMs: 5000 });
  } catch (err) {
    // Fallback diagnostic status indicating Tier 3 Demo Simulation is active
    return {
      status: 'DEMO_SIMULATION',
      mode: 'Tier 3 High-Fidelity Client Fallback',
      services: {
        routing_engine: 'DEMO (High-Fidelity Simulation)',
        chronos_forecasting: 'SIMULATED (Deterministic Bounds)',
        traffic_data: 'DEMO (24-Hour Profile Stream)',
        explanation_pipeline: 'VERIFIED (3-Layer Ruleset)',
        local_osrm: 'OFFLINE (Dropped to Tier 3)'
      },
      timestamp: new Date().toISOString()
    };
  }
}

