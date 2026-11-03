import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getProjectsByWorkspace } from "@/lib/store";

export default async function InsightsPage() {
  const session = await getSession();
  if (!session.isAuthenticated || !session.workspace) {
    redirect("/sign-in");
  }

  const projects = await getProjectsByWorkspace(session.workspace.id);
  if (projects.length === 0) {
    redirect("/projects/new");
  }

  redirect(`/projects/${projects[0].id}/insights`);
}
