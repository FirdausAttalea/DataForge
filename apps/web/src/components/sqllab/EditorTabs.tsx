"use client";

import { useRef } from "react";
import { FileCode2, Plus, X } from "lucide-react";
import type { QueryTab } from "@/lib/sqllab/types";

interface EditorTabsProps {
  tabs: QueryTab[];
  activeTabId: string;
  onSelect: (tabId: string) => void;
  onAdd: () => void;
  onClose: (tabId: string) => void;
  memoryUsedGb: number;
  memoryTotalGb: number;
  fullscreen: boolean;
  onToggleFullscreen: () => void;
}

export function EditorTabs({
  tabs,
  activeTabId,
  onSelect,
  onAdd,
  onClose,
  memoryUsedGb,
  memoryTotalGb,
  fullscreen,
  onToggleFullscreen,
}: EditorTabsProps) {
  const listRef = useRef<HTMLDivElement>(null);

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const index = tabs.findIndex((tab) => tab.id === activeTabId);
    let next = index;
    if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
    if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = tabs.length - 1;
    const target = tabs[next];
    if (target) {
      onSelect(target.id);
      listRef.current
        ?.querySelector<HTMLElement>(`[data-tab-id="${target.id}"]`)
        ?.focus();
    }
  }

  return (
    <div className="flex flex-col gap-2 border-b border-slate-200/80 bg-white px-2 py-2 xl:flex-row xl:items-center xl:gap-3">
      <div
        ref={listRef}
        role="tablist"
        aria-label="Query tabs"
        onKeyDown={onKeyDown}
        className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto"
      >
        {tabs.map((tab) => {
          const active = tab.id === activeTabId;
          const dirty = tab.sql !== tab.savedSql;
          return (
            <div
              key={tab.id}
              role="tab"
              aria-selected={active}
              aria-controls="sql-editor-panel"
              tabIndex={active ? 0 : -1}
              data-tab-id={tab.id}
              onClick={() => onSelect(tab.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelect(tab.id);
                }
              }}
              className={`group flex shrink-0 cursor-pointer items-center gap-2 rounded-t-lg border-b-2 px-3 py-2 text-xs outline-none transition focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                active
                  ? "border-indigo-500 bg-indigo-50/60 font-semibold text-slate-900"
                  : "border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <FileCode2 size={14} className={active ? "text-indigo-500" : "text-slate-400"} aria-hidden="true" />
              <span className="max-w-[16rem] truncate font-mono">{tab.name}</span>
              {dirty && (
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500"
                  aria-label="Unsaved changes"
                  title="Unsaved changes"
                />
              )}
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onClose(tab.id);
                }}
                aria-label={`Close ${tab.name}`}
                className="rounded p-0.5 text-slate-400 opacity-70 transition hover:bg-slate-200 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 group-hover:opacity-100"
              >
                <X size={13} aria-hidden="true" />
              </button>
            </div>
          );
        })}

        <button
          type="button"
          onClick={onAdd}
          className="ml-1 inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-md px-2 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <Plus size={14} aria-hidden="true" />
          New Tab
        </button>
      </div>

      <div className="flex shrink-0 items-center justify-between gap-3 pl-2 pr-1 text-[11px] text-slate-500 xl:justify-end">
        <span className="whitespace-nowrap font-mono">
          DuckDB In-Memory:{" "}
          <span className="font-semibold text-slate-700">{memoryUsedGb.toFixed(1)} GB</span> /{" "}
          {memoryTotalGb.toFixed(1)} GB
        </span>
        <button
          type="button"
          onClick={onToggleFullscreen}
          aria-label={fullscreen ? "Exit focus mode" : "Enter editor focus mode"}
          aria-pressed={fullscreen}
          title={fullscreen ? "Exit focus mode (Esc)" : "Focus mode"}
          className="rounded-md p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          {fullscreen ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M9 3H5a2 2 0 0 0-2 2v4M15 3h4a2 2 0 0 1 2 2v4M9 21H5a2 2 0 0 1-2-2v-4M15 21h4a2 2 0 0 0 2-2v-4" />
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
