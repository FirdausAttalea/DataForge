import { WandSparkles } from "lucide-react";

export function CopilotSuggestionCard() {
  return (
    <section
      aria-labelledby="copilot-title"
      className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-200/50"
    >
      <div className="flex flex-wrap items-center gap-2">
        <WandSparkles size={16} className="text-violet-500" aria-hidden="true" />
        <h2 id="copilot-title" className="text-xs font-bold text-slate-800">
          SQL Copilot Suggestion
        </h2>
        <span className="ml-auto rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-700">
          Optimized
        </span>
      </div>

      <p className="mt-2 text-xs leading-relaxed text-slate-600">
        Indexing on <strong className="font-semibold text-slate-800">orders(product_id, revenue)</strong>{" "}
        will accelerate this query grouping by ~3.4×.
      </p>

      <p className="mt-2 inline-flex rounded bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
        Prototype suggestion
      </p>

      <div className="mt-2">
        <button
          type="button"
          disabled
          aria-describedby="copilot-disabled-reason"
          className="cursor-not-allowed text-left text-xs font-semibold text-indigo-400"
        >
          Apply Index Recommendation →
        </button>
        <span id="copilot-disabled-reason" className="sr-only">
          Index changes are not available on read-only replicas
        </span>
      </div>
    </section>
  );
}
