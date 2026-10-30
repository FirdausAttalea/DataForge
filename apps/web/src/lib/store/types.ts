// PROTOTYPE store. Replace with the real /api/v1 integration.

export type UserRole = "data_analyst" | "analytics_engineer" | "learner";
export type ExperienceLevel = "beginner" | "intermediate" | "advanced";
export type ProjectStatus = "draft" | "in_progress" | "under_review" | "completed";
export type DifficultyLevel = "Beginner-Friendly" | "Intermediate" | "Advanced";
export type DeliverableKind = "presentation" | "memo";
export type DeliverableStatus = "draft" | "submitted";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  jobTitle?: string;
  organization?: string;
  createdAt: string;
}

export interface Workspace {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  primaryGoal: UserRole;
  experienceLevel: ExperienceLevel;
  setupCompleted: boolean;
  createdAt: string;
}

export interface OnboardingState {
  id: string;
  userId: string;
  workspaceId: string;
  steps: {
    accountCreated: boolean;
    workspaceConfigured: boolean;
    datasetsProvisioned: boolean;
    firstProjectCreated: boolean;
    firstQueryRun: boolean;
  };
  dismissedChecklist: boolean;
  initializedAt: string;
}

export type ColumnKey = "primary" | "foreign";

export interface TableColumn {
  name: string;
  dataType: string;
  key?: ColumnKey;
}

export interface TableDef {
  id: string;
  name: string;
  domain: string;
  database: string;
  schema: string;
  columnsSummary: string;
  columns: TableColumn[];
  rowCount: number;
}

export interface BusinessCase {
  id: string;
  title: string;
  domain: string;
  difficulty: DifficultyLevel;
  objective: string;
  tableIds: string[];
  target: string;
  recommendedForRoles: UserRole[];
}

export type ProjectEnvironment = "production" | "staging" | "development";

export interface Project {
  id: string;
  workspaceId: string;
  ownerId: string;
  caseId?: string;
  title: string;
  description: string;
  status: ProjectStatus;
  tableIds: string[];
  /** Prototype field used by the SQL Lab environment pill. */
  environment?: ProjectEnvironment;
  createdAt: string;
  updatedAt: string;
}

export interface SavedQuery {
  id: string;
  projectId: string;
  workspaceId: string;
  name: string;
  title: string;
  sql: string;
  createdAt: string;
  updatedAt: string;
}

export interface QueryExecution {
  id: string;
  projectId?: string;
  workspaceId: string;
  sqlPreview: string;
  status: "success" | "error";
  rows: number;
  durationMs: number;
  executedAt: string;
}

export interface Deliverable {
  id: string;
  projectId: string;
  workspaceId: string;
  title: string;
  kind: DeliverableKind;
  status: DeliverableStatus;
  updatedAt: string;
}

export interface StoreData {
  users: User[];
  workspaces: Workspace[];
  onboardingStates: OnboardingState[];
  projects: Project[];
  savedQueries: SavedQuery[];
  queryExecutions: QueryExecution[];
  deliverables: Deliverable[];
}
