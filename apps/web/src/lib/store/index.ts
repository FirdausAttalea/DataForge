import { promises as fs } from "fs";
import { join } from "path";
import type { User, Workspace, OnboardingState, Project, QueryExecution, Deliverable, StoreData } from "./types";
import { seedTables, seedBusinessCases } from "./seed";

export type { User, Workspace, OnboardingState, Project, QueryExecution, Deliverable, UserRole, ExperienceLevel, ProjectStatus, DifficultyLevel } from "./types";

// PROTOTYPE store. Replace with the real /api/v1 integration.

const DATA_DIR = process.cwd().endsWith("apps/web")
  ? join(process.cwd(), "data")
  : join(process.cwd(), "apps/web/data");
const STORE_FILE = join(DATA_DIR, "store.json");

let cachedStore: StoreData | null = null;

async function ensureDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch {
    // dir may already exist
  }
}

async function loadStore(): Promise<StoreData> {
  if (cachedStore) return cachedStore;

  try {
    const content = await fs.readFile(STORE_FILE, "utf-8");
    cachedStore = JSON.parse(content);
    return cachedStore!;
  } catch {
    cachedStore = {
      users: [],
      workspaces: [],
      onboardingStates: [],
      projects: [],
      queryExecutions: [],
      deliverables: [],
    };
    await saveStore(cachedStore);
    return cachedStore;
  }
}

async function saveStore(store: StoreData) {
  await ensureDir();
  cachedStore = store;
  await fs.writeFile(STORE_FILE, JSON.stringify(store, null, 2));
}

// Users
export async function createUser(user: Omit<User, "createdAt">): Promise<User> {
  const store = await loadStore();
  if (store.users.some((u) => u.email === user.email)) {
    throw new Error("User already exists");
  }
  const newUser: User = { ...user, createdAt: new Date().toISOString() };
  store.users.push(newUser);
  await saveStore(store);
  return newUser;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const store = await loadStore();
  return store.users.find((u) => u.email === email) || null;
}

export async function getUserById(id: string): Promise<User | null> {
  const store = await loadStore();
  return store.users.find((u) => u.id === id) || null;
}

// Workspaces
export async function createWorkspace(workspace: Omit<Workspace, "id" | "createdAt">): Promise<Workspace> {
  const store = await loadStore();
  if (store.workspaces.some((w) => w.slug === workspace.slug)) {
    throw new Error("Workspace slug already exists");
  }
  const newWorkspace: Workspace = {
    ...workspace,
    id: `ws-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  store.workspaces.push(newWorkspace);
  await saveStore(store);
  return newWorkspace;
}

export async function getWorkspaceById(id: string): Promise<Workspace | null> {
  const store = await loadStore();
  return store.workspaces.find((w) => w.id === id) || null;
}

export async function getWorkspacesByOwner(ownerId: string): Promise<Workspace[]> {
  const store = await loadStore();
  return store.workspaces.filter((w) => w.ownerId === ownerId);
}

export async function updateWorkspace(id: string, updates: Partial<Workspace>): Promise<Workspace | null> {
  const store = await loadStore();
  const idx = store.workspaces.findIndex((w) => w.id === id);
  if (idx === -1) return null;
  store.workspaces[idx] = { ...store.workspaces[idx], ...updates, id };
  await saveStore(store);
  return store.workspaces[idx];
}

// Onboarding
export async function createOnboardingState(state: Omit<OnboardingState, "id" | "initializedAt">): Promise<OnboardingState> {
  const store = await loadStore();
  const newState: OnboardingState = {
    ...state,
    id: `onb-${Date.now()}`,
    initializedAt: new Date().toISOString(),
  };
  store.onboardingStates.push(newState);
  await saveStore(store);
  return newState;
}

export async function getOnboardingState(userId: string, workspaceId: string): Promise<OnboardingState | null> {
  const store = await loadStore();
  return store.onboardingStates.find((s) => s.userId === userId && s.workspaceId === workspaceId) || null;
}

export async function updateOnboardingState(id: string, updates: Partial<OnboardingState>): Promise<OnboardingState | null> {
  const store = await loadStore();
  const idx = store.onboardingStates.findIndex((s) => s.id === id);
  if (idx === -1) return null;
  store.onboardingStates[idx] = { ...store.onboardingStates[idx], ...updates, id };
  await saveStore(store);
  return store.onboardingStates[idx];
}

// Projects
export async function createProject(project: Omit<Project, "id" | "createdAt" | "updatedAt">): Promise<Project> {
  const store = await loadStore();
  const newProject: Project = {
    ...project,
    id: `proj-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.projects.push(newProject);
  await saveStore(store);
  return newProject;
}

export async function getProjectById(id: string): Promise<Project | null> {
  const store = await loadStore();
  return store.projects.find((p) => p.id === id) || null;
}

export async function getProjectsByWorkspace(workspaceId: string): Promise<Project[]> {
  const store = await loadStore();
  return store.projects.filter((p) => p.workspaceId === workspaceId);
}

// Query Executions
export async function createQueryExecution(execution: Omit<QueryExecution, "id" | "executedAt">): Promise<QueryExecution> {
  const store = await loadStore();
  const newExecution: QueryExecution = {
    ...execution,
    id: `exec-${Date.now()}`,
    executedAt: new Date().toISOString(),
  };
  store.queryExecutions.push(newExecution);
  await saveStore(store);
  return newExecution;
}

export async function getExecutionsByWorkspace(workspaceId: string): Promise<QueryExecution[]> {
  const store = await loadStore();
  return store.queryExecutions.filter((e) => e.workspaceId === workspaceId);
}

// Deliverables
export async function createDeliverable(deliverable: Omit<Deliverable, "id" | "updatedAt">): Promise<Deliverable> {
  const store = await loadStore();
  const newDeliverable: Deliverable = {
    ...deliverable,
    id: `deliv-${Date.now()}`,
    updatedAt: new Date().toISOString(),
  };
  store.deliverables.push(newDeliverable);
  await saveStore(store);
  return newDeliverable;
}

export async function getDeliverablesByWorkspace(workspaceId: string): Promise<Deliverable[]> {
  const store = await loadStore();
  return store.deliverables.filter((d) => d.workspaceId === workspaceId);
}

// Seeded catalogs (read-only)
export function getTables() {
  return seedTables;
}

export function getTableById(id: string) {
  return seedTables.find((t) => t.id === id) || null;
}

export function getBusinessCases() {
  return seedBusinessCases;
}

export function getBusinessCaseById(id: string) {
  return seedBusinessCases.find((c) => c.id === id) || null;
}
