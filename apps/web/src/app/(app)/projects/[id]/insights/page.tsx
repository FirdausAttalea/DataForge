import { notFound } from "next/navigation";
import { getSession } from "@/lib/session";
import { getProjectById, getSavedQueriesByProject, getExecutionsByWorkspace } from "@/lib/store";
import { DEMO_RESULT } from "@/lib/sqllab/fixtures";
import type { SavedQuery } from "@/lib/sqllab/types";
import InsightsShell from "@/components/insights/InsightsShell";
import EmptyState from "@/components/insights/EmptyState";

export default async function ProjectInsightsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session.isAuthenticated) notFound();
  if (!session.workspace?.setupCompleted) notFound();
  
  const { id } = await params;
  const project = await getProjectById(id);
  if (!project) notFound();
  if (project.workspaceId !== session.workspace.id) notFound();

  const queries = await getSavedQueriesByProject(id);
  // Get latest query that has SQL content
  let savedQuery = queries.find(q => q.sql && q.sql.trim().length > 0) ?? queries[0] ?? null;

  // Fallback: If no query was explicitly saved yet, check if a query was executed in SQL Lab
  if (!savedQuery || !savedQuery.sql || savedQuery.sql.trim().length === 0) {
    const executions = await getExecutionsByWorkspace(session.workspace.id);
    const lastExecution = executions.find(
      (e) => e.projectId === id && e.status === "success" && e.sqlPreview && e.sqlPreview.trim().length > 0
    );

    if (lastExecution) {
      savedQuery = {
        id: `exec-${lastExecution.id}`,
        projectId: id,
        workspaceId: session.workspace.id,
        name: "latest_query.sql",
        title: "Latest Executed Query",
        sql: lastExecution.sqlPreview,
        updatedAt: lastExecution.executedAt,
      } as SavedQuery;
    }
  }

  if (!savedQuery || !savedQuery.sql || savedQuery.sql.trim().length === 0) {
    return <EmptyState projectId={id} />;
  }

  return (
    <InsightsShell
      project={project}
      workspace={session.workspace}
      savedQuery={savedQuery}
      queryResult={DEMO_RESULT}
    />
  );
}
