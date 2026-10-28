import Link from "next/link";
import { CheckCircle } from "lucide-react";
import type { SQLExecution } from "@/lib/mock/dashboard";

interface RecentExecutionsProps {
  executions: SQLExecution[];
}

export function RecentExecutions({ executions }: RecentExecutionsProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-900">Recent SQL Executions</h3>
        <p className="text-xs text-slate-500">Last 6h</p>
      </div>

      <div className="space-y-3 mb-4">
        {executions.map((exec, idx) => (
          <div key={idx} className="border border-slate-200 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-600" />
                <span className="text-xs font-semibold text-green-700">{exec.status}</span>
              </div>
              <span className="text-xs text-slate-600 font-mono">
                {exec.rows} rows · {exec.latency}ms
              </span>
            </div>
            <div className="bg-slate-50 p-2 rounded text-xs font-mono text-slate-600 overflow-hidden">
              {exec.query}
            </div>
          </div>
        ))}
      </div>

      <Link href="#" className="text-xs text-indigo-600 font-semibold hover:text-indigo-700 transition">
        View complete audit trail →
      </Link>
    </div>
  );
}
