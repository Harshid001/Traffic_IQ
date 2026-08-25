import { Platform } from 'react-native';
import { API_BASE_URL, fetchJson } from './api';
import { RouteData, RoutingResponse } from './routingService';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'copilot';
  text: string;
  timestamp: string;
  model?: string;
  provenance?: string;
}

export interface ChatHistoryItem {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface RouteChatContext {
  corridor_name?: string;
  city?: string;
  best_route?: RouteData;
  fastest_route?: RouteData;
  all_routes?: RouteData[];
  reliability_label?: string;
  reliability_score?: number;
  bottlenecks?: string[];
  segments?: Array<{ name: string; congestion: number; current_speed: number }>;
  current_congestion?: number;
  forecast_20m?: number;
  active_alert?: { title: string; message: string; savings_min?: number };
}

export interface ChatResponse {
  response: string;
  model: string;
  provenance: string;
  status: 'success' | 'error' | 'unavailable';
}

/**
 * Builds rich route context from the navigation store's active data.
 */
export function buildRouteChatContext(
  routingData: RoutingResponse | null,
  selectedRouteId: string | null
): RouteChatContext {
  if (!routingData || !routingData.routes || routingData.routes.length === 0) {
    return {
      corridor_name: 'Navigation Corridor',
      city: 'Urban Metro'
    };
  }

  const routes = routingData.routes;
  const bestRoute = routes.find(r => r.is_best) || routes[0];
  const fastestRoute = routes.find(r => r.is_fastest) || routes[0];
  const selectedRoute = routes.find(r => r.id === selectedRouteId) || bestRoute;

  const heavySegments = selectedRoute.segments
    ? selectedRoute.segments
        .filter(s => s.congestion >= 35)
        .map(s => ({ name: s.name, congestion: Math.round(s.congestion), current_speed: Math.round(s.current_speed) }))
    : [];

  const bottleneckNames = heavySegments.map(s => `${s.name} (${s.congestion}% traffic)`);

  return {
    corridor_name: routingData.corridor_name || 'Active Navigation Corridor',
    best_route: selectedRoute,
    fastest_route: fastestRoute,
    all_routes: routes,
    reliability_label: selectedRoute.reliability?.reliability_label || 'High Reliability (91%)',
    reliability_score: selectedRoute.reliability?.reliability_score || 0.91,
    bottlenecks: bottleneckNames,
    segments: heavySegments,
    current_congestion: selectedRoute.avg_congestion ? Math.round(selectedRoute.avg_congestion) : 32,
    forecast_20m: selectedRoute.forecast_20m_p50 ? Math.round(selectedRoute.forecast_20m_p50) : 38
  };
}

/**
 * Candidate URLs for direct Ollama access across ADB reverse, LAN, and emulator.
 */
function getOllamaCandidateUrls(): string[] {
  const urls: string[] = [];
  try {
    if (API_BASE_URL) {
      const match = API_BASE_URL.match(/https?:\/\/([^:/]+)/);
      if (match && match[1] && match[1] !== 'localhost' && match[1] !== '127.0.0.1') {
        urls.push(`http://${match[1]}:11434`);
      }
    }
  } catch {
    // fallback
  }
  urls.push('http://localhost:11434');
  urls.push('http://192.168.1.147:11434');
  if (Platform.OS === 'android') {
    urls.push('http://10.0.2.2:11434');
  }
  return [...new Set(urls)];
}

/**
 * Candidate URLs for FastAPI backend access.
 */
function getBackendCandidateUrls(): string[] {
  const urls: string[] = [];
  if (API_BASE_URL) {
    urls.push(API_BASE_URL.replace(/\/+$/, ''));
  }
  urls.push('http://localhost:8005');
  urls.push('http://192.168.1.147:8005');
  if (Platform.OS === 'android') {
    urls.push('http://10.0.2.2:8005');
  }
  return [...new Set(urls)];
}

/**
 * Direct client-side Ollama query fallback if backend API is offline.
 */
async function queryDirectOllama(
  query: string,
  corridorName?: string,
  routeContext?: RouteChatContext,
  history?: ChatHistoryItem[],
  signal?: AbortSignal
): Promise<ChatResponse | null> {
  const candidateUrls = getOllamaCandidateUrls();
  const contextLines: string[] = [];
  if (corridorName) contextLines.push(`Active Corridor: ${corridorName}`);
  if (routeContext) {
    if (routeContext.best_route) {
      contextLines.push(
        `Selected Route: ${routeContext.best_route.name || 'Main Route'} | ETA: ${Math.round(routeContext.best_route.predicted_eta_p50 || 28)} min | Distance: ${routeContext.best_route.distance_km} km | Toll: ₹${routeContext.best_route.toll_cost || 0} | Congestion: ${Math.round(routeContext.best_route.avg_congestion || 30)}%`
      );
    }
    if (routeContext.fastest_route && routeContext.fastest_route.id !== routeContext.best_route?.id) {
      contextLines.push(
        `Fastest Route: ${routeContext.fastest_route.name || 'Fastest Route'} | ETA: ${Math.round(routeContext.fastest_route.predicted_eta_p50 || 26)} min | Toll: ₹${routeContext.fastest_route.toll_cost || 0}`
      );
    }
    if (routeContext.bottlenecks && routeContext.bottlenecks.length > 0) {
      contextLines.push(`Bottlenecks: ${routeContext.bottlenecks.join(', ')}`);
    }
    if (routeContext.reliability_label) {
      contextLines.push(`Reliability: ${routeContext.reliability_label}`);
    }
    if (routeContext.current_congestion !== undefined && routeContext.forecast_20m !== undefined) {
      contextLines.push(`Traffic: Current ${routeContext.current_congestion}%, 20m forecast ${routeContext.forecast_20m}%`);
    }
  }

  const systemInstruction = `You are TrafficIQ Copilot, an expert AI in-car driving assistant powered by Phi-4-mini.\nAnswer concisely in 2 to 4 sentences grounded on the following live telemetry context.\n\nLive Telemetry:\n${contextLines.join('\n')}`;

  const turns: Array<{ role: string; content: string }> = [
    { role: 'system', content: systemInstruction }
  ];

  if (history && history.length > 0) {
    for (const h of history.slice(-6)) {
      if (h.content.trim()) {
        turns.push({ role: h.role, content: h.content });
      }
    }
  }

  turns.push({ role: 'user', content: query });

  for (const ollamaUrl of candidateUrls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);
      const combinedSignal = signal || controller.signal;

      const resp = await fetch(`${ollamaUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'phi4-mini',
          messages: turns,
          stream: false,
          options: { temperature: 0.3, num_predict: 300 }
        }),
        signal: combinedSignal
      });
      clearTimeout(timeoutId);

      if (resp.ok) {
        const data = await resp.json();
        const text = data?.message?.content?.trim();
        if (text) {
          return {
            response: text,
            model: 'phi4-mini',
            provenance: 'LOCAL OLLAMA (phi4-mini)',
            status: 'success'
          };
        }
      }
    } catch {
      // Continue to next candidate URL
    }
  }
  return null;
}

/**
 * Communicates with the backend /api/routes/chat endpoint (powered by local Phi-4-mini)
 * or direct local Ollama.
 */
export async function askRouteCopilot(
  query: string,
  corridorName?: string,
  routeContext?: RouteChatContext,
  history?: ChatHistoryItem[],
  signal?: AbortSignal
): Promise<ChatResponse> {
  const backendUrls = getBackendCandidateUrls();

  // 1. Try Backend API endpoint across candidate URLs
  for (const baseUrl of backendUrls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 18000);
      const combinedSignal = signal || controller.signal;

      const resp = await fetch(`${baseUrl}/api/routes/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'trafficiq-dev-key'
        },
        body: JSON.stringify({
          query,
          corridor_name: corridorName || routeContext?.corridor_name,
          route_context: routeContext,
          messages: history
        }),
        signal: combinedSignal
      });
      clearTimeout(timeoutId);

      if (resp.ok) {
        const res = (await resp.json()) as ChatResponse;
        if (res && res.response && res.status !== 'error') {
          return res;
        }
      }
    } catch {
      // Try next candidate baseUrl
    }
  }

  // 2. Try Direct Client-Side Ollama connection across candidates
  const directRes = await queryDirectOllama(query, corridorName, routeContext, history, signal);
  if (directRes) {
    return directRes;
  }

  // 3. Honest Offline Error
  return {
    response: 'Phi-4-mini assistant is currently unreachable. Make sure the backend server (port 8005) and Ollama are running.',
    model: 'offline',
    provenance: 'OFFLINE',
    status: 'error'
  };
}

