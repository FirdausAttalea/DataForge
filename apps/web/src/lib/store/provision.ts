import {
  createWorkspace,
  createOnboardingState,
  createProject,
  getWorkspacesByOwner,
  getBusinessCaseById,
  type UserRole,
  type ExperienceLevel,
} from "./index";
import { getRecommendedCaseForRole } from "./recommendations";

export interface WorkspaceSetupInput {
  name: string;
  slug: string;
  primaryGoal: UserRole;
  experienceLevel: ExperienceLevel;
  createStarterProject: boolean;
}

export async function provisionWorkspace(
  userId: string,
  input: WorkspaceSetupInput
): Promise<{ workspaceId: string; projectId?: string }> {
  const existing = await getWorkspacesByOwner(userId);
  if (existing.some((w) => w.slug === input.slug)) {
    const existingWorkspace = existing.find((w) => w.slug === input.slug);
    if (existingWorkspace?.setupCompleted) {
      return { workspaceId: existingWorkspace.id };
    }
  }

  const workspace = await createWorkspace({
    ownerId: userId,
    name: input.name,
    slug: input.slug,
    primaryGoal: input.primaryGoal,
    experienceLevel: input.experienceLevel,
    setupCompleted: true,
  });

  const onboarding = await createOnboardingState({
    userId,
    workspaceId: workspace.id,
    steps: {
      accountCreated: true,
      workspaceConfigured: true,
      datasetsProvisioned: true,
      firstProjectCreated: input.createStarterProject,
      firstQueryRun: false,
    },
    dismissedChecklist: false,
  });

  let projectId: string | undefined;

  if (input.createStarterProject) {
    const recommendedCaseId = getRecommendedCaseForRole(input.primaryGoal);
    const businessCase = getBusinessCaseById(recommendedCaseId);

    if (businessCase) {
      const project = await createProject({
        workspaceId: workspace.id,
        ownerId: userId,
        caseId: businessCase.id,
        title: businessCase.title,
        description: businessCase.objective,
        status: "draft",
        tableIds: businessCase.tableIds,
      });
      projectId = project.id;
    }
  }

  return { workspaceId: workspace.id, projectId };
}
