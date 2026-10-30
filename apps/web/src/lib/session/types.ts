export type UserRole = "data_analyst" | "analytics_engineer" | "learner";

export interface SessionUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  jobTitle?: string;
  organization?: string;
  avatarUrl?: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  setupCompleted: boolean;
}

export interface SessionContext {
  user: SessionUser | null;
  workspace: Workspace | null;
  isAuthenticated: boolean;
}

export function getInitials(user: SessionUser): string {
  return (user.firstName[0] + user.lastName[0]).toUpperCase();
}

export function getDisplayName(user: SessionUser): string {
  return `${user.firstName} ${user.lastName}`;
}

export function getWorkspaceHostLabel(workspace: Workspace): string {
  return `${workspace.slug}-replica-prod`;
}

export function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    data_analyst: "Data Analyst",
    analytics_engineer: "Analytics Engineer",
    learner: "Learner / Career",
  };
  return labels[role] ?? role;
}

