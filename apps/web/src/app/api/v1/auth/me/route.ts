import { NextRequest, NextResponse } from "next/server";
import { getUserById, getWorkspacesByOwner } from "@/lib/store";

export async function GET(request: NextRequest) {
  const sessionCookie = request.cookies.get("df_session");
  if (!sessionCookie) {
    return NextResponse.json(
      { error: { code: "UNAUTHENTICATED", message: "Not authenticated." } },
      { status: 401 }
    );
  }

  const userId = sessionCookie.value.split(".")[0];
  const user = await getUserById(userId);
  if (!user) {
    return NextResponse.json(
      { error: { code: "UNAUTHENTICATED", message: "Not authenticated." } },
      { status: 401 }
    );
  }

  const workspaces = await getWorkspacesByOwner(userId);
  const workspace = workspaces.find((w) => w.setupCompleted) ?? workspaces[0] ?? null;

  const response = NextResponse.json({
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
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
  });

  if (workspace?.setupCompleted) {
    response.cookies.set("df_setup_complete", "true", {
      path: "/",
      maxAge: 31536000,
      sameSite: "lax",
    });
  }

  return response;
}
