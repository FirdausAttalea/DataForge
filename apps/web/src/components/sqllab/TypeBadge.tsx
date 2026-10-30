import { typeBadgeLabel } from "@/lib/sqllab/schema";

export function TypeBadge({ type }: { type: string }) {
  const tone =
    /CHAR|TEXT|JSON/i.test(type)
      ? "border-violet-200 bg-violet-50 text-violet-700"
      : /DECIMAL|NUMERIC|FLOAT|DOUBLE/i.test(type)
        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
        : "border-slate-200 bg-slate-50 text-slate-600";

  return (
    <span className={`inline-flex whitespace-nowrap rounded border px-1.5 py-0.5 font-mono text-[10px] font-medium leading-tight ${tone}`}>
      {typeBadgeLabel(type)}
    </span>
  );
}
