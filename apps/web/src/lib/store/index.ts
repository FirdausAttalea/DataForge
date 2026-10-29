import { promises as fs } from "fs";
import { join } from "path";
import { randomUUID } from "crypto";
import { pool } from "@/lib/db";
import type {
  User,
  Workspace,
  OnboardingState,
  Project,
  QueryExecution,
  Deliverable,
  StoreData,
  UserRole,
  ExperienceLevel,
  ProjectStatus,
  DeliverableKind,
  DeliverableStatus,
} from "./types";
import { seedTables, seedBusinessCases } from "./seed";

export type {
  User,
  Workspace,
  OnboardingState,
  Project,
  QueryExecution,
  Deliverable,
  UserRole,
  ExperienceLevel,
  ProjectStatus,
  DifficultyLevel,
  TableDef,
  BusinessCase,
} from "./types";

function isUuid(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

const normalizedCwd = process.cwd().replace(/\\/g, "/");
const DATA_DIR = normalizedCwd.endsWith("apps/web")
  ? join(process.cwd(), "data")
  : join(process.cwd(), "apps", "web", "data");
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
    const fallbackFile = join(process.cwd(), "apps", "web", "apps", "web", "data", "store.json");
    try {
      const fallbackContent = await fs.readFile(fallbackFile, "utf-8");
      cachedStore = JSON.parse(fallbackContent);
      await saveStore(cachedStore!);
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
}

async function saveStore(store: StoreData) {
  await ensureDir();
  cachedStore = store;
  await fs.writeFile(STORE_FILE, JSON.stringify(store, null, 2));
}

// ==========================================
// Users
// ==========================================
export async function createUser(user: Omit<User, "createdAt">): Promise<User> {
  const userId = user.id && isUuid(user.id) ? user.id : randomUUID();
  try {
    const res = await pool.query(
      `INSERT INTO users (id, email, password_hash, first_name, last_name, role, is_active, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, true, NOW())
       RETURNING id, email, password_hash, first_name, last_name, role, created_at`,
      [userId, user.email.toLowerCase().trim(), user.passwordHash, user.firstName, user.lastName, user.role]
    );
    const row = res.rows[0];
    const newUser: User = {
      id: String(row.id),
      email: row.email,
      passwordHash: row.password_hash,
      firstName: row.first_name,
      lastName: row.last_name,
      role: row.role as UserRole,
      createdAt: new Date(row.created_at).toISOString(),
    };
    const store = await loadStore();
    store.users = store.users.filter((u) => u.email.toLowerCase() !== newUser.email.toLowerCase());
    store.users.push(newUser);
    await saveStore(store);
    return newUser;
  } catch (err: any) {
    if (err?.code === "23505") {
      throw new Error("User already exists");
    }
    console.error("Postgres error in createUser, falling back to file store:", err?.message);
    const store = await loadStore();
    if (store.users.some((u) => u.email.toLowerCase() === user.email.toLowerCase())) {
      throw new Error("User already exists");
    }
    const newUser: User = { ...user, id: userId, createdAt: new Date().toISOString() };
    store.users.push(newUser);
    await saveStore(store);
    return newUser;
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const res = await pool.query(
      `SELECT id, email, password_hash, first_name, last_name, role, created_at
       FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1`,
      [email.trim()]
    );
    if (res.rows.length > 0) {
      const row = res.rows[0];
      return {
        id: String(row.id),
        email: row.email,
        passwordHash: row.password_hash,
        firstName: row.first_name,
        lastName: row.last_name,
        role: row.role as UserRole,
        createdAt: new Date(row.created_at).toISOString(),
      };
    }
  } catch (err: any) {
    console.error("Postgres error in getUserByEmail:", err?.message);
  }
  const store = await loadStore();
  return store.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
}

export async function getUserById(id: string): Promise<User | null> {
  try {
    const res = await pool.query(
      `SELECT id, email, password_hash, first_name, last_name, role, created_at
       FROM users WHERE id::text = $1 LIMIT 1`,
      [id]
    );
    if (res.rows.length > 0) {
      const row = res.rows[0];
      return {
        id: String(row.id),
        email: row.email,
        passwordHash: row.password_hash,
        firstName: row.first_name,
        lastName: row.last_name,
        role: row.role as UserRole,
        createdAt: new Date(row.created_at).toISOString(),
      };
    }
  } catch (err: any) {
    console.error("Postgres error in getUserById:", err?.message);
  }
  const store = await loadStore();
  return store.users.find((u) => u.id === id) || null;
}

// ==========================================
// Workspaces
// ==========================================
export async function createWorkspace(workspace: Omit<Workspace, "id" | "createdAt">): Promise<Workspace> {
  const workspaceId = `ws-${Date.now()}`;
  try {
    let ownerUuid = workspace.ownerId;
    if (!isUuid(ownerUuid)) {
      const u = await getUserById(workspace.ownerId);
      if (u && isUuid(u.id)) {
        ownerUuid = u.id;
      }
    }

    if (isUuid(ownerUuid)) {
      const res = await pool.query(
        `INSERT INTO workspaces (id, owner_id, name, slug, primary_goal, experience_level, setup_completed, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
         RETURNING *`,
        [
          workspaceId,
          ownerUuid,
          workspace.name,
          workspace.slug,
          workspace.primaryGoal || "data_analyst",
          workspace.experienceLevel || "intermediate",
          workspace.setupCompleted ?? true,
        ]
      );
      const row = res.rows[0];
      const newWs: Workspace = {
        id: String(row.id),
        ownerId: String(row.owner_id),
        name: row.name,
        slug: row.slug,
        primaryGoal: row.primary_goal as UserRole,
        experienceLevel: row.experience_level as ExperienceLevel,
        setupCompleted: row.setup_completed,
        createdAt: new Date(row.created_at).toISOString(),
      };
      const store = await loadStore();
      store.workspaces.push(newWs);
      await saveStore(store);
      return newWs;
    }
  } catch (err: any) {
    if (err?.code === "23505") {
      throw new Error("Workspace slug already exists");
    }
    console.error("Postgres error in createWorkspace:", err?.message);
  }

  const store = await loadStore();
  if (store.workspaces.some((w) => w.slug === workspace.slug)) {
    throw new Error("Workspace slug already exists");
  }
  const newWorkspace: Workspace = {
    ...workspace,
    id: workspaceId,
    createdAt: new Date().toISOString(),
  };
  store.workspaces.push(newWorkspace);
  await saveStore(store);
  return newWorkspace;
}

export async function getWorkspaceById(id: string): Promise<Workspace | null> {
  try {
    const res = await pool.query(`SELECT * FROM workspaces WHERE id = $1 LIMIT 1`, [id]);
    if (res.rows.length > 0) {
      const row = res.rows[0];
      return {
        id: String(row.id),
        ownerId: String(row.owner_id),
        name: row.name,
        slug: row.slug,
        primaryGoal: row.primary_goal as UserRole,
        experienceLevel: row.experience_level as ExperienceLevel,
        setupCompleted: row.setup_completed,
        createdAt: new Date(row.created_at).toISOString(),
      };
    }
  } catch (err: any) {
    console.error("Postgres error in getWorkspaceById:", err?.message);
  }
  const store = await loadStore();
  return store.workspaces.find((w) => w.id === id) || null;
}

export async function getWorkspacesByOwner(ownerId: string): Promise<Workspace[]> {
  try {
    const res = await pool.query(
      `SELECT * FROM workspaces WHERE owner_id::text = $1 ORDER BY created_at DESC`,
      [ownerId]
    );
    if (res.rows.length > 0) {
      return res.rows.map((row) => ({
        id: String(row.id),
        ownerId: String(row.owner_id),
        name: row.name,
        slug: row.slug,
        primaryGoal: row.primary_goal as UserRole,
        experienceLevel: row.experience_level as ExperienceLevel,
        setupCompleted: row.setup_completed,
        createdAt: new Date(row.created_at).toISOString(),
      }));
    }
  } catch (err: any) {
    console.error("Postgres error in getWorkspacesByOwner:", err?.message);
  }
  const store = await loadStore();
  return store.workspaces.filter((w) => w.ownerId === ownerId);
}

export async function updateWorkspace(id: string, updates: Partial<Workspace>): Promise<Workspace | null> {
  try {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (updates.name !== undefined) {
      fields.push(`name = $${idx++}`);
      values.push(updates.name);
    }
    if (updates.slug !== undefined) {
      fields.push(`slug = $${idx++}`);
      values.push(updates.slug);
    }
    if (updates.setupCompleted !== undefined) {
      fields.push(`setup_completed = $${idx++}`);
      values.push(updates.setupCompleted);
    }
    if (updates.primaryGoal !== undefined) {
      fields.push(`primary_goal = $${idx++}`);
      values.push(updates.primaryGoal);
    }
    if (updates.experienceLevel !== undefined) {
      fields.push(`experience_level = $${idx++}`);
      values.push(updates.experienceLevel);
    }

    if (fields.length > 0) {
      values.push(id);
      const res = await pool.query(
        `UPDATE workspaces SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`,
        values
      );
      if (res.rows.length > 0) {
        const row = res.rows[0];
        return {
          id: String(row.id),
          ownerId: String(row.owner_id),
          name: row.name,
          slug: row.slug,
          primaryGoal: row.primary_goal as UserRole,
          experienceLevel: row.experience_level as ExperienceLevel,
          setupCompleted: row.setup_completed,
          createdAt: new Date(row.created_at).toISOString(),
        };
      }
    }
  } catch (err: any) {
    console.error("Postgres error in updateWorkspace:", err?.message);
  }

  const store = await loadStore();
  const idx = store.workspaces.findIndex((w) => w.id === id);
  if (idx === -1) return null;
  store.workspaces[idx] = { ...store.workspaces[idx], ...updates, id };
  await saveStore(store);
  return store.workspaces[idx];
}

// ==========================================
// Onboarding
// ==========================================
export async function createOnboardingState(
  state: Omit<OnboardingState, "id" | "initializedAt">
): Promise<OnboardingState> {
  const onbId = `onb-${Date.now()}`;
  try {
    if (isUuid(state.userId)) {
      const res = await pool.query(
        `INSERT INTO onboarding_states (id, user_id, workspace_id, steps, dismissed_checklist, initialized_at)
         VALUES ($1, $2, $3, $4, $5, NOW())
         RETURNING *`,
        [onbId, state.userId, state.workspaceId, JSON.stringify(state.steps), state.dismissedChecklist]
      );
      const row = res.rows[0];
      const newOnb: OnboardingState = {
        id: String(row.id),
        userId: String(row.user_id),
        workspaceId: row.workspace_id,
        steps: row.steps,
        dismissedChecklist: row.dismissed_checklist,
        initializedAt: new Date(row.initialized_at).toISOString(),
      };
      const store = await loadStore();
      store.onboardingStates.push(newOnb);
      await saveStore(store);
      return newOnb;
    }
  } catch (err: any) {
    console.error("Postgres error in createOnboardingState:", err?.message);
  }

  const store = await loadStore();
  const newState: OnboardingState = {
    ...state,
    id: onbId,
    initializedAt: new Date().toISOString(),
  };
  store.onboardingStates.push(newState);
  await saveStore(store);
  return newState;
}

export async function getOnboardingState(userId: string, workspaceId: string): Promise<OnboardingState | null> {
  try {
    const res = await pool.query(
      `SELECT * FROM onboarding_states WHERE user_id::text = $1 AND workspace_id = $2 LIMIT 1`,
      [userId, workspaceId]
    );
    if (res.rows.length > 0) {
      const row = res.rows[0];
      return {
        id: String(row.id),
        userId: String(row.user_id),
        workspaceId: row.workspace_id,
        steps: row.steps,
        dismissedChecklist: row.dismissed_checklist,
        initializedAt: new Date(row.initialized_at).toISOString(),
      };
    }
  } catch (err: any) {
    console.error("Postgres error in getOnboardingState:", err?.message);
  }
  const store = await loadStore();
  return store.onboardingStates.find((s) => s.userId === userId && s.workspaceId === workspaceId) || null;
}

export async function updateOnboardingState(
  id: string,
  updates: Partial<OnboardingState>
): Promise<OnboardingState | null> {
  try {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (updates.steps !== undefined) {
      fields.push(`steps = $${idx++}`);
      values.push(JSON.stringify(updates.steps));
    }
    if (updates.dismissedChecklist !== undefined) {
      fields.push(`dismissed_checklist = $${idx++}`);
      values.push(updates.dismissedChecklist);
    }

    if (fields.length > 0) {
      values.push(id);
      const res = await pool.query(
        `UPDATE onboarding_states SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`,
        values
      );
      if (res.rows.length > 0) {
        const row = res.rows[0];
        return {
          id: String(row.id),
          userId: String(row.user_id),
          workspaceId: row.workspace_id,
          steps: row.steps,
          dismissedChecklist: row.dismissed_checklist,
          initializedAt: new Date(row.initialized_at).toISOString(),
        };
      }
    }
  } catch (err: any) {
    console.error("Postgres error in updateOnboardingState:", err?.message);
  }

  const store = await loadStore();
  const idx = store.onboardingStates.findIndex((s) => s.id === id);
  if (idx === -1) return null;
  store.onboardingStates[idx] = { ...store.onboardingStates[idx], ...updates, id };
  await saveStore(store);
  return store.onboardingStates[idx];
}

// ==========================================
// Projects
// ==========================================
export async function createProject(project: Omit<Project, "id" | "createdAt" | "updatedAt">): Promise<Project> {
  const projId = isUuid(project.ownerId) ? randomUUID() : `proj-${Date.now()}`;
  try {
    if (isUuid(project.ownerId)) {
      const res = await pool.query(
        `INSERT INTO projects (id, owner_id, name, workspace_id, title, description, case_id, status, table_ids, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
         RETURNING *`,
        [
          projId,
          project.ownerId,
          project.title,
          project.workspaceId,
          project.title,
          project.description || "",
          project.caseId || "",
          project.status || "draft",
          JSON.stringify(project.tableIds || []),
        ]
      );
      const row = res.rows[0];
      const newProj: Project = {
        id: String(row.id),
        workspaceId: row.workspace_id,
        ownerId: String(row.owner_id),
        caseId: row.case_id || undefined,
        title: row.title || row.name,
        description: row.description || "",
        status: (row.status || "draft") as ProjectStatus,
        tableIds: row.table_ids || [],
        createdAt: new Date(row.created_at).toISOString(),
        updatedAt: new Date(row.updated_at).toISOString(),
      };
      const store = await loadStore();
      store.projects.push(newProj);
      await saveStore(store);
      return newProj;
    }
  } catch (err: any) {
    console.error("Postgres error in createProject:", err?.message);
  }

  const store = await loadStore();
  const newProject: Project = {
    ...project,
    id: projId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.projects.push(newProject);
  await saveStore(store);
  return newProject;
}

export async function getProjectById(id: string): Promise<Project | null> {
  try {
    const res = await pool.query(`SELECT * FROM projects WHERE id::text = $1 LIMIT 1`, [id]);
    if (res.rows.length > 0) {
      const row = res.rows[0];
      return {
        id: String(row.id),
        workspaceId: row.workspace_id,
        ownerId: String(row.owner_id),
        caseId: row.case_id || undefined,
        title: row.title || row.name,
        description: row.description || "",
        status: (row.status || "draft") as ProjectStatus,
        tableIds: row.table_ids || [],
        createdAt: new Date(row.created_at).toISOString(),
        updatedAt: new Date(row.updated_at).toISOString(),
      };
    }
  } catch (err: any) {
    console.error("Postgres error in getProjectById:", err?.message);
  }
  const store = await loadStore();
  return store.projects.find((p) => p.id === id) || null;
}

export async function getProjectsByWorkspace(workspaceId: string): Promise<Project[]> {
  try {
    const res = await pool.query(
      `SELECT * FROM projects WHERE workspace_id = $1 ORDER BY created_at DESC`,
      [workspaceId]
    );
    if (res.rows.length > 0) {
      return res.rows.map((row) => ({
        id: String(row.id),
        workspaceId: row.workspace_id,
        ownerId: String(row.owner_id),
        caseId: row.case_id || undefined,
        title: row.title || row.name,
        description: row.description || "",
        status: (row.status || "draft") as ProjectStatus,
        tableIds: row.table_ids || [],
        createdAt: new Date(row.created_at).toISOString(),
        updatedAt: new Date(row.updated_at).toISOString(),
      }));
    }
  } catch (err: any) {
    console.error("Postgres error in getProjectsByWorkspace:", err?.message);
  }
  const store = await loadStore();
  return store.projects.filter((p) => p.workspaceId === workspaceId);
}

// ==========================================
// Query Executions
// ==========================================
export async function createQueryExecution(
  execution: Omit<QueryExecution, "id" | "executedAt">
): Promise<QueryExecution> {
  const execId = `exec-${Date.now()}`;
  try {
    const res = await pool.query(
      `INSERT INTO query_executions (id, project_id, workspace_id, sql_preview, status, rows, duration_ms, executed_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING *`,
      [
        execId,
        execution.projectId || null,
        execution.workspaceId,
        execution.sqlPreview,
        execution.status,
        execution.rows,
        execution.durationMs,
      ]
    );
    const row = res.rows[0];
    const newExec: QueryExecution = {
      id: String(row.id),
      projectId: row.project_id || undefined,
      workspaceId: row.workspace_id,
      sqlPreview: row.sql_preview,
      status: row.status,
      rows: row.rows,
      durationMs: row.duration_ms,
      executedAt: new Date(row.executed_at).toISOString(),
    };
    const store = await loadStore();
    store.queryExecutions.push(newExec);
    await saveStore(store);
    return newExec;
  } catch (err: any) {
    console.error("Postgres error in createQueryExecution:", err?.message);
  }

  const store = await loadStore();
  const newExecution: QueryExecution = {
    ...execution,
    id: execId,
    executedAt: new Date().toISOString(),
  };
  store.queryExecutions.push(newExecution);
  await saveStore(store);
  return newExecution;
}

export async function getExecutionsByWorkspace(workspaceId: string): Promise<QueryExecution[]> {
  try {
    const res = await pool.query(
      `SELECT * FROM query_executions WHERE workspace_id = $1 ORDER BY executed_at DESC`,
      [workspaceId]
    );
    if (res.rows.length > 0) {
      return res.rows.map((row) => ({
        id: String(row.id),
        projectId: row.project_id || undefined,
        workspaceId: row.workspace_id,
        sqlPreview: row.sql_preview,
        status: row.status,
        rows: row.rows,
        durationMs: row.duration_ms,
        executedAt: new Date(row.executed_at).toISOString(),
      }));
    }
  } catch (err: any) {
    console.error("Postgres error in getExecutionsByWorkspace:", err?.message);
  }
  const store = await loadStore();
  return store.queryExecutions.filter((e) => e.workspaceId === workspaceId);
}

// ==========================================
// Deliverables
// ==========================================
export async function createDeliverable(
  deliverable: Omit<Deliverable, "id" | "updatedAt">
): Promise<Deliverable> {
  const delivId = `deliv-${Date.now()}`;
  try {
    const res = await pool.query(
      `INSERT INTO deliverables (id, project_id, workspace_id, title, kind, status, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING *`,
      [
        delivId,
        deliverable.projectId || null,
        deliverable.workspaceId,
        deliverable.title,
        deliverable.kind,
        deliverable.status,
      ]
    );
    const row = res.rows[0];
    const newDeliv: Deliverable = {
      id: String(row.id),
      projectId: row.project_id || "",
      workspaceId: row.workspace_id,
      title: row.title,
      kind: row.kind as DeliverableKind,
      status: row.status as DeliverableStatus,
      updatedAt: new Date(row.updated_at).toISOString(),
    };
    const store = await loadStore();
    store.deliverables.push(newDeliv);
    await saveStore(store);
    return newDeliv;
  } catch (err: any) {
    console.error("Postgres error in createDeliverable:", err?.message);
  }

  const store = await loadStore();
  const newDeliverable: Deliverable = {
    ...deliverable,
    id: delivId,
    updatedAt: new Date().toISOString(),
  };
  store.deliverables.push(newDeliverable);
  await saveStore(store);
  return newDeliverable;
}

export async function getDeliverablesByWorkspace(workspaceId: string): Promise<Deliverable[]> {
  try {
    const res = await pool.query(
      `SELECT * FROM deliverables WHERE workspace_id = $1 ORDER BY updated_at DESC`,
      [workspaceId]
    );
    if (res.rows.length > 0) {
      return res.rows.map((row) => ({
        id: String(row.id),
        projectId: row.project_id || "",
        workspaceId: row.workspace_id,
        title: row.title,
        kind: row.kind as DeliverableKind,
        status: row.status as DeliverableStatus,
        updatedAt: new Date(row.updated_at).toISOString(),
      }));
    }
  } catch (err: any) {
    console.error("Postgres error in getDeliverablesByWorkspace:", err?.message);
  }
  const store = await loadStore();
  return store.deliverables.filter((d) => d.workspaceId === workspaceId);
}

// ==========================================
// Seeded catalogs (read-only)
// ==========================================
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
