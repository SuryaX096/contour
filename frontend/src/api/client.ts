import {
  HealthData,
  GraphData,
  DecisionResponse,
  CounterexampleSearchResponse,
  ContextRepairResponse,
  VerificationCertificate
} from '../types';

const API_BASE = '/api';

export async function fetchHealth(): Promise<HealthData> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`);
  return res.json();
}

export async function seedDemoData(): Promise<any> {
  const res = await fetch(`${API_BASE}/demo/seed`, { method: 'POST' });
  if (!res.ok) throw new Error(`Demo seed failed: ${res.statusText}`);
  return res.json();
}

export async function fetchGraph(): Promise<GraphData> {
  const res = await fetch(`${API_BASE}/graph`);
  if (!res.ok) throw new Error(`Failed to fetch graph data: ${res.statusText}`);
  return res.json();
}

export async function evaluateDecision(payload: {
  root_entity: string;
  policy_id: string;
  policy_version: string;
  context_budget?: number;
  include_optional?: boolean;
}): Promise<DecisionResponse> {
  const res = await fetch(`${API_BASE}/decisions/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Decision evaluation failed');
  }
  return res.json();
}

export async function searchCounterexamples(payload: {
  decision_id: string;
  max_scenarios?: number;
  max_depth?: number;
  include_formal_solver?: boolean;
}): Promise<CounterexampleSearchResponse> {
  const res = await fetch(`${API_BASE}/counterexamples/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Counterexample search failed');
  }
  return res.json();
}

export async function repairContext(payload: {
  decision_id: string;
  counterexample_id: string;
}): Promise<ContextRepairResponse> {
  const res = await fetch(`${API_BASE}/context/repair`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Context repair failed');
  }
  return res.json();
}

export async function fetchCertificate(certificateId: string): Promise<VerificationCertificate> {
  const res = await fetch(`${API_BASE}/certificates/${certificateId}`);
  if (!res.ok) throw new Error(`Failed to load certificate: ${res.statusText}`);
  return res.json();
}

export async function runBenchmark(cases: number = 100): Promise<any> {
  const res = await fetch(`${API_BASE}/benchmark/run?cases=${cases}`);
  if (!res.ok) throw new Error(`Benchmark failed: ${res.statusText}`);
  return res.json();
}
