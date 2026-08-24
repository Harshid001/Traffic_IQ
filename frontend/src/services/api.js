const API_BASE = '/api';
const API_KEY = import.meta.env?.VITE_API_KEY || 'trafficiq-dev-key';

function getHeaders(customHeaders = {}) {
  return {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY,
    ...customHeaders,
  };
}

export async function calculateRoutes(params) {
  const res = await fetch(`${API_BASE}/routes/calculate`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return await res.json();
}

export async function explainRoute(verifiedFacts) {
  const res = await fetch(`${API_BASE}/routes/explain`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ verified_facts: verifiedFacts }),
  });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return await res.json();
}

export async function getTrafficDna(segmentId) {
  const res = await fetch(`${API_BASE}/traffic/dna?segment_id=${encodeURIComponent(segmentId)}`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return await res.json();
}

export async function simulateWhatIf(routes) {
  const res = await fetch(`${API_BASE}/traffic/what-if`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ routes }),
  });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return await res.json();
}

export async function getEvaluationBenchmark() {
  const res = await fetch(`${API_BASE}/evaluation/benchmark`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return await res.json();
}

export async function evaluateDrivingAlerts(payload) {
  const res = await fetch(`${API_BASE}/alerts/evaluate`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return await res.json();
}

export async function getHealthStatus() {
  const res = await fetch(`${API_BASE}/health`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return await res.json();
}

