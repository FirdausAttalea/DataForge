"use client";

import { Download, Search, Sparkles } from "lucide-react";

interface ResultsToolbarProps {
  search: string;
  onSearch: (value: string) => void;
  onExport: () => void;
  onVisualize: () => void;
  exportDisabled: boolean;
}

export function ResultsToolbar({
  search,
  onSearch,
  onExport,
  onVisualize,
  exportDisabled,
}: ResultsToolbarProps) {
  return (
    <div className="flex flex-col gap-2 border-b border-slate-100 px-3 py-3 sm:flex-row sm:items-center">
      <label htmlFor="results-search" className="sr-only">
        Search within results
      </label>
      <div className="relative min-w-0 flex-1">
        <Search
          size={15}
          className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
        <input
          id="results-search"
          type="search"
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder="Search within results..."
          className="w-full rounded-lg border border-slate-300 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-700 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        />
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={onExport}
          disabled={exportDisabled}
          className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <Download size={15} aria-hidden="true" />
          Export CSV
        </button>
        <button
          type="button"
          onClick={onVisualize}
          className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <Sparkles size={15} aria-hidden="true" />
          Visualize in Insights
        </button>
      </div>
    </div>
  );
}
