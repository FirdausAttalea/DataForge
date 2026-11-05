import { notFound } from "next/navigation";
import { getSession } from "@/lib/session";
import { getProjectById, getSavedQueriesByProject } from "@/lib/store";
import { DEMO_RESULT } from "@/lib/sqllab/fixtures";
import type { SavedQuery, QueryResult } from "@/lib/sqllab/types";
import InsightsShell from "@/components/insights/InsightsShell";
import EmptyState from "@/components/insights/EmptyState";
import { getLatestSnapshot } from "@/lib/api/snapshots";

function snapshotToQueryResult(snapshot: Awaited<ReturnType<typeof getLatestSnapshot>>): QueryResult {
  if (!snapshot || !snapshot.snapshot_data?.length) return DEMO_RESULT;
  const rows = snapshot.snapshot_data as Record<string, unknown>[];
  const columns = Object.keys(rows[0]).map((name) => ({
    name,
    type: "text",
    alignment: "left" as const,
  }));
  const typedRows = rows.map((r) => {
    const out: Record<string, string | number | null> = {};
    for (const [k, v] of Object.entries(r)) {
      out[k] = v == null ? null : typeof v === "number" ? v : String(v);
    }
    return out;
  });
  return {
    status: "success" as const,
    columns,
    rows: typedRows,
    rowCount: snapshot.row_count,
    durationMs: 0,
    engineVersion: "",
    memoryMb: 0,
  };
}

export default async function ProjectInsightsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ queryId?: string }>;
}) {
  const session = await getSession();
  if (!session.isAuthenticated) notFound();
  if (!session.workspace?.setupCompleted) notFound();

  const { id } = await params;
  const { queryId } = await searchParams;
  const project = await getProjectById(id);
  if (!project) notFound();
  if (project.workspaceId !== session.workspace.id) notFound();

  const queries = await getSavedQueriesByProject(id);

  let savedQuery: SavedQuery | null = null;

  if (queryId) {
    savedQuery = queries.find((q) => q.id === queryId) ?? null;
  }
  if (!savedQuery) {
    savedQuery = queries.find((q) => q.sql && q.sql.trim().length > 0) ?? queries[0] ?? null;
  }

  if (!savedQuery || !savedQuery.sql || savedQuery.sql.trim().length === 0) {
    return <EmptyState projectId={id} />;
  }

  // Load snapshot; fall back to DEMO_RESULT
  let queryResult: QueryResult = DEMO_RESULT;
  try {
    const snapshot = await getLatestSnapshot(savedQuery.id, id);
    queryResult = snapshotToQueryResult(snapshot);
  } catch (err) {
    console.error("getLatestSnapshot failed:", err);
  }

  return (
    <InsightsShell
      project={project}
      workspace={session.workspace}
      savedQuery={savedQuery}
      queryResult={queryResult}
    />
  );
}
