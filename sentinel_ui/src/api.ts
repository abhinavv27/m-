import type { TenderSummary, TenderDetail, PriceDistribution, OperationalStats } from './types';

const API_BASE = 'http://127.0.0.1:8000/api';

export async function fetchStats(): Promise<OperationalStats> {
  const res = await fetch(`${API_BASE}/stats`);
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}

export async function fetchTenders(params: {
  q?: string;
  cpv?: string;
  category?: string;
  min_score?: number;
  limit?: number;
  offset?: number;
} = {}): Promise<{ total: number; offset: number; limit: number; items: TenderSummary[] }> {
  const query = new URLSearchParams();
  if (params.q) query.set('q', params.q);
  if (params.cpv) query.set('cpv', params.cpv);
  if (params.category) query.set('category', params.category);
  if (params.min_score !== undefined) query.set('min_score', params.min_score.toString());
  if (params.limit) query.set('limit', params.limit.toString());
  if (params.offset) query.set('offset', params.offset.toString());

  const res = await fetch(`${API_BASE}/tenders?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch tenders');
  return res.json();
}

export async function fetchTenderDetail(id: string): Promise<TenderDetail> {
  const res = await fetch(`${API_BASE}/tenders/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch tender ${id}`);
  return res.json();
}

export async function fetchTenderGraph(id: string) {
  const res = await fetch(`${API_BASE}/tenders/${id}/graph`);
  if (!res.ok) throw new Error(`Failed to fetch graph for ${id}`);
  return res.json();
}

export async function fetchPriceDistribution(id: string): Promise<PriceDistribution> {
  const res = await fetch(`${API_BASE}/tenders/${id}/price-distribution`);
  if (!res.ok) throw new Error(`Failed to fetch price distribution for ${id}`);
  return res.json();
}

export async function postDisposition(id: string, action: string, auditorNotes: string) {
  const res = await fetch(`${API_BASE}/tenders/${id}/disposition`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, auditor_notes: auditorNotes }),
  });
  if (!res.ok) throw new Error(`Failed to record disposition for ${id}`);
  return res.json();
}

export function getExportDossierUrl(id: string): string {
  return `${API_BASE}/tenders/${id}/export-dossier`;
}

export async function fetchAuditLogs(tenderId?: string): Promise<import('./types').AuditLogEntry[]> {
  const url = tenderId ? `${API_BASE}/audit-logs?tender_id=${encodeURIComponent(tenderId)}` : `${API_BASE}/audit-logs`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch audit logs');
  return res.json();
}

export async function postAuditLog(payload: {
  tender_id: string;
  officer_name?: string;
  agency?: string;
  action?: string;
  notes: string;
}): Promise<{ success: boolean; entry: import('./types').AuditLogEntry }> {
  const res = await fetch(`${API_BASE}/audit-logs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to record audit note');
  return res.json();
}

