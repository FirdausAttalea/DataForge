import { NextRequest, NextResponse } from "next/server";
import {
  createSavedQuery,
  getProjectById,
  getSavedQueryById,
  getWorkspacesByOwner,
  updateSavedQuery,
} from "@/lib/store";
import { canAccessProject } from "@/lib/sqllab/access";

interface SavedQueryPayload {
  id?: unknown;
  projectId?: unknown;
  name?: unknown;
  title?: unknown;
  sql?: unknown;
}

export async function POST(request: NextRequest) {
  const sessionCookie = request.cookies.get("df_session");
  if (!sessionCookie?.value) {
    return NextResponse.json(
      { error: { code: "UNAUTHENTICATED", message: "Not authenticated." } },
      { status: 401 }
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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Invalid JSON body." } },
      { status: 400 }
    );
  }

  const payload = body as SavedQueryPayload;
  if (typeof payload.projectId !== "string") {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "projectId is required." } },
      { status: 400 }
    );
  }

  const project = await getProjectById(payload.projectId);
  if (
    !project ||
    !canAccessProject({ userId, workspaceId: workspace.id }, project, workspace.ownerId)
  ) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Project not found." } },
      { status: 404 }
    );
  }

  const sql = typeof payload.sql === "string" ? payload.sql.slice(0, 200_000) : "";
  const name = typeof payload.name === "string" && payload.name.trim()
    ? payload.name.trim().slice(0, 160)
    : "untitled.sql";
  const title = typeof payload.title === "string" && payload.title.trim()
    ? payload.title.trim().slice(0, 200)
    : "Untitled query";

  if (typeof payload.id === "string") {
    const existing = await getSavedQueryById(payload.id);
    if (
      !existing ||
      existing.projectId !== project.id ||
      existing.workspaceId !== workspace.id
    ) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Saved query not found." } },
        { status: 404 }
      );
    }
    const updated = await updateSavedQuery(existing.id, { name, title, sql });
    return NextResponse.json({ savedQuery: updated });
  }

  const created = await createSavedQuery({
    projectId: project.id,
    workspaceId: workspace.id,
    name,
    title,
    sql,
  });
  return NextResponse.json({ savedQuery: created }, { status: 201 });
}
