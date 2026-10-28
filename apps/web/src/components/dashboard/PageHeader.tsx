import { FileText, FilePlus, Plus } from "lucide-react";
import type { SessionUser, Workspace } from "@/lib/session";
import { getWorkspaceHostLabel } from "@/lib/session";

interface PageHeaderProps {
  user: SessionUser;
  workspace: Workspace;
}

export function PageHeader({ user, workspace }: PageHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
        <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider font-mono">
          Workspace Session Active
        </span>
        <span className="text-xs text-slate-400 font-mono">{getWorkspaceHostLabel(workspace)}</span>
      </div>
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome back, {user.firstName}</h1>
          <p className="text-slate-600 max-w-2xl">
            Continue your analytical investigations or launch a new business inquiry across connected datasets.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 whitespace-nowrap">
          <button className="px-4 py-2.5 border border-slate-300 bg-white rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition flex items-center gap-2">
            <FileText size={18} />
            Quick Query
          </button>
          <button className="px-4 py-2.5 border border-slate-300 bg-white rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition flex items-center gap-2">
            <FilePlus size={18} />
            Import Dataset
          </button>
          <button className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition flex items-center gap-2 shadow-lg shadow-indigo-600/25">
            <Plus size={18} />
            Create Project
          </button>
        </div>
      </div>
    </div>
  );
}
