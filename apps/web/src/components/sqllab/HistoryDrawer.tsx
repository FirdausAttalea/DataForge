"use client";

import { useEffect, useRef } from "react";
import { CheckCircle2, History, X, XCircle } from "lucide-react";
import type { HistoryEntry } from "@/lib/sqllab/types";

interface HistoryDrawerProps {
  open: boolean;
  onClose: () => void;
  entries: HistoryEntry[];
  onSelect: (sql: string) => void;
}

export function HistoryDrawer({ open, onClose, entries, onSelect }: HistoryDrawerProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-slate-900/20 backdrop-blur-[1px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Query history"
        className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl"
      >
        <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-4">
          <History size={18} className="text-indigo-600" aria-hidden="true" />
          <h2 className="text-sm font-bold text-slate-900">Query History</h2>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
            {entries.length}
          </span>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close query history"
            className="ml-auto rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <X size={17} aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {entries.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center">
              <p className="text-sm font-semibold text-slate-700">No executions for this project</p>
              <p className="mt-1 text-xs text-slate-500">
                Successful and failed runs will appear here after you run a query.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {entries.map((entry) => (
                <li key={entry.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(entry.sqlPreview);
                      onClose();
                    }}
                    className="w-full rounded-xl border border-slate-200 p-3 text-left transition hover:border-indigo-300 hover:bg-indigo-50/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  >
                    <div className="mb-1.5 flex items-center gap-2">
                      {entry.status === "success" ? (
                        <CheckCircle2 size={14} className="text-green-600" aria-hidden="true" />
                      ) : (
                        <XCircle size={14} className="text-red-500" aria-hidden="true" />
                      )}
                      <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                        {entry.status}
                      </span>
                      <span className="ml-auto text-[10px] text-slate-400">
                        {new Date(entry.executedAt).toLocaleString()}
                      </span>
                    </div>
                    <pre className="max-h-20 overflow-hidden whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed text-slate-600">
                      {entry.sqlPreview}
                    </pre>
                    <p className="mt-1.5 text-[10px] text-slate-400">
                      {entry.rows} rows · {entry.durationMs}ms · Load into editor
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </div>
  );
}
