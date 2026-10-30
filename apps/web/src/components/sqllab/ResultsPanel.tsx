"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, Table2 } from "lucide-react";
import { csvFilename, downloadFile, toCsv, toJson, toMarkdown } from "@/lib/sqllab/export";
import { filterRows, formatMemory, nextSort, pageRows, sortRows } from "@/lib/sqllab/results";
import type {
  HistoryEntry,
  QueryResult,
  ResultsSort,
  RunStatus,
} from "@/lib/sqllab/types";
import { ResultsToolbar } from "./ResultsToolbar";
import { ResultsTable } from "./ResultsTable";
import { ExecutionDetails } from "./ExecutionDetails";
import { QueryLogPanel } from "./QueryLogPanel";
import { ChartPreview } from "./ChartPreview";

type ResultTab = "results" | "chart" | "details" | "logs";

interface ResultsPanelProps {
  status: RunStatus;
  result: QueryResult | null;
  error: string | null;
  executions: HistoryEntry[];
  projectId: string;
  queryName: string;
  onVisualize: () => void;
}

const PAGE_SIZE = 100;

function preferredSort(result: QueryResult | null): ResultsSort {
  if (!result) return { column: "", direction: "desc" };
  const preferred =
    result.columns.find((column) => /REVENUE|VALUE|AMOUNT/i.test(column.name)) ??
    result.columns[1] ??
    result.columns[0];
  return { column: preferred?.name ?? "", direction: "desc" };
}

export function ResultsPanel({
  status,
  result,
  error,
  executions,
  projectId,
  queryName,
  onVisualize,
}: ResultsPanelProps) {
  const [activeTab, setActiveTab] = useState<ResultTab>("results");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<ResultsSort>(() => preferredSort(result));
  const [page, setPage] = useState(1);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState(result);
  const tabsRef = useRef<HTMLDivElement>(null);

  // Reset table controls when a new result arrives (render-time adjustment).
  if (result !== lastResult) {
    setLastResult(result);
    if (result) {
      setSort(preferredSort(result));
      setSearch("");
      setPage(1);
      setActiveTab("results");
    }
  }

  useEffect(() => {
    if (!copyMessage) return;
    const timer = setTimeout(() => setCopyMessage(null), 2600);
    return () => clearTimeout(timer);
  }, [copyMessage]);

  const filteredRows = useMemo(() => {
    if (!result) return [];
    return filterRows(result.rows, search);
  }, [result, search]);

  const sortedRows = useMemo(() => {
    if (!sort.column) return filteredRows;
    return sortRows(filteredRows, sort.column, sort.direction);
  }, [filteredRows, sort]);

  const needsPagination = sortedRows.length > 200;
  const displayedRows = needsPagination ? pageRows(sortedRows, page, PAGE_SIZE) : sortedRows;
  const pageCount = Math.max(1, Math.ceil(sortedRows.length / PAGE_SIZE));
  const resultTabs: Array<{ id: ResultTab; label: string }> = [
    { id: "results", label: `Results (${result?.rowCount ?? 0} rows)` },
    { id: "chart", label: "Chart Preview" },
    { id: "details", label: "Execution Details" },
    { id: "logs", label: "Query Logs" },
  ];

  function onTabsKeyDown(event: React.KeyboardEvent) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const currentIndex = resultTabs.findIndex((tab) => tab.id === activeTab);
    let nextIndex = currentIndex;
    if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + resultTabs.length) % resultTabs.length;
    if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % resultTabs.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = resultTabs.length - 1;
    setActiveTab(resultTabs[nextIndex].id);
    tabsRef.current
      ?.querySelector<HTMLElement>(`[data-result-tab="${resultTabs[nextIndex].id}"]`)
      ?.focus();
  }

  async function copyText(kind: "markdown" | "json") {
    if (!result) return;
    const text =
      kind === "markdown"
        ? toMarkdown(result.columns, displayedRows)
        : toJson(result.columns, displayedRows);
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard API unavailable");
      await navigator.clipboard.writeText(text);
      setCopyMessage(kind === "markdown" ? "Markdown copied to clipboard." : "JSON copied to clipboard.");
    } catch {
      setCopyMessage("Copy failed. Clipboard permission was denied.");
    }
  }

  function exportCsv() {
    if (!result) return;
    downloadFile(csvFilename(queryName), toCsv(result.columns, displayedRows));
    setCopyMessage("CSV downloaded.");
  }

  return (
    <section
      aria-label="Query results"
      className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/50"
    >
      <div className="border-b border-slate-200/80 bg-white px-2 pt-1">
        <div
          ref={tabsRef}
          role="tablist"
          aria-label="Result views"
          onKeyDown={onTabsKeyDown}
          className="flex items-center gap-1 overflow-x-auto"
        >
          {resultTabs.map((tab) => {
            const active = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                aria-controls={`result-panel-${tab.id}`}
                tabIndex={active ? 0 : -1}
                data-result-tab={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2.5 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  active
                    ? "border-indigo-500 text-indigo-700"
                    : "border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                {tab.id === "results" && <Table2 size={14} aria-hidden="true" />}
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div id={`result-panel-${activeTab}`} role="tabpanel" aria-label={resultTabs.find((tab) => tab.id === activeTab)?.label}>
        {activeTab === "results" && (
          <>
            {status === "idle" && (
              <div className="px-6 py-12 text-center">
                <p className="text-sm font-semibold text-slate-800">No query run yet</p>
                <p className="mx-auto mt-1 max-w-md text-xs text-slate-500">
                  Use Run Query to execute your SQL against the project sample data.
                </p>
              </div>
            )}

            {status === "running" && (
              <div className="flex items-center justify-center gap-2 px-6 py-12 text-sm text-slate-600" role="status">
                <Loader2 size={16} className="animate-spin text-indigo-600" aria-hidden="true" />
                Running query…
              </div>
            )}

            {(status === "error" || status === "timeout" || status === "cancelled") && (
              <div
                role="alert"
                className={`m-3 rounded-lg border p-4 ${
                  status === "cancelled"
                    ? "border-slate-200 bg-slate-50 text-slate-700"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                <div className="flex items-start gap-2">
                  {status === "cancelled" ? (
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                  ) : (
                    <AlertTriangle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                  )}
                  <div>
                    <p className="text-xs font-bold">
                      {status === "timeout" ? "Query timed out" : status === "cancelled" ? "Query cancelled" : "Query failed"}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed">
                      {error ?? "The query service could not complete this request."}
                    </p>
                    {result?.error?.line && (
                      <p className="mt-1 text-xs font-semibold">Line {result.error.line}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {status === "empty" && (
              <div className="px-6 py-12 text-center">
                <p className="text-sm font-semibold text-slate-800">Query returned no rows</p>
                <p className="mx-auto mt-1 max-w-md text-xs text-slate-500">
                  This query returned no rows. Check the filters or add data to the selected table.
                </p>
              </div>
            )}

            {status === "success" && result && (
              <>
                <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-3 py-2.5">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-semibold text-green-700">
                    <CheckCircle2 size={13} aria-hidden="true" />
                    200 OK · {result.rowCount} rows in {result.durationMs}ms · {result.engineVersion}
                  </span>
                  <span className="text-[10px] text-slate-400">Live result</span>
                  {result.truncated && (
                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-700">
                      Showing the first 1,000 rows
                    </span>
                  )}
                </div>

                <ResultsToolbar
                  search={search}
                  onSearch={(value) => {
                    setSearch(value);
                    setPage(1);
                  }}
                  onExport={exportCsv}
                  onVisualize={onVisualize}
                  exportDisabled={displayedRows.length === 0}
                />

                <ResultsTable
                  columns={result.columns}
                  rows={displayedRows}
                  sort={sort}
                  onSort={(column) => {
                    setSort((current) => nextSort(current, column));
                    setPage(1);
                  }}
                  page={page}
                  pageSize={needsPagination ? PAGE_SIZE : result.rowCount}
                  totalRows={sortedRows.length}
                />

                {needsPagination && (
                  <div className="flex items-center justify-center gap-2 border-t border-slate-100 px-3 py-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setPage((current) => Math.max(1, current - 1))}
                      disabled={page <= 1}
                      className="rounded border border-slate-200 px-2 py-1 font-semibold text-slate-600 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    >
                      Previous
                    </button>
                    <span className="text-slate-500">Page {page} of {pageCount}</span>
                    <button
                      type="button"
                      onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
                      disabled={page >= pageCount}
                      className="rounded border border-slate-200 px-2 py-1 font-semibold text-slate-600 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    >
                      Next
                    </button>
                  </div>
                )}

                <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/60 px-3 py-2.5 text-[11px] text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                  <p>
                    Showing <span className="font-semibold text-slate-700">{displayedRows.length}</span> of{" "}
                    <span className="font-semibold text-slate-700">{sortedRows.length}</span> rows
                    {search ? " (filtered)" : ""} · Execution Memory:{" "}
                    <span className="font-semibold text-slate-700">{formatMemory(result.memoryMb)}</span>
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => copyText("markdown")}
                      className="font-semibold text-slate-600 transition hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    >
                      Copy as Markdown
                    </button>
                    <span className="text-slate-300" aria-hidden="true">•</span>
                    <button
                      type="button"
                      onClick={() => copyText("json")}
                      className="font-semibold text-slate-600 transition hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    >
                      Copy as JSON
                    </button>
                  </div>
                </div>
              </>
            )}

            <p aria-live="polite" className="sr-only">
              {copyMessage ?? ""}
            </p>
          </>
        )}

        {activeTab === "chart" && <ChartPreview projectId={projectId} />}

        {activeTab === "details" &&
          (result ? (
            <ExecutionDetails result={result} />
          ) : (
            <p className="px-4 py-10 text-center text-xs text-slate-500">
              Run a query to inspect execution metadata.
            </p>
          ))}

        {activeTab === "logs" && <QueryLogPanel entries={executions} />}
      </div>

      {copyMessage && (
        <div
          role="status"
          className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white shadow-lg"
        >
          {copyMessage}
        </div>
      )}
    </section>
  );
}
