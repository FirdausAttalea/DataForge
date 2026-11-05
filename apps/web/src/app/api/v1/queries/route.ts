import { NextRequest, NextResponse } from "next/server";
import { getProjectById, getSavedQueriesByProject, getSavedQueryById, deleteSavedQuery } from "@/lib/store";
import { canAccessProject } from "@/lib/sqllab/access";
import { getWorkspacesByOwner } from "@/lib/store";

export async function GET(request: NextRequest) {
  const sessionCookie = request.cookies.get("df_session");
  if (!sessionCookie?.value) {
    return NextResponse.json(
      { error: { code: "UNAUTHENTICATED", message: "Not authenticated." } },
      { status: 401 }
    );
  }

  const projectId = request.nextUrl.searchParams.get("project_id");
  if (!projectId) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "project_id is required." } },
      { status: 400 }
    );
  }

  const userId = sessionCookie.value.split(".")[0];
  const workspaces = await getWorkspacesByOwner(userId);
  const workspace = workspaces.find((candidate) => candidate.setupCompleted) ?? workspaces[0];
  if (!workspace) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Workspace not found." } },
      { status: 404 }
    );
  }

  const project = await getProjectById(projectId);
  if (
    !project ||
    !canAccessProject({ userId, workspaceId: workspace.id }, project, workspace.ownerId)
  ) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Project not found." } },
      { status: 404 }
    );
  }

  const queries = await getSavedQueriesByProject(projectId);
  return NextResponse.json(queries);
}

export async function DELETE(request: NextRequest) {
  const sessionCookie = request.cookies.get("df_session");
  if (!sessionCookie?.value) {
    return NextResponse.json(
      { error: { code: "UNAUTHENTICATED", message: "Not authenticated." } },
      { status: 401 }
    );
  }

  const queryId = request.nextUrl.searchParams.get("id");
  const projectId = request.nextUrl.searchParams.get("project_id");
  if (!queryId || !projectId) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "id and project_id are required." } },
      { status: 400 }
    );
  }

  const userId = sessionCookie.value.split(".")[0];
  const workspaces = await getWorkspacesByOwner(userId);
  const workspace = workspaces.find((candidate) => candidate.setupCompleted) ?? workspaces[0];
  if (!workspace) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Workspace not found." } },
      { status: 404 }
    );
  }

  const project = await getProjectById(projectId);
  if (
    !project ||
    !canAccessProject({ userId, workspaceId: workspace.id }, project, workspace.ownerId)
  ) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Project not found." } },
      { status: 404 }
    );
  }

  const query = await getSavedQueryById(queryId);
  if (!query) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Query not found." } },
      { status: 404 }
    );
  }
  if (query.projectId !== projectId) {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "Query not in this project." } },
      { status: 403 }
    );
  }

  await deleteSavedQuery(queryId);
  return NextResponse.json({ success: true });
}
