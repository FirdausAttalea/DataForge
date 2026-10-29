import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { ContinueWorking } from "@/components/dashboard/ContinueWorking";
import { CasePanel } from "@/components/dashboard/CasePanel";
import { ExecutionCluster } from "@/components/dashboard/ExecutionCluster";
import { RecentExecutions } from "@/components/dashboard/RecentExecutions";
import { SavedDeliverables } from "@/components/dashboard/SavedDeliverables";
import { GettingStarted } from "@/components/dashboard/GettingStarted";
import { getSession } from "@/lib/session";
import {
  getUserById,
  getWorkspaceById,
  getProjectsByWorkspace,
  getExecutionsByWorkspace,
  getDeliverablesByWorkspace,
  getOnboardingState,
  updateOnboardingState,
  getTables,
  getBusinessCases,
} from "@/lib/store";
import { type Project as MockProject } from "@/lib/mock/dashboard";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session.isAuthenticated || !session.user) {
    redirect("/sign-in");
  }

  if (!session.workspace) {
    redirect("/workspace-setup");
  }

  const user = await getUserById(session.user.id);
  const workspace = await getWorkspaceById(session.workspace.id);

  if (!user || !workspace) {
    redirect("/sign-in");
  }

  const projects = await getProjectsByWorkspace(workspace.id);
  const executions = await getExecutionsByWorkspace(workspace.id);
  const deliverables = await getDeliverablesByWorkspace(workspace.id);
  const onboarding = await getOnboardingState(user.id, workspace.id);

  const isFirstTime = projects.length === 0;

  const mappedProjects: MockProject[] = projects.map((p) => ({
    id: p.id,
    title: p.title,
    domain: p.caseId || "General",
    status: p.status === "in_progress" ? "In progress" : p.status === "under_review" ? "Completed" : "Draft",
    description: p.description,
    tables: [], 
    lastAction: { icon: "clock" as const, text: "Updated recently" },
    actionLink: { text: "Open →", href: `/projects/${p.id}` },
  }));

  const activeProjects = mappedProjects.filter((p) => p.status !== "Completed");
  const inProgressCount = projects.filter((p) => p.status === "in_progress").length;
  const underReviewCount = projects.filter((p) => p.status === "under_review").length;

  const allTables = getTables();
  const businessCases = getBusinessCases();
  const visibleTables = allTables.slice(0, 3);
  const hiddenTableCount = Math.max(0, allTables.length - visibleTables.length);

  const today = new Date().toISOString().split("T")[0];
  const todayExecutions = executions.filter((e) => e.executedAt.startsWith(today));
  
  const mappedExecutions = todayExecutions.slice(0, 2).map((e) => ({
    status: "200 OK" as const,
    rows: e.rows,
    latency: e.durationMs,
    query: e.sqlPreview,
  }));

  const mappedDeliverables = deliverables.slice(0, 2).map((d) => ({
    id: d.id,
    title: d.title,
    subtitle: `${d.status} ${d.kind}`,
    type: d.kind as "presentation" | "pdf",
  }));

  const avgLatency =
    todayExecutions.length > 0
      ? Math.round(todayExecutions.reduce((sum, e) => sum + e.durationMs, 0) / todayExecutions.length)
      : 0;

  const draftDeliverables = deliverables.filter((d) => d.status === "draft");

  const onboardingSteps = onboarding
    ? [
        { key: "workspace", label: "Configure your workspace", completed: onboarding.steps.workspaceConfigured },
        { key: "datasets", label: "Datasets provisioned and ready", completed: onboarding.steps.datasetsProvisioned },
        {
          key: "project",
          label: "Create your first project",
          completed: onboarding.steps.firstProjectCreated,
          href: "/projects/new",
        },
        {
          key: "query",
          label: "Run your first SQL query",
          completed: onboarding.steps.firstQueryRun,
          href: "/sql-lab",
        },
      ]
    : [];

  async function dismissChecklist() {
    "use server";
    if (onboarding) {
      await updateOnboardingState(onboarding.id, { dismissedChecklist: true });
    }
  }

  return (
    <div className="p-6 md:p-8">
      <PageHeader user={session.user} workspace={session.workspace} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          label="Active Projects"
          value={isFirstTime ? "0 active investigations" : `${projects.length} active investigations`}
          footer={
            isFirstTime ? (
              <span className="text-slate-500">No projects yet</span>
            ) : (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                  <span>{inProgressCount} in progress</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                  <span>{underReviewCount} under review</span>
                </div>
              </div>
            )
          }
          iconType="folder"
        />
        <StatCard
          label="Connected Schemas"
          value={`${allTables.length} production tables`}
          footer={
            <div className="flex flex-wrap gap-1.5">
              {visibleTables.map((t) => (
                <span key={t.id} className="inline-block px-2 py-1 bg-white text-xs font-mono rounded border border-slate-200">
                  {t.name}
                </span>
              ))}
              {hiddenTableCount > 0 && (
                <span className="inline-block px-2 py-1 bg-slate-200 text-xs font-mono rounded text-slate-600">
                  +{hiddenTableCount}
                </span>
              )}
            </div>
          }
          iconType="database"
        />
        <StatCard
          label="Queries Executed Today"
          value={`${todayExecutions.length} invocations`}
          footer={
            todayExecutions.length > 0 ? (
              <div className="flex items-center justify-between">
                <span>Avg Latency:</span>
                <span className="text-green-600 font-semibold flex items-center gap-1">⚡ {avgLatency}ms</span>
              </div>
            ) : (
              <span className="text-slate-500">No queries today</span>
            )
          }
          iconType="zap"
        />
        <StatCard
          label="Deliverables Status"
          value={`${draftDeliverables.length} drafts pending`}
          footer={
            draftDeliverables.length > 0 ? (
              <div className="flex items-center justify-between">
                <span className="truncate">{draftDeliverables[0].title}...</span>
                <a href={`/projects/${draftDeliverables[0].projectId}`} className="text-indigo-600 font-semibold whitespace-nowrap ml-2">
                  Review
                </a>
              </div>
            ) : (
              <span className="text-slate-500">No pending drafts</span>
            )
          }
          iconType="file"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {isFirstTime && onboarding && !onboarding.dismissedChecklist ? (
            <GettingStarted steps={onboardingSteps} onDismiss={dismissChecklist} />
          ) : (
            <ContinueWorking projects={activeProjects} totalCount={mappedProjects.length} />
          )}
          <CasePanel cases={businessCases} role={user.role} />
        </div>
        <aside className="space-y-5">
          <ExecutionCluster />
          <RecentExecutions executions={mappedExecutions} />
          <SavedDeliverables deliverables={mappedDeliverables} />
        </aside>
      </div>
    </div>
  );
}
