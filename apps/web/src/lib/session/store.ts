import type { Workspace } from "./index";

export type WorkspaceStore = Map<string, Workspace>;

const store: WorkspaceStore = new Map();

export function createWorkspace(userId: string, name: string, slug: string): Workspace {
  const workspace: Workspace = {
    id: `ws-${Date.now()}`,
    name,
    slug,
    createdAt: new Date().toISOString(),
    setupCompleted: true,
  };
  store.set(userId, workspace);
  return workspace;
}

export function getWorkspace(userId: string): Workspace | null {
  return store.get(userId) || null;
}
