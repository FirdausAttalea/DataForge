import Link from "next/link";
import { BarChart3 } from "lucide-react";

export function ChartPreview({ projectId }: { projectId: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-500">
        <BarChart3 size={20} aria-hidden="true" />
      </span>
      <p className="text-sm font-semibold text-slate-800">Chart preview arrives with Insights</p>
      <p className="mt-1 max-w-sm text-xs text-slate-500">
        Visualization is a prototype placeholder. Your query results stay in the Results tab.
      </p>
      <Link
        href={`/insights?projectId=${encodeURIComponent(projectId)}`}
        className="mt-4 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      >
        Open Insights placeholder →
      </Link>
    </div>
  );
}
