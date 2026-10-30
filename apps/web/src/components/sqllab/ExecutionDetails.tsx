import type { QueryResult } from "@/lib/sqllab/types";
import { formatDuration, formatMemory } from "@/lib/sqllab/results";

export function ExecutionDetails({ result }: { result: QueryResult }) {
  const rows: Array<[string, string]> = [
    ["Status", result.status === "success" ? "200 OK" : result.status.toUpperCase()],
    ["Duration", formatDuration(result.durationMs)],
    ["Engine", result.engineVersion],
    ["Memory used", formatMemory(result.memoryMb)],
    ["Row count", result.rowCount.toLocaleString()],
    ["Columns", String(result.columns.length)],
  ];

  return (
    <div className="p-4">
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        Execution metadata
      </p>
      <dl className="grid grid-cols-1 gap-x-8 gap-y-2 text-xs sm:grid-cols-2">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-4 border-b border-slate-100 py-2">
            <dt className="text-slate-500">{label}</dt>
            <dd className="font-mono font-semibold text-slate-800">{value}</dd>
          </div>
        ))}
      </dl>
      {result.error?.message && (
        <p className="mt-3 rounded-lg bg-red-50 p-3 text-xs text-red-700">{result.error.message}</p>
      )}
    </div>
  );
}
