import { CheckCircle2, XCircle } from "lucide-react";
import type { HistoryEntry } from "@/lib/sqllab/types";

export function QueryLogPanel({ entries }: { entries: HistoryEntry[] }) {
  if (entries.length === 0) {
    return (
      <div className="px-4 py-10 text-center">
        <p className="text-sm font-semibold text-slate-700">No executions yet</p>
        <p className="mt-1 text-xs text-slate-500">
          Run the sample query to add an execution record for this project.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        Execution history from this workspace
      </p>
      <ul className="divide-y divide-slate-100">
        {entries.map((entry) => (
          <li key={entry.id} className="flex items-start gap-3 py-2.5">
            {entry.status === "success" ? (
              <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-green-600" aria-hidden="true" />
            ) : (
              <XCircle size={15} className="mt-0.5 shrink-0 text-red-500" aria-hidden="true" />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate font-mono text-[11px] text-slate-700">{entry.sqlPreview}</p>
              <p className="mt-1 text-[10px] text-slate-400">
                {new Date(entry.executedAt).toLocaleString()} · {entry.rows} rows · {entry.durationMs}ms
              </p>
            </div>
            <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold ${
              entry.status === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
            }`}>
              {entry.status}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
