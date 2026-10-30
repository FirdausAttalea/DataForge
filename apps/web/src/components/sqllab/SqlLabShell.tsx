"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { PanelLeftOpen, TableProperties } from "lucide-react";
import type { ProjectEnvironment, QueryExecution, SavedQuery, TableDef } from "@/lib/store";
import type {
  HistoryEntry,
  QueryTab,
  RunStatus,
} from "@/lib/sqllab/types";
import { DEMO_ENGINE } from "@/lib/sqllab/fixtures";
import { checkBasicSyntax, DEFAULT_LIMIT, formatSqlBasic, type CursorPosition } from "@/lib/sqllab/sql";
import { formatRelativeTime } from "@/lib/sqllab/results";
import { useQueryRunner, type RunOutcome } from "@/lib/sqllab/use-query-runner";
import { createSqlExecutor } from "@/lib/sqllab/executor";
import { usePlatformModifier } from "@/lib/sqllab/use-platform-modifier";
import { confirmDiscardChanges, useUnsavedChangesGuard } from "@/lib/sqllab/use-unsaved-changes";
import { SqlLabTopBar } from "./SqlLabTopBar";
import { QueryHeader } from "./QueryHeader";
import { SchemaExplorer } from "./SchemaExplorer";
import { CopilotSuggestionCard } from "./CopilotSuggestionCard";
import { EditorPanel } from "./EditorPanel";
import { ResultsPanel } from "./ResultsPanel";
import { HistoryDrawer } from "./HistoryDrawer";

export interface SqlLabShellProps {
  workspaceName: string;
  workspaceId: string;
  project: {
    id: string;
    title: string;
    environment: ProjectEnvironment;
  };
  tables: TableDef[];
  initialSavedQuery: SavedQuery | null;
  initialExecutions: QueryExecution[];
}

const CLOCK_TICK_MS = 30_000;

function subscribeToClock(onStoreChange: () => void) {
  const timer = setInterval(onStoreChange, CLOCK_TICK_MS);
  return () => clearInterval(timer);
}

function getClockSnapshot() {
  return Math.floor(Date.now() / CLOCK_TICK_MS) * CLOCK_TICK_MS;
}

function getServerClockSnapshot() {
  return 0;
}

function makeBlankTab(index: number): QueryTab {
  return {
    id: `tab-blank-${index}`,
    name: index === 1 ? "untitled.sql" : `untitled-${index}.sql`,
    title: "Untitled query",
    sql: "",
    savedSql: "",
  };
}

function makeInitialTabs(saved: SavedQuery | null): QueryTab[] {
  if (!saved) return [makeBlankTab(1)];
  return [
    {
      id: `tab-${saved.id}`,
      savedQueryId: saved.id,
      name: saved.name,
      title: saved.title,
      sql: saved.sql,
      savedSql: saved.sql,
      updatedAt: saved.updatedAt,
    },
  ];
}

function toHistoryEntry(execution: QueryExecution): HistoryEntry {
  return {
    id: execution.id,
    sqlPreview: execution.sqlPreview,
    status: execution.status,
    rows: execution.rows,
    durationMs: execution.durationMs,
    executedAt: execution.executedAt,
  };
}

export function SqlLabShell({
  workspaceName,
  workspaceId,
  project,
  tables,
  initialSavedQuery,
  initialExecutions,
}: SqlLabShellProps) {
  const router = useRouter();
  const modifier = usePlatformModifier();
  const [tabs, setTabs] = useState<QueryTab[]>(() => makeInitialTabs(initialSavedQuery));
  const [activeTabId, setActiveTabId] = useState(() => tabs[0].id);
  const [selectedTableId, setSelectedTableId] = useState(() => {
    const preferred = tables.find((table) => table.name === "orders") ?? tables[0];
    return preferred?.id ?? "";
  });
  const [explorerCollapsed, setExplorerCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [limit, setLimit] = useState<number>(DEFAULT_LIMIT);
  const [cursor, setCursor] = useState<CursorPosition>({ lineNumber: 1, column: 1 });
  const [historyOpen, setHistoryOpen] = useState(false);
  const [executions, setExecutions] = useState<HistoryEntry[]>(() =>
    initialExecutions.map(toHistoryEntry)
  );
  const [saveMode, setSaveMode] = useState<"auto" | "manual" | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const nowMs = useSyncExternalStore(
    subscribeToClock,
    getClockSnapshot,
    getServerClockSnapshot
  );
  const tabCounter = useRef(1);

  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? tabs[0];
  const syntax = useMemo(() => checkBasicSyntax(activeTab?.sql ?? ""), [activeTab?.sql]);
  const dirty = tabs.some((tab) => tab.sql !== tab.savedSql);
  useUnsavedChangesGuard(dirty);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 4500);
    return () => clearTimeout(timer);
  }, [notice]);

  const logExecution = useCallback(
    async (outcome: RunOutcome, sql: string) => {
      if (outcome.status === "cancelled") return;
      const result = outcome.result;
      const status = outcome.status === "success" || outcome.status === "empty" ? "success" : "error";
      const rows = result?.rowCount ?? 0;
      const durationMs = outcome.status === "timeout" ? 30_000 : result?.durationMs ?? 0;
      const local: HistoryEntry = {
        id: `local-${Date.now()}`,
        sqlPreview: sql.trim().slice(0, 4000) || "(empty query)",
        status,
        rows,
        durationMs,
        executedAt: new Date().toISOString(),
      };
      setExecutions((current) => [local, ...current]);

      try {
        const response = await fetch("/api/v1/sql-lab/executions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            projectId: project.id,
            sqlPreview: local.sqlPreview,
            status,
            rows,
            durationMs,
          }),
        });
        if (!response.ok) throw new Error("Could not persist execution");
        const data = (await response.json()) as { execution: QueryExecution };
        setExecutions((current) =>
          current.map((entry) => (entry.id === local.id ? toHistoryEntry(data.execution) : entry))
        );
      } catch {
        setNotice("Query ran, but the execution could not be added to history.");
      }
    },
    [project.id]
  );

  const onRunComplete = useCallback(
    (outcome: RunOutcome) => {
      const result = outcome.result;
      if (outcome.status === "success" || outcome.status === "empty") {
        setAnnouncement(
          `Query complete. ${result?.rowCount ?? 0} rows returned in ${result?.durationMs ?? 0} milliseconds.`
        );
      } else if (outcome.status === "timeout") {
        setAnnouncement("Query timed out after 30 seconds.");
      } else if (outcome.status === "cancelled") {
        setAnnouncement("Query cancelled.");
      } else {
        setAnnouncement(`Query failed. ${outcome.message ?? "Query service error."}`);
      }
      void logExecution(outcome, activeTab?.sql ?? "");
    },
    [activeTab?.sql, logExecution]
  );

  const executor = useMemo(() => createSqlExecutor(project.id), [project.id]);
  const { status, result, error, run, cancel, isRunning } = useQueryRunner({
    executor,
    onComplete: onRunComplete,
  });

  function announceBusy(sql: string) {
    if (!sql.trim()) {
      setAnnouncement("The query is empty. Add a SELECT statement before running.");
    } else {
      setAnnouncement("Running query.");
    }
  }

  function runQuery() {
    if (!activeTab || isRunning) return;
    announceBusy(activeTab.sql);
    void run(activeTab.sql);
  }

  function cancelQuery() {
    cancel();
  }

  function updateActiveSql(sql: string) {
    setTabs((current) =>
      current.map((tab) => (tab.id === activeTabId ? { ...tab, sql } : tab))
    );
    setSaveError(null);
  }

  function addTab() {
    tabCounter.current += 1;
    const tab = makeBlankTab(tabs.length + tabCounter.current);
    setTabs((current) => [...current, tab]);
    setActiveTabId(tab.id);
    setDrawerOpen(false);
  }

  function closeTab(tabId: string) {
    const tab = tabs.find((candidate) => candidate.id === tabId);
    if (tab && tab.sql !== tab.savedSql && !confirmDiscardChanges()) return;

    setTabs((current) => {
      const index = current.findIndex((candidate) => candidate.id === tabId);
      const next = current.filter((candidate) => candidate.id !== tabId);
      if (next.length === 0) {
        const blank = makeBlankTab(1);
        setActiveTabId(blank.id);
        return [blank];
      }
      if (tabId === activeTabId) {
        setActiveTabId(next[Math.max(0, index - 1)].id);
      }
      return next;
    });
  }

  const saveTab = useCallback(
    async (tab: QueryTab, manual: boolean) => {
      setSaveError(null);
      try {
        const response = await fetch("/api/v1/sql-lab/saved-queries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            id: tab.savedQueryId,
            projectId: project.id,
            name: tab.name,
            title: tab.title,
            sql: tab.sql,
          }),
        });
        if (!response.ok) throw new Error("Could not save query");
        const data = (await response.json()) as { savedQuery: SavedQuery };
        setTabs((current) =>
          current.map((candidate) =>
            candidate.id === tab.id
              ? {
                  ...candidate,
                  savedQueryId: data.savedQuery.id,
                  savedSql: data.savedQuery.sql,
                  name: data.savedQuery.name,
                  title: data.savedQuery.title,
                  updatedAt: data.savedQuery.updatedAt,
                }
              : candidate
          )
        );
        setSaveMode(manual ? "manual" : "auto");
        setAnnouncement(manual ? "Query saved." : "Query auto-saved.");
      } catch {
        setSaveError("Save failed. The query buffer is still here; try again.");
        setNotice("Save failed. Your changes are still in the editor.");
      }
    },
    [project.id]
  );

  function saveActive(manual = true) {
    if (!activeTab) return;
    void saveTab(activeTab, manual);
  }

  useEffect(() => {
    if (!activeTab?.savedQueryId) return;
    if (activeTab.sql === activeTab.savedSql) return;
    const timer = setTimeout(() => {
      void saveTab(activeTab, false);
    }, 1800);
    return () => clearTimeout(timer);
  }, [activeTab, saveTab]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const withModifier = event.metaKey || event.ctrlKey;
      if (!withModifier) return;
      if (event.key === "Enter") {
        event.preventDefault();
        event.stopPropagation();
        runQuery();
      } else if (event.key.toLowerCase() === "s") {
        event.preventDefault();
        event.stopPropagation();
        saveActive(true);
      }
    }
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  });

  useEffect(() => {
    if (!fullscreen) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setFullscreen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [fullscreen]);

  function loadHistorySql(sql: string) {
    if (!activeTab) return;
    if (activeTab.sql !== activeTab.savedSql && !confirmDiscardChanges()) return;
    updateActiveSql(sql);
    setAnnouncement("Execution SQL loaded into the editor.");
  }

  function visualize() {
    if (dirty && !confirmDiscardChanges()) return;
    router.push(`/insights?projectId=${encodeURIComponent(project.id)}`);
  }

  function formatActive() {
    if (!activeTab) return;
    updateActiveSql(formatSqlBasic(activeTab.sql));
    setAnnouncement("Basic keyword formatting applied.");
  }

  const saveStatus = activeTab?.savedQueryId && activeTab.updatedAt
    ? saveMode === "manual" && formatRelativeTime(activeTab.updatedAt, nowMs) === "just now"
      ? "Saved just now"
      : `Auto-saved ${formatRelativeTime(activeTab.updatedAt, nowMs)}`
    : null;

  const schemaPanel = (
    <SchemaExplorer
      tables={tables}
      selectedTableId={selectedTableId}
      onSelectTable={(tableId) => {
        setSelectedTableId(tableId);
        setDrawerOpen(false);
      }}
      onCollapse={() => setExplorerCollapsed(true)}
    />
  );

  const editorPanel = (
    <EditorPanel
      tabs={tabs}
      activeTab={activeTab}
      onSelectTab={setActiveTabId}
      onAddTab={addTab}
      onCloseTab={closeTab}
      onChangeSql={updateActiveSql}
      onCursorChange={setCursor}
      cursor={cursor}
      syntax={syntax}
      limit={limit}
      onLimitChange={setLimit}
      memoryUsedGb={DEMO_ENGINE.memoryUsedGb}
      memoryTotalGb={DEMO_ENGINE.memoryTotalGb}
      fullscreen={fullscreen}
      onToggleFullscreen={() => setFullscreen((current) => !current)}
    />
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <SqlLabTopBar
        workspaceName={workspaceName}
        projectTitle={project.title}
        projectId={project.id}
        environment={project.environment}
      />

      <div className="mx-auto max-w-[1920px] p-3 sm:p-4 xl:p-6">
        <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-800 md:hidden">
          SQL Lab works best on a larger screen. The editor and results remain usable at this size.
        </div>

        <QueryHeader
          title={activeTab?.title ?? "Untitled query"}
          projectTitle={project.title}
          saveStatus={saveStatus}
          tables={tables}
          selectedTableId={selectedTableId}
          onSelectTable={setSelectedTableId}
          modifier={modifier}
          isRunning={isRunning}
          onRun={runQuery}
          onCancel={cancelQuery}
          onSave={() => saveActive(true)}
          onFormat={formatActive}
          onHistory={() => setHistoryOpen(true)}
        />

        {saveError && (
          <p role="alert" className="mt-2 text-xs font-medium text-red-600">
            {saveError}
          </p>
        )}

        <div
          className={`mt-4 grid gap-4 ${
            explorerCollapsed
              ? "xl:grid-cols-[44px_minmax(0,1fr)]"
              : "xl:grid-cols-[minmax(260px,24%)_minmax(0,1fr)]"
          }`}
        >
          {!explorerCollapsed && (
            <aside className="hidden min-h-0 flex-col gap-4 xl:flex" aria-label="Schema and suggestions">
              <div className="max-h-[720px] min-h-[480px] flex-1">{schemaPanel}</div>
              <CopilotSuggestionCard />
            </aside>
          )}

          {explorerCollapsed && (
            <aside
              className="hidden flex-col items-center gap-3 rounded-2xl border border-slate-200/80 bg-white py-3 xl:flex"
              aria-label="Collapsed schema panel"
            >
              <button
                type="button"
                onClick={() => setExplorerCollapsed(false)}
                aria-label="Expand schema panel"
                title="Expand schema panel"
                className="rounded-md p-1.5 text-indigo-600 transition hover:bg-indigo-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <PanelLeftOpen size={17} aria-hidden="true" />
              </button>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 [writing-mode:vertical-rl]">
                Schema
              </span>
            </aside>
          )}

          <div className="min-w-0 space-y-4">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 xl:hidden"
            >
              <TableProperties size={15} className="text-indigo-600" aria-hidden="true" />
              Schema Explorer
            </button>

            {fullscreen ? (
              <div className="fixed inset-0 z-50 flex flex-col bg-slate-50 p-3 sm:p-5">
                <div className="min-h-0 flex-1">{editorPanel}</div>
                <p className="mt-2 text-center text-[11px] text-slate-500">
                  Focus mode · Press Esc to return to the workbench
                </p>
              </div>
            ) : (
              editorPanel
            )}

            <ResultsPanel
              status={status as RunStatus}
              result={result}
              error={error}
              executions={executions}
              projectId={project.id}
              queryName={activeTab?.name ?? "query.sql"}
              onVisualize={visualize}
            />
          </div>
        </div>
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 xl:hidden">
          <div
            className="absolute inset-0 bg-slate-900/25"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <aside className="absolute left-0 top-0 h-full w-[min(22rem,92vw)] border-r border-slate-200 bg-slate-50 p-3 shadow-2xl">
            <SchemaExplorer
              tables={tables}
              selectedTableId={selectedTableId}
              onSelectTable={(tableId) => {
                setSelectedTableId(tableId);
                setDrawerOpen(false);
              }}
              onCollapse={() => setDrawerOpen(false)}
              onCloseDrawer={() => setDrawerOpen(false)}
              drawer
            />
          </aside>
        </div>
      )}

      <HistoryDrawer
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        entries={executions}
        onSelect={loadHistorySql}
      />

      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>

      {notice && (
        <div
          role="status"
          className="fixed bottom-5 left-1/2 z-[60] -translate-x-1/2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white shadow-lg"
        >
          {notice}
        </div>
      )}
      <span className="sr-only">Workspace {workspaceId}</span>
    </div>
  );
}
