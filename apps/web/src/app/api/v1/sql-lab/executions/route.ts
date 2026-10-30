import { NextRequest, NextResponse } from "next/server";
import {
  createQueryExecution,
  getOnboardingState,
  getProjectById,
  getWorkspacesByOwner,
  updateOnboardingState,
} from "@/lib/store";
import { canAccessProject } from "@/lib/sqllab/access";

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

  const payload = body as {
    projectId?: unknown;
    sqlPreview?: unknown;
    status?: unknown;
    rows?: unknown;
    durationMs?: unknown;
  };

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

  const status = payload.status === "success" ? "success" : payload.status === "error" ? "error" : null;
  const rows = typeof payload.rows === "number" && Number.isFinite(payload.rows) ? Math.max(0, Math.floor(payload.rows)) : 0;
  const durationMs = typeof payload.durationMs === "number" && Number.isFinite(payload.durationMs)
    ? Math.max(0, Math.round(payload.durationMs))
    : 0;
  const sqlPreview = typeof payload.sqlPreview === "string" ? payload.sqlPreview.slice(0, 5000) : "";

  if (!status) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "status must be success or error." } },
      { status: 400 }
    );
  }

  const execution = await createQueryExecution({
    projectId: project.id,
    workspaceId: workspace.id,
    sqlPreview,
    status,
    rows,
    durationMs,
  });

  const onboarding = await getOnboardingState(userId, workspace.id);
  if (onboarding && !onboarding.steps.firstQueryRun) {
    await updateOnboardingState(onboarding.id, {
      steps: { ...onboarding.steps, firstQueryRun: true },
    });
  }

  return NextResponse.json({ execution }, { status: 201 });
}
