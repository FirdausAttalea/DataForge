import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getProjectsByWorkspace, getWorkspacesByOwner } from "@/lib/store";

export default async function SqlLabIndexPage() {
  const session = await getSession();
  if (!session.user) redirect("/sign-in");
  if (!session.workspace) redirect("/workspace-setup");

  const workspaces = await getWorkspacesByOwner(session.user.id);
  const workspace = workspaces.find((candidate) => candidate.id === session.workspace!.id);
  if (!workspace) redirect("/workspace-setup");

  const projects = await getProjectsByWorkspace(workspace.id);
  if (projects.length === 0) redirect("/projects");

  redirect(`/projects/${projects[0].id}/sql-lab`);
}
