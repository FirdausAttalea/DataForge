export interface SnapshotOut {
  id: string;
  query_id: string;
  query_text: string;
  limit_value: number;
  row_count: number;
  snapshot_data: Record<string, unknown>[];
  created_at: string;
  updated_at: string;
}

const BASE = "http://localhost:8000/api/v1/snapshots";

export async function createSnapshot(
  queryId: string,
  projectId: string
): Promise<SnapshotOut> {
  const res = await fetch(
    `${BASE}?query_id=${encodeURIComponent(queryId)}&project_id=${encodeURIComponent(projectId)}`,
    { method: "POST" }
  );
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getLatestSnapshot(
  queryId: string,
  projectId: string
): Promise<SnapshotOut | null> {
  const res = await fetch(
    `${BASE}/latest?query_id=${encodeURIComponent(queryId)}&project_id=${encodeURIComponent(projectId)}`
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
