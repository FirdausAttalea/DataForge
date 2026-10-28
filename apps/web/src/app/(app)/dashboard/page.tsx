import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { ContinueWorking } from "@/components/dashboard/ContinueWorking";
import { CasePanel } from "@/components/dashboard/CasePanel";
import { ExecutionCluster } from "@/components/dashboard/ExecutionCluster";
import { RecentExecutions } from "@/components/dashboard/RecentExecutions";
import { SavedDeliverables } from "@/components/dashboard/SavedDeliverables";
import { getSession } from "@/lib/session";
import {
  mockProjects,
  mockBusinessCases,
  mockSQLExecutions,
  mockDeliverables,
} from "@/lib/mock/dashboard";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session.isAuthenticated || !session.user || !session.workspace) {
    return null;
  }

  const activeProjects = mockProjects.filter((p) => p.status !== "Completed");
  const completedProjects = mockProjects.filter((p) => p.status === "Completed");
  const inProgressCount = mockProjects.filter((p) => p.status === "In progress").length;
  const underReviewCount = completedProjects.length;

  const allTables = new Set<string>();
  mockProjects.forEach((p) => p.tables.forEach((t) => allTables.add(t)));
  const visibleTables = Array.from(allTables).slice(0, 3);
  const hiddenTableCount = Math.max(0, allTables.size - visibleTables.length);

  const todayExecutions = mockSQLExecutions;
  const avgLatency = Math.round(todayExecutions.reduce((sum, e) => sum + e.latency, 0) / todayExecutions.length);

  const draftDeliverables = mockDeliverables.filter((d) => d.subtitle.includes("Draft"));

  return (
    <div className="p-6 md:p-8">
      <PageHeader user={session.user} workspace={session.workspace} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          label="Active Projects"
          value={`${mockProjects.length} active investigations`}
          footer={
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
          }
          iconType="folder"
        />
        <StatCard
          label="Connected Schemas"
          value={`${allTables.size} production tables`}
          footer={
            <div className="flex flex-wrap gap-1.5">
              {visibleTables.map((t) => (
                <span key={t} className="inline-block px-2 py-1 bg-white text-xs font-mono rounded border border-slate-200">
                  {t}
                </span>
              ))}
              {hiddenTableCount > 0 && (
                <span className="inline-block px-2 py-1 bg-slate-200 text-xs font-mono rounded text-slate-600">+{hiddenTableCount}</span>
              )}
            </div>
          }
          iconType="database"
        />
        <StatCard
          label="Queries Executed Today"
          value={`${todayExecutions.length} invocations`}
          footer={
            <div className="flex items-center justify-between">
              <span>Avg Latency:</span>
              <span className="text-green-600 font-semibold flex items-center gap-1">
                ⚡ {avgLatency}ms
              </span>
            </div>
          }
          iconType="zap"
        />
        <StatCard
          label="Deliverables Status"
          value={`${draftDeliverables.length} drafts pending`}
          footer={
            <div className="flex items-center justify-between">
              <span className="truncate">{draftDeliverables[0]?.title || "N/A"}...</span>
              <a href="#" className="text-indigo-600 font-semibold whitespace-nowrap ml-2">Review</a>
            </div>
          }
          iconType="file"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ContinueWorking projects={activeProjects} />
          <CasePanel cases={mockBusinessCases} />
        </div>
        <aside className="space-y-5">
          <ExecutionCluster />
          <RecentExecutions executions={mockSQLExecutions} />
          <SavedDeliverables deliverables={mockDeliverables} />
        </aside>
      </div>
    </div>
  );
}
