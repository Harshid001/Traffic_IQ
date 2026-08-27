import { buildRoutes } from '../data';

// Storage key for custom user-configured backend or tunnel URL
const STORAGE_KEY_API = 'trafficiq_custom_api_url';

export function getCustomApiUrl() {
  try {
    return localStorage.getItem(STORAGE_KEY_API) || '';
  } catch (e) {
    return '';
  }
}

export function setCustomApiUrl(url) {
  try {
    if (url) {
      localStorage.setItem(STORAGE_KEY_API, url.trim().replace(/\/+$/, ''));
    } else {
      localStorage.removeItem(STORAGE_KEY_API);
    }
  } catch (e) {
    // Ignore localStorage errors
  }
}

/**
 * Builds a structured, high-detail telemetry context payload from the active corridor and website state.
 */
export function buildCorridorContext(corridor, telemetry = {}) {
  if (!corridor) return { summary: 'No corridor selected.' };

  const routes = buildRoutes(corridor);
  const bestRoute = routes.find((r) => r.id === 'best') || routes[0] || {};
  const fastestRoute = routes.find((r) => r.id === 'fastest') || routes[1] || {};
  const altRoute = routes.find((r) => r.id === 'alt') || routes[2] || null;

  return {
    corridor_name: `${corridor.name} (${corridor.city})`,
    city: corridor.city,
    tag: corridor.tag,
    origin: corridor.origin?.name || 'Corridor Origin',
    destination: corridor.destination?.name || 'Corridor Destination',
    current_congestion: corridor.cong,
    forecast_20m: corridor.forecast,
    forecast_peak: corridor.forecastPeak,
    weather: corridor.weather,
    avg_speed: corridor.avgSpeed,
    speed_limit: corridor.speedLimit,
    active_sensors: corridor.sensors,
    incident: corridor.incident
      ? {
          type: corridor.incident.type,
          location: corridor.incident.location,
          delay: corridor.incident.delay,
          impacted_route: corridor.incident.impactedRoute
        }
      : null,
    best_route: {
      id: 'best',
      name: bestRoute.name || corridor.best,
      summary: bestRoute.summary,
      eta_min: bestRoute.eta,
      predicted_eta_p50: bestRoute.p50,
      predicted_eta_p10: bestRoute.p10,
      predicted_eta_p90: bestRoute.p90,
      distance_km: bestRoute.dist,
      avg_congestion: bestRoute.cong,
      reliability_percent: bestRoute.reliability,
      toll_cost: bestRoute.toll,
      segments: bestRoute.segments || []
    },
    fastest_route: {
      id: 'fastest',
      name: fastestRoute.name || corridor.fastest,
      summary: fastestRoute.summary,
      eta_min: fastestRoute.eta,
      predicted_eta_p50: fastestRoute.p50,
      distance_km: fastestRoute.dist,
      avg_congestion: fastestRoute.cong,
      reliability_percent: fastestRoute.reliability,
      toll_cost: fastestRoute.toll,
      segments: fastestRoute.segments || []
    },
    alternative_route: altRoute
      ? {
          id: 'alt',
          name: altRoute.name,
          eta_min: altRoute.eta,
          distance_km: altRoute.dist,
          toll_cost: altRoute.toll
        }
      : null,
    live_telemetry: telemetry.currentSpeedKmh
      ? {
          speed_kmh: telemetry.currentSpeedKmh,
          remaining_km: telemetry.remainingDistanceKm,
          remaining_eta: telemetry.remainingEtaMin,
          maneuver: telemetry.currentManeuver,
          segment: telemetry.upcomingSegment
        }
      : null
  };
}

/**
 * Builds the natural-language system prompt string including all live corridor facts.
 */
function buildSystemPrompt(context) {
  const c = context;
  const best = c.best_route || {};
  const fastest = c.fastest_route || {};

  return `You are TrafficIQ Copilot, an expert AI in-car driving assistant powered by local Phi-4-mini.
You assist drivers and travelers with real-time navigation advice, traffic congestion analysis, departure timing, tolls, and route trade-offs.

=== LIVE CORRIDOR CONTEXT ===
• Active Corridor: ${c.corridor_name} [${c.tag}]
• Origin: ${c.origin} → Destination: ${c.destination}
• Current Congestion: ${c.current_congestion}% | 20-Min Chronos Forecast: ${c.forecast_20m}% (Peak: ${c.forecast_peak}%)
• Weather: ${c.weather} | Current Flow Speed: ${c.avg_speed} (Limit: ${c.speed_limit} km/h) | Active Sensors: ${c.active_sensors}
• Recommended (Best) Route: ${best.name}
  - ETA: ${best.eta_min} min (P10: ${best.predicted_eta_p10}m, P50: ${best.predicted_eta_p50}m, P90: ${best.predicted_eta_p90}m)
  - Distance: ${best.distance_km} km | Toll: ₹${best.toll_cost} | Reliability: ${best.reliability_percent}%
  - Key Segments: ${(best.segments || []).map((s) => `${s.name} (${s.speed} km/h, ${s.congestion}% cong)`).join(', ')}
• Fastest Route: ${fastest.name}
  - ETA: ${fastest.eta_min} min | Distance: ${fastest.distance_km} km | Toll: ₹${fastest.toll_cost} | Reliability: ${fastest.reliability_percent}%
• Active Alerts/Incidents: ${
    c.incident
      ? `🚨 ${c.incident.type} near ${c.incident.location} (+${c.incident.delay} delay on ${c.incident.impacted_route})`
      : 'None reported (Clear flow)'
  }

=== RESPONSE GUIDELINES ===
1. Answer conversationally, concisely, and crisply in 2 to 4 sentences.
2. Ground your advice strictly on the above live context (quote exact route names, ETA minutes, tolls in ₹, congestion %, and segment bottlenecks).
3. Do NOT make up nonexistent highway names or hallucinatory times.
4. Keep the tone helpful, confident, and driver-safe.`;
}

/**
 * Checks connection health to local FastAPI backend or local Ollama.
 */
export async function checkAiConnectionStatus() {
  const customUrl = getCustomApiUrl();
  const testEndpoints = [
    ...(customUrl ? [`${customUrl}/api/health`] : []),
    'http://localhost:8005/api/health',
    'http://127.0.0.1:8005/api/health',
    'http://localhost:11434/api/tags',
    'http://127.0.0.1:11434/api/tags'
  ];

  for (const url of testEndpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);

      const resp = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      });
      clearTimeout(timeoutId);

      if (resp.ok) {
        if (url.includes(':8005') || url.includes('/api/health')) {
          const data = await resp.json().catch(() => ({}));
          return {
            online: true,
            type: 'fastapi',
            label: 'Local Backend + Phi-4-mini',
            model: 'phi4-mini',
            url: url.replace('/api/health', '')
          };
        } else {
          return {
            online: true,
            type: 'ollama',
            label: 'Direct Ollama (phi4-mini)',
            model: 'phi4-mini',
            url: url.replace('/api/tags', '')
          };
        }
      }
    } catch (err) {
      // Continue to next probe candidate
    }
  }

  return {
    online: false,
    type: 'offline',
    label: 'Local Model Offline',
    model: 'phi4-mini',
    url: null
  };
}

/**
 * Executes a real AI chat query with full context against the local model or FastAPI backend.
 * No hardcoded canned answers are returned.
 */
export async function askAiCopilot({
  query,
  corridor,
  telemetry = {},
  history = []
}) {
  const context = buildCorridorContext(corridor, telemetry);
  const customUrl = getCustomApiUrl();

  // Clean conversation history format for API payload
  const formattedHistory = history
    .filter((h) => h.sender === 'user' || h.sender === 'copilot')
    .slice(-6)
    .map((h) => ({
      role: h.sender === 'user' ? 'user' : 'assistant',
      content: h.text || ''
    }));

  // 1. Try FastAPI backend endpoints
  const backendCandidates = [
    ...(customUrl ? [`${customUrl}/api/chat`, `${customUrl}/api/routes/chat`] : []),
    'http://localhost:8005/api/chat',
    'http://localhost:8005/api/routes/chat',
    'http://127.0.0.1:8005/api/chat',
    'http://127.0.0.1:8005/api/routes/chat'
  ];

  for (const endpoint of backendCandidates) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          query: query,
          corridor_name: corridor.name,
          route_context: context,
          messages: formattedHistory
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (resp.ok) {
        const data = await resp.json();
        const responseText = data.response || data.explanation || data.answer;
        if (responseText) {
          return {
            success: true,
            text: responseText,
            provenance: data.provenance || 'LOCAL OLLAMA (phi4-mini)',
            model: data.model || 'phi4-mini',
            status: 'success'
          };
        }
      }
    } catch (err) {
      // Try next endpoint candidate
    }
  }

  // 2. Try Direct Local Ollama Endpoint
  const ollamaCandidates = [
    'http://localhost:11434/api/chat',
    'http://127.0.0.1:11434/api/chat'
  ];

  const systemPrompt = buildSystemPrompt(context);
  const ollamaMessages = [
    { role: 'system', content: systemPrompt },
    ...formattedHistory,
    { role: 'user', content: query }
  ];

  for (const endpoint of ollamaCandidates) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 22000);

      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'phi4-mini',
          messages: ollamaMessages,
          stream: false,
          options: {
            temperature: 0.25,
            top_p: 0.9,
            num_predict: 180
          }
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (resp.ok) {
        const data = await resp.json();
        const content = data.message?.content?.trim();
        if (content) {
          return {
            success: true,
            text: content,
            provenance: 'LOCAL OLLAMA (phi4-mini)',
            model: 'phi4-mini',
            status: 'success'
          };
        }
      }
    } catch (err) {
      // Continue to next candidate
    }
  }

  // 3. If local AI is offline, return a clear, informative status message
  return {
    success: false,
    text: `⚠️ **Local AI Engine Offline**\n\nThe AI Copilot requires your local **Phi-4-mini** model server to generate dynamic navigation reasoning.\n\n👉 **To connect immediately:**\n1. Double-click \`start_all.bat\` or \`start_local_ai_copilot.bat\` on your computer.\n2. Once the console launches, click the **"Retry"** button above or send your query again.`,
    provenance: 'LOCAL AI OFFLINE',
    model: 'phi4-mini (disconnected)',
    status: 'offline'
  };
}
