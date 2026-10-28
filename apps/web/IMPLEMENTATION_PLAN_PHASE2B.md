# DataForge Frontend - Phase 2 Implementation Plan

## Completed (Just Now)
✅ Store layer with file persistence (`src/lib/store/`)
✅ Domain types and seed data
✅ Password hashing utilities
✅ provisionWorkspace function (idempotent, atomic)
✅ Auth API routes (/api/v1/auth/register, /api/v1/auth/login)
✅ Workspace creation API route with store integration
✅ Workspace-setup page (primaryGoal, experienceLevel, starter project)
✅ Dashboard first-time state detection and store data binding
✅ Middleware using getRedirectTarget helper
✅ GettingStarted checklist component
✅ EmptyState reusable component

---

## REMAINING WORK - PRIORITY ORDER

### TIER 1: Core Pages (Critical Path)
These complete the first-time user flow.

#### 1. Create `/projects/new` (Project Creation Form)
**File:** `src/app/(app)/projects/new/page.tsx`
**Complexity:** Medium
**Tasks:**
- Render form with: title, description, linked business case (dropdown), tables (multi-select from catalog)
- Pre-select tables from chosen case
- Submit → create Project via store
- Set onboarding.firstProjectCreated = true if it's the first project
- Redirect to `/projects/[id]` with new project ID
- Server-side validation of caseId, tableIds against catalog

**Key Code Pattern:**
```typescript
const result = await createProject({
  workspaceId: workspace.id,
  ownerId: user.id,
  caseId: body.caseId,
  title: body.title,
  description: body.description,
  status: "draft",
  tableIds: body.tableIds,
});

if (onboarding && !onboarding.steps.firstProjectCreated) {
  await updateOnboardingState(onboarding.id, {
    steps: { ...onboarding.steps, firstProjectCreated: true }
  });
}
```

#### 2. Create `/projects/[id]` (Project Detail Page)
**File:** `src/app/(app)/projects/[id]/page.tsx`
**Complexity:** Low
**Tasks:**
- Read projectId from params
- Fetch project via store
- Verify ownership (projectId.ownerId === session.user.id), else 404
- Display: title, status, description, linked case (if caseId), tables
- Show "SQL Lab coming soon" button that links to `/sql-lab?projectId=[id]`
- Skeleton: "Continue working" link if caseId exists, leads to `/cases/[id]`
- Add "Edit" and "Delete" buttons (not functional, placeholder)

**Route Guard:**
```typescript
if (project.workspaceId !== workspace.id || project.ownerId !== user.id) {
  notFound();
}
```

#### 3. Create `/cases/[id]` (Case Brief Page)
**File:** `src/app/(app)/cases/[id]/page.tsx`
**Complexity:** Medium
**Tasks:**
- Read caseId from params
- Fetch BusinessCase from store
- Display: title, objective, difficulty badge, domain, target, tables (with names and row counts)
- "Start New Project" button → navigates to `/projects/new?caseId=[id]` (pre-fills form)
- Empty state if case not found (404)
- No ownership check (cases are global catalog)

**Rendering Pattern:**
```typescript
const businessCase = getBusinessCaseById(caseId);
if (!businessCase) notFound();

const tables = businessCase.tableIds.map(id => getTableById(id)).filter(Boolean);
```

---

### TIER 2: Dashboard Component Updates (Derived Data)
These update existing components to show real data instead of mocks.

#### 4. Update `ContinueWorking` Component
**File:** `src/components/dashboard/ContinueWorking.tsx`
**Changes:**
- Accept `projects: Project[]` and `totalCount: number`
- Show first 3 projects as before
- "View all projects (N)" link → show total count (e.g., "View all projects (7)")
- Update lastAction to derive from project.updatedAt (e.g., "Edited 2h ago")
- Remove mock data

#### 5. Update `CasePanel` Component
**File:** `src/components/dashboard/CasePanel.tsx`
**Changes:**
- Accept `role: UserRole` prop
- Sort BusinessCases by recommendedForRoles (role appears first)
- Add a visual indicator (star/badge) on the recommended case for the user's role
- Pass full BusinessCase objects instead of mock interface
- "View case brief" links now work: `/cases/[caseId]`
- Filter Domain button (placeholder, no functionality)

#### 6. Update `RecentExecutions` Component
**File:** `src/components/dashboard/RecentExecutions.tsx`
**Changes:**
- Accept `executions: QueryExecution[]`
- Show "No queries yet" EmptyState if empty
- Format executedAt timestamp (e.g., "14 rows · 118ms · 2h ago")
- Query preview is already in QueryExecution.sqlPreview
- Keep "View complete audit trail" as placeholder link

#### 7. Update `SavedDeliverables` Component
**File:** `src/components/dashboard/SavedDeliverables.tsx`
**Changes:**
- Accept `deliverables: Deliverable[]`
- Show "No deliverables yet" EmptyState if empty
- Map deliverable.kind to icon (presentation → slides icon, memo → document icon)
- Render deliverable.status ("Draft" vs "Submitted")
- Each deliverable links to `/projects/[projectId]` (via deliverable.projectId)

#### 8. Update `ContinueWorking` & Project Card to Link to Project Detail
**File:** `src/components/dashboard/ContinueWorking.tsx`, `src/components/dashboard/ProjectCard.tsx`
**Changes:**
- Project card title clicks → `/projects/[id]`
- "Open in SQL Lab" → `/sql-lab?projectId=[id]`
- "Continue Analysis" → `/projects/[id]`
- "View Deliverables" → `/projects/[id]`

---

### TIER 3: List Pages (Lower Priority)
These show workspace-scoped lists of entities.

#### 9. Update `/projects` (My Projects List)
**File:** `src/app/(app)/projects/page.tsx`
**Changes:**
- Fetch projects for current workspace via getProjectsByWorkspace()
- Display as grid or list:
  - Project name, status badge, linked case (if any), last updated, table count
  - Each row/card clickable → `/projects/[id]`
- Empty state: "No projects yet. Create your first one." with button → `/projects/new`
- Filter by status (draft, in_progress, under_review, completed)
- "Create Project" button → `/projects/new`

#### 10. Update `/cases` (Explore Business Cases)
**File:** `src/app/(app)/cases/page.tsx`
**Changes:**
- List all BusinessCases from store (global catalog)
- Sort by recommendedForRoles (user's role appears first)
- Each case row:
  - Title, difficulty badge, domain, description, table names
  - "View case brief" link → `/cases/[id]`
  - Recommended case has a visual indicator (star)
- Filter by difficulty dropdown
- Filter by domain dropdown

---

### TIER 4: Auth Integration
These complete the auth/sign-up flow using the new store.

#### 11. Update Sign-Up Page to Use Store
**File:** `src/app/sign-up/page.tsx`
**Changes:**
- onSubmit calls `/api/v1/auth/register` (already done in API route)
- Backend now hashes password and creates User record via store
- No client-side password handling changes needed

#### 12. Update Sign-In Page to Use Store
**File:** `src/app/sign-in/page.tsx`
**Changes:**
- Already calls `/api/v1/auth/login`
- Backend validates credentials against stored hash
- No changes needed (API route handles store integration)

---

### TIER 5: Tests
Unit, component, and e2e tests for data isolation and core logic.

#### 13. Unit Tests
**File:** `src/lib/store/__tests__/store.test.ts`
**Tests:**
- `provisionWorkspace` idempotency: calling twice returns same workspace
- `provisionWorkspace` atomicity: partial failure leaves no partial state
- Role-to-case mapping: each role gets correct recommended case
- Data isolation: user1's projects not visible to user2 (workspace filter works)
- Password hashing: verify vs wrong password, timing safety

**Example:**
```typescript
test("provisionWorkspace is idempotent", async () => {
  const result1 = await provisionWorkspace(userId, setupInput);
  const result2 = await provisionWorkspace(userId, setupInput);
  expect(result1.workspaceId).toBe(result2.workspaceId);
});

test("user1 cannot see user2 projects", async () => {
  const proj1 = await createProject({ workspaceId: ws1.id, ownerId: user1.id, ... });
  const proj2List = await getProjectsByWorkspace(ws2.id);
  expect(proj2List).not.toContainEqual(proj1);
});
```

#### 14. Component Tests
**File:** `src/components/dashboard/__tests__/dashboard.test.tsx` (if React Testing Library)
**Tests:**
- Dashboard renders first-time state (GettingStarted visible, zero stats)
- Dashboard renders returning state (Continue Working visible, real counts)
- Different users see different data (workspace isolation)
- Stat cards show derived counts correctly (+N chip logic)

#### 15. E2E Tests (if Playwright installed)
**File:** `e2e/auth-flow.spec.ts`
**Flow:**
1. Sign up as "Alex Chen", select "Analytics Engineer"
2. Complete workspace setup ("alex-analytics", Intermediate, create starter project)
3. See dashboard with first-time state (GettingStarted visible, 1 project in sidebar)
4. Create a second project via "Create Project" → form → submit
5. Verify dashboard updates (stat count, Continue Working shows 2 projects)
6. Click project title → see project detail page
7. Sign out
8. Sign in as "Alex Chen"
9. Verify dashboard restores (same projects, starter project still there)
10. Sign up as "Jordan Kumar", verify Alex's data not visible

---

## Implementation Order (Recommended)

1. **FIRST:** Tier 1 (projects/new, projects/[id], cases/[id]) - unblocks core flow
2. **SECOND:** Tier 2 (dashboard component updates) - makes dashboard show real data
3. **THIRD:** Tier 3 (projects list, cases list) - navigation completeness
4. **FOURTH:** Tier 5 (tests) - validation
5. **OPTIONAL:** Tier 4 (auth updates) - likely already working via API routes

---

## Key Patterns to Reuse

### Server Component with Store Access
```typescript
import { getProjectsByWorkspace } from "@/lib/store";

export default async function ProjectsPage() {
  const workspace = await getWorkspace(workspaceId);
  const projects = await getProjectsByWorkspace(workspace.id);
  
  return <div>{projects.map(p => ...)}</div>;
}
```

### Ownership Check (Always)
```typescript
if (project.workspaceId !== workspace.id || project.ownerId !== user.id) {
  notFound();
}
```

### Derive Display Values from Data
```typescript
const activeProjects = projects.filter(p => p.status !== "completed");
const value = `${activeProjects.length} active investigations`;
```

---

## Files NOT to Change (Already Complete)
- `src/lib/store/index.ts` (persistence layer)
- `src/lib/store/types.ts` (domain model)
- `src/lib/store/seed.ts` (seeded catalogs)
- `src/lib/store/recommendations.ts` (role mapping)
- `src/lib/store/provision.ts` (workspace provisioning)
- `src/lib/utils/auth.ts` (auth helpers)
- `middleware.ts` (route guards)
- `src/app/api/v1/workspaces/route.ts` (workspace creation)
- `src/app/api/v1/auth/register/route.ts` (registration)
- `src/app/api/v1/auth/login/route.ts` (login)
- `src/app/workspace-setup/page.tsx` (setup form)
- `src/app/(app)/dashboard/page.tsx` (dashboard)
- `src/components/dashboard/GettingStarted.tsx` (checklist)
- `src/components/dashboard/EmptyState.tsx` (empty state)

---

## Validation Checklist Before Final PR

- [ ] Type check: `npm run build` passes
- [ ] Lint: `npm run lint` shows no new errors
- [ ] All Tier 1 pages exist and render (projects/new, projects/[id], cases/[id])
- [ ] Dashboard shows correct first-time state (GettingStarted visible, 0 projects, Creating first project updates stats)
- [ ] Dashboard shows correct returning state (GettingStarted hidden, stat counts match store data)
- [ ] Project creation works: form → store → detail page updates
- [ ] Data isolation: two users in same dev session see only their own data
- [ ] Persistence: restart dev server, data still present (check `apps/web/data/store.json`)
- [ ] All internal links resolve (no 404s on navigation)
- [ ] Repository search shows no leftover hardcoded demo data outside seed files

---

## Known Limitations / Future Work

1. **No real auth:** Session is fake cookie + store. Real backend replaces entire store layer.
2. **SQL execution not implemented:** /sql-lab is placeholder. No actual query execution.
3. **Deliverables creation:** No UI to create deliverables. Only seeded data shown.
4. **Queries from dashboard:** No way to run queries from dashboard (SQL Lab placeholder).
5. **Pagination:** Large project/case lists not paginated (acceptable for prototype).
6. **File uploads:** "Upload Schema" is placeholder button.

---

## Commands to Run After Each Phase

```bash
# After each file change:
npm run lint           # Fix warnings
npm run build          # Ensure TypeScript passes

# Before final commit:
npm run lint
npm run build
npm run dev            # Manual testing flow

# Check persistence:
cat apps/web/data/store.json  # Verify JSON valid

# Search for hardcoded demo:
grep -r "Elena\|Rostova\|acme-analytics" src/ --exclude-dir=.next
```

---

## Summary

**Phase 1 (Completed):** Data model, store layer, first-time provisioning logic.
**Phase 2A (Completed):** API routes, workspace setup, dashboard, middleware.
**Phase 2B (This Plan):** Project pages, component updates, list pages, tests.

**Expected Outcome:** A fully functional first-time user flow with:
- Sign up → workspace setup → dashboard (first-time state with checklist)
- Create project → project detail page
- Browse cases → case detail → start project from case
- Returning user sees real data from store (not mocks)
- Two users see isolated data (workspace + ownership checks)
- Data persists across dev server restarts
- All links resolve, no dead routes
