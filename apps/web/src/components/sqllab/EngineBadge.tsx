import { DEMO_ENGINE } from "@/lib/sqllab/fixtures";

export function EngineBadge() {
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
      <span className="h-2 w-2 rounded-full bg-indigo-500" aria-hidden="true" />
      <span className="font-mono">{DEMO_ENGINE.name}</span>
      <span className="text-slate-300" aria-hidden="true">·</span>
      <span className="font-mono font-semibold text-green-600">{DEMO_ENGINE.latencyMs}ms</span>
    </span>
  );
}
