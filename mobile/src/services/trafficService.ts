import { fetchJson } from './api';
import { RouteData } from './routingService';

export interface TrafficDNAHour {
  hour: number;
  mean_congestion: number;
  p90_congestion: number;
  reliability: number;
}

export interface WhatIfScenario {
  offset_minutes: number;
  label: string;
  best_route_id: string;
  best_route_name: string;
  lowest_eta_min: number;
  routes: {
    route_id: string;
    route_name: string;
    predicted_eta_min: number;
    is_best: boolean;
    is_fastest: boolean;
  }[];
}

export interface WhatIfResponse {
  departure_evaluations: WhatIfScenario[];
  optimal_departure_window: string;
  optimal_offset_minutes: number;
  recommended_route_name: string;
  potential_savings_min: number;
  recommendation: string;
}

export async function fetchTrafficDNA(
  segmentId: string,
  signal?: AbortSignal
): Promise<{ segment_id: string; dna: TrafficDNAHour[] }> {
  return await fetchJson<{ segment_id: string; dna: TrafficDNAHour[] }>(
    `/api/traffic/dna?segment_id=${encodeURIComponent(segmentId)}`,
    { signal }
  );
}

export async function fetchWhatIfDeparture(
  routes: RouteData[],
  signal?: AbortSignal
): Promise<WhatIfResponse> {
  return await fetchJson<WhatIfResponse>('/api/traffic/what-if', {
    method: 'POST',
    body: JSON.stringify({ routes }),
    signal
  });
}
