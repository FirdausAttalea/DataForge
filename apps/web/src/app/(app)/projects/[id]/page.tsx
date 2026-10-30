import { notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import {
  getProjectById,
  getBusinessCaseById,
  getTableById,
  getWorkspacesByOwner,
} from "@/lib/store";

const statusStyles: Record<string, string> = {
  draft: "bg-slate-100 text-slate-600",
  in_progress: "bg-orange-100 text-orange-700",
  under_review: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
};

const statusLabels: Record<string, string> = {
  draft: "Draft",
  in_progress: "In Progress",
  under_review: "Under Review",
  completed: "Completed",
};

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session.user) notFound();

  const project = await getProjectById(id);
  if (!project) notFound();

  const workspaces = await getWorkspacesByOwner(session.user.id);
  const workspace = workspaces.find((w) => w.id === project.workspaceId);
  if (!workspace || project.ownerId !== session.user.id) notFound();

  const businessCase = project.caseId ? getBusinessCaseById(project.caseId) : null;
  const tables = project.tableIds.map((tid) => getTableById(tid)).filter(Boolean);

  return (
    <div className="p-6 md:p-8 max-w-3xl">
      <div className="mb-6">
        <Link href="/projects" className="text-sm text-indigo-600 hover:underline">
          ← My Projects
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{project.title}</h1>
            {businessCase && (
              <Link
                href={`/cases/${businessCase.id}`}
                className="text-sm text-indigo-600 hover:underline"
              >
                {businessCase.title}
              </Link>
            )}
          </div>
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${statusStyles[project.status] ?? ""}`}
          >
            {statusLabels[project.status] ?? project.status}
          </span>
        </div>

        {project.description && (
          <p className="text-slate-600 text-sm mb-6">{project.description}</p>
        )}

        {tables.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Tables</h3>
            <div className="flex flex-wrap gap-2">
              {tables.map((t) => (
                <span
                  key={t!.id}
                  className="inline-flex px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-mono rounded"
                >
                  {t!.name}
                  <span className="ml-1.5 text-slate-400">{t!.rowCount.toLocaleString()} rows</span>
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="text-xs text-slate-500 mb-6">
          Created {new Date(project.createdAt).toLocaleDateString()} · Updated{" "}
          {new Date(project.updatedAt).toLocaleDateString()}
        </div>

        <div className="flex gap-3 pt-4 border-t border-slate-100">
          <Link
            href={`/projects/${project.id}/sql-lab`}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition"
          >
            Open in SQL Lab
          </Link>
          {businessCase && (
            <Link
              href={`/cases/${businessCase.id}`}
              className="border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50 transition"
            >
              View Case Brief
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
