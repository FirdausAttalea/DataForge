import { Database, Dot } from "lucide-react";

export function ExecutionCluster() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Execution Cluster</p>
      
      <div className="flex items-center gap-2 mb-4">
        <Dot size={12} className="fill-green-500 text-green-500" />
        <span className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded">Online</span>
      </div>

      <div className="flex items-center gap-3 mb-4 p-3 bg-slate-50 rounded-lg">
        <Database size={18} className="text-slate-600 flex-shrink-0" />
        <div className="text-sm font-mono text-slate-900">DuckDB v0.10.1 / PG16</div>
      </div>

      <div className="text-sm">
        <p className="text-slate-600 mb-1">In-memory allocation:</p>
        <p className="font-mono text-slate-900 text-right">3.2 GB / 16.0 GB</p>
      </div>
    </div>
  );
}
