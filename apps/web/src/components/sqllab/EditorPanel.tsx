"use client";

import type { QueryTab } from "@/lib/sqllab/types";
import type { BasicSyntaxCheck, CursorPosition } from "@/lib/sqllab/sql";
import { EditorTabs } from "./EditorTabs";
import { EditorStatusBar } from "./EditorStatusBar";
import { SqlEditor } from "./SqlEditor";

interface EditorPanelProps {
  tabs: QueryTab[];
  activeTab: QueryTab;
  onSelectTab: (tabId: string) => void;
  onAddTab: () => void;
  onCloseTab: (tabId: string) => void;
  onChangeSql: (sql: string) => void;
  onCursorChange: (position: CursorPosition) => void;
  cursor: CursorPosition;
  syntax: BasicSyntaxCheck;
  limit: number;
  onLimitChange: (limit: number) => void;
  memoryUsedGb: number;
  memoryTotalGb: number;
  fullscreen: boolean;
  onToggleFullscreen: () => void;
}

export function EditorPanel({
  tabs,
  activeTab,
  onSelectTab,
  onAddTab,
  onCloseTab,
  onChangeSql,
  onCursorChange,
  cursor,
  syntax,
  limit,
  onLimitChange,
  memoryUsedGb,
  memoryTotalGb,
  fullscreen,
  onToggleFullscreen,
}: EditorPanelProps) {
  return (
    <section
      aria-label="SQL editor"
      className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/50"
    >
      <EditorTabs
        tabs={tabs}
        activeTabId={activeTab.id}
        onSelect={onSelectTab}
        onAdd={onAddTab}
        onClose={onCloseTab}
        memoryUsedGb={memoryUsedGb}
        memoryTotalGb={memoryTotalGb}
        fullscreen={fullscreen}
        onToggleFullscreen={onToggleFullscreen}
      />

      {!activeTab.sql.trim() && (
        <p className="border-b border-dashed border-slate-200 bg-indigo-50/40 px-4 py-2 text-[11px] text-slate-500">
          Blank query tab. Write a <span className="font-mono font-semibold text-indigo-700">SELECT</span>{" "}
          statement, then run it against the project sample data.
        </p>
      )}

      <div
        id="sql-editor-panel"
        role="tabpanel"
        aria-label={activeTab.name}
        className={`relative min-h-[260px] flex-1 bg-white ${
          fullscreen ? "h-[calc(100vh-170px)]" : "h-[320px] xl:h-[340px]"
        }`}
      >
        <div className="absolute inset-0">
          <SqlEditor
            value={activeTab.sql}
            onChange={onChangeSql}
            onCursorChange={onCursorChange}
          />
        </div>
      </div>

      <EditorStatusBar
        limit={limit}
        onLimitChange={onLimitChange}
        cursor={cursor}
        syntax={syntax}
      />
    </section>
  );
}
