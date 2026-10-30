"use client";

import { FileCode2, History, Play, Save, Wand2 } from "lucide-react";
import type { TableDef } from "@/lib/store";
import { Kbd } from "./Kbd";
import { DataSourceSelect } from "./DataSourceSelect";
import { EngineBadge } from "./EngineBadge";

interface QueryHeaderProps {
  title: string;
  projectTitle: string;
  saveStatus: string | null;
  tables: TableDef[];
  selectedTableId: string;
  onSelectTable: (tableId: string) => void;
  modifier: string;
  isRunning: boolean;
  onRun: () => void;
  onCancel: () => void;
  onSave: () => void;
  onFormat: () => void;
  onHistory: () => void;
}

export function QueryHeader({
  title,
  projectTitle,
  saveStatus,
  tables,
  selectedTableId,
  onSelectTable,
  modifier,
  isRunning,
  onRun,
  onCancel,
  onSave,
  onFormat,
  onHistory,
}: QueryHeaderProps) {
  return (
    <section
      aria-labelledby="query-header-title"
      className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-200/50 sm:p-5"
    >
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
              <FileCode2 size={19} aria-hidden="true" />
            </span>
            <h1 id="query-header-title" className="text-lg font-bold text-slate-900">
              {title}
            </h1>
            {saveStatus && (
              <span className="whitespace-nowrap rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-600">
                {saveStatus}
              </span>
            )}
          </div>
          <p className="mt-1.5 pl-11 text-xs text-slate-500">
            Project: <span className="font-medium text-slate-600">{projectTitle}</span>
          </p>
        </div>

        <div className="flex min-w-0 items-center gap-3 xl:max-w-[54%]">
          <span className="hidden h-10 w-px shrink-0 bg-slate-200 xl:block" aria-hidden="true" />
          <DataSourceSelect
            tables={tables}
            value={selectedTableId}
            onChange={onSelectTable}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
        <EngineBadge />

        <div className="flex flex-1 flex-wrap items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={onFormat}
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            title="Basic keyword formatting"
          >
            <Wand2 size={15} aria-hidden="true" />
            Format
          </button>

          <button
            type="button"
            onClick={onSave}
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <Save size={15} aria-hidden="true" />
            Save
            <kbd className="rounded border border-slate-200 bg-slate-50 px-1 py-0.5 text-[10px] font-semibold text-slate-500">
              {modifier}S
            </kbd>
          </button>

          <button
            type="button"
            onClick={onHistory}
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <History size={15} aria-hidden="true" />
            History
          </button>

          {isRunning && (
            <button
              type="button"
              onClick={onCancel}
              className="whitespace-nowrap rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            >
              Cancel
            </button>
          )}

          <button
            type="button"
            onClick={onRun}
            disabled={isRunning}
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          >
            {isRunning ? (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />
            ) : (
              <Play size={15} aria-hidden="true" fill="currentColor" />
            )}
            {isRunning ? "Running…" : "Run Query"}
            <Kbd aria-hidden>{modifier}↵</Kbd>
          </button>
        </div>
      </div>
    </section>
  );
}
