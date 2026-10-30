import type { Project } from "@/lib/store";

export interface SqlLabSession {
  userId: string;
  workspaceId: string;
}

/**
 * Server-side authorization rule for the SQL Lab. Both the workspace and owner
 * must match the authenticated session; callers must use this on the server
 * before loading project data.
 */
export function canAccessProject(
  session: SqlLabSession,
  project: Pick<Project, "ownerId" | "workspaceId">,
  workspaceOwnerId: string
): boolean {
  return (
    project.ownerId === session.userId &&
    project.workspaceId === session.workspaceId &&
    workspaceOwnerId === session.userId
  );
}
