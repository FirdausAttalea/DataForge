import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getProjectsByWorkspace, getWorkspacesByOwner, getBusinessCaseById } from "@/lib/store";

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

export default async function ProjectsPage() {
  const session = await getSession();
  if (!session.user || !session.workspace) redirect("/sign-in");

  const workspaces = await getWorkspacesByOwner(session.user.id);
  const workspace = workspaces.find((w) => w.id === session.workspace!.id) ?? workspaces[0];
  if (!workspace) redirect("/workspace-setup");

  const projects = await getProjectsByWorkspace(workspace.id);

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">My Projects</h1>
          <p className="text-slate-600">Manage and track all your analytical investigations.</p>
        </div>
        <Link
          href="/projects/new"
          className="bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition"
        >
          + Create Project
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">No projects yet</h2>
          <p className="text-slate-600 text-sm mb-4">Create your first project to start analysing data.</p>
          <Link
            href="/projects/new"
            className="inline-block bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition"
          >
            Create Project
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          {projects.map((project, idx) => {
            const bc = project.caseId ? getBusinessCaseById(project.caseId) : null;
            return (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className={`flex items-center justify-between gap-4 px-6 py-4 hover:bg-slate-50 transition ${idx > 0 ? "border-t border-slate-100" : ""}`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{project.title}</p>
                  {bc && <p className="text-xs text-slate-500 mt-0.5">{bc.title}</p>}
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <span className="text-xs text-slate-400">
                    {project.tableIds.length} tables
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(project.updatedAt).toLocaleDateString()}
                  </span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyles[project.status] ?? ""}`}>
                    {statusLabels[project.status] ?? project.status}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
