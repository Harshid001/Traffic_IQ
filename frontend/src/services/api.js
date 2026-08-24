const API_BASE = '/api';

export async function calculateRoutes(params) {
  const res = await fetch(`${API_BASE}/routes/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return await res.json();
}

export async function explainRoute(verifiedFacts) {
  const res = await fetch(`${API_BASE}/routes/explain`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ verified_facts: verifiedFacts }),
  });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return await res.json();
}

export async function getTrafficDna(segmentId) {
  const res = await fetch(`${API_BASE}/traffic/dna?segment_id=${encodeURIComponent(segmentId)}`);
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return await res.json();
}

export async function simulateWhatIf(routes) {
  const res = await fetch(`${API_BASE}/traffic/what-if`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ routes }),
  });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return await res.json();
}

export async function getEvaluationBenchmark() {
  const res = await fetch(`${API_BASE}/evaluation/benchmark`);
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return await res.json();
}

export async function evaluateDrivingAlerts(payload) {
  const res = await fetch(`${API_BASE}/alerts/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return await res.json();
}

export async function getHealthStatus() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return await res.json();
}
