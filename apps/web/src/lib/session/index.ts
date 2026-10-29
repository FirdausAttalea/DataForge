import { cookies } from "next/headers";
import { getUserById, getWorkspacesByOwner } from "@/lib/store";
import type { SessionContext, UserRole } from "./types";

export * from "./types";

export async function getSession(): Promise<SessionContext> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("df_session");
    if (!sessionCookie?.value) {
      return { user: null, workspace: null, isAuthenticated: false };
    }

    const userId = sessionCookie.value.split(".")[0];
    if (!userId) {
      return { user: null, workspace: null, isAuthenticated: false };
    }

    const user = await getUserById(userId);
    if (!user) {
      return { user: null, workspace: null, isAuthenticated: false };
    }

    const workspaces = await getWorkspacesByOwner(userId);
    const workspace = workspaces.find((w) => w.setupCompleted) ?? workspaces[0] ?? null;

    return {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role as UserRole,
      },
      workspace: workspace
        ? {
            id: workspace.id,
            name: workspace.name,
            slug: workspace.slug,
            createdAt: workspace.createdAt,
            setupCompleted: workspace.setupCompleted,
          }
        : null,
      isAuthenticated: true,
    };
  } catch {
    return { user: null, workspace: null, isAuthenticated: false };
  }
}
