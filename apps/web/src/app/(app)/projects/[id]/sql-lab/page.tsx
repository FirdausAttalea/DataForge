import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import {
  getProjectById,
  getTableById,
  getWorkspacesByOwner,
  getSavedQueryByProject,
  getExecutionsByWorkspace,
} from "@/lib/store";
import { canAccessProject } from "@/lib/sqllab/access";
import { getDemoSavedQuery } from "@/lib/sqllab/fixtures";
import { SqlLabShell } from "@/components/sqllab/SqlLabShell";

interface SqlLabPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: SqlLabPageProps) {
  const { id } = await params;
  const project = await getProjectById(id);
  return {
    title: project ? `SQL Lab · ${project.title} | DataForge` : "SQL Lab | DataForge",
  };
}

export default async function SqlLabPage({ params }: SqlLabPageProps) {
  const { id } = await params;
  const session = await getSession();

  if (!session.user) redirect("/sign-in");
  if (!session.workspace || !session.workspace.setupCompleted) redirect("/workspace-setup");

  const workspaces = await getWorkspacesByOwner(session.user.id);
  const workspace = workspaces.find((candidate) => candidate.id === session.workspace!.id);
  if (!workspace) redirect("/workspace-setup");

  const project = await getProjectById(id);
  if (!project) notFound();

  const allowed = canAccessProject(
    { userId: session.user.id, workspaceId: session.workspace.id },
    project,
    workspace.ownerId
  );
  if (!allowed) notFound();

  const tables = project.tableIds
    .map((tableId) => getTableById(tableId))
    .filter((table): table is NonNullable<typeof table> => table !== null);

  const savedQuery =
    (await getSavedQueryByProject(project.id)) ?? getDemoSavedQuery(project.id, workspace.id);

  const executions = (await getExecutionsByWorkspace(workspace.id))
    .filter((execution) => execution.projectId === project.id)
    .slice(0, 100);

  return (
    <SqlLabShell
      workspaceName={workspace.name}
      workspaceId={workspace.id}
      project={{
        id: project.id,
        title: project.title,
        environment: project.environment ?? "production",
      }}
      tables={tables}
      initialSavedQuery={savedQuery}
      initialExecutions={executions}
    />
  );
}
