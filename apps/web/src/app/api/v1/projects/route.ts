import { NextRequest, NextResponse } from "next/server";
import {
  getUserById,
  getWorkspacesByOwner,
  createProject,
  getOnboardingState,
  updateOnboardingState,
  getBusinessCaseById,
  getTables,
} from "@/lib/store";

export async function POST(request: NextRequest) {
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
  const workspace = workspaces.find((w) => w.setupCompleted) ?? workspaces[0];
  if (!workspace) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Workspace not found." } },
      { status: 404 }
    );
  }

  const body = await request.json();
  const { title, description, caseId, tableIds } = body;

  if (!title?.trim()) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Title is required." } },
      { status: 400 }
    );
  }

  const allTables = getTables();
  const validTableIds: string[] = Array.isArray(tableIds)
    ? tableIds.filter((id: string) => allTables.some((t) => t.id === id))
    : [];

  if (caseId) {
    const bc = getBusinessCaseById(caseId);
    if (!bc) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid caseId." } },
        { status: 400 }
      );
    }
  }

  const project = await createProject({
    workspaceId: workspace.id,
    ownerId: userId,
    caseId: caseId || undefined,
    title: title.trim(),
    description: description?.trim() || "",
    status: "draft",
    tableIds: validTableIds,
  });

  const onboarding = await getOnboardingState(userId, workspace.id);
  if (onboarding && !onboarding.steps.firstProjectCreated) {
    await updateOnboardingState(onboarding.id, {
      steps: { ...onboarding.steps, firstProjectCreated: true },
    });
  }

  return NextResponse.json({ project }, { status: 201 });
}
