"use client";

import { useState } from "react";
import { ChevronsLeft, PanelLeftClose, RefreshCw, Search, TableProperties } from "lucide-react";
import type { TableDef } from "@/lib/store";
import { SchemaTree } from "./SchemaTree";

interface SchemaExplorerProps {
  tables: TableDef[];
  selectedTableId: string;
  onSelectTable: (tableId: string) => void;
  onCollapse: () => void;
  onCloseDrawer?: () => void;
  drawer?: boolean;
}

export function SchemaExplorer({
  tables,
  selectedTableId,
  onSelectTable,
  onCollapse,
  onCloseDrawer,
  drawer = false,
}: SchemaExplorerProps) {
  const [filter, setFilter] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const target = tables.find((table) => table.id === selectedTableId) ?? tables[0];

  return (
    <section
      aria-label="Schema Explorer"
      className={`flex min-h-0 flex-col rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/50 ${
        drawer ? "h-full" : ""
      }`}
    >
      <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-3">
        <TableProperties size={18} className="text-indigo-600" aria-hidden="true" />
        <h2 className="text-sm font-bold text-slate-800">Schema Explorer</h2>
        <div className="ml-auto flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => setRefreshKey((key) => key + 1)}
            aria-label="Refresh schema"
            title="Refresh schema (catalog is read-only)"
            className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <RefreshCw size={15} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onCollapse}
            aria-label={drawer ? "Close schema drawer" : "Collapse schema panel"}
            title={drawer ? "Close schema drawer" : "Collapse schema panel"}
            className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            {drawer ? <ChevronsLeft size={15} aria-hidden="true" /> : <PanelLeftClose size={15} aria-hidden="true" />}
          </button>
        </div>
      </div>

      <div className="border-b border-slate-100 p-3">
        <label htmlFor={`schema-filter-${drawer ? "drawer" : "panel"}`} className="sr-only">
          Filter tables and columns
        </label>
        <div className="relative">
          <Search
            size={15}
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            id={`schema-filter-${drawer ? "drawer" : "panel"}`}
            type="search"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            placeholder="Filter tables & columns..."
            className="w-full rounded-lg border border-slate-300 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-700 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2" key={refreshKey}>
        <SchemaTree
          tables={tables}
          filter={filter}
          selectedTableId={selectedTableId}
          onSelectTable={onSelectTable}
        />
        {onCloseDrawer && (
          <button
            type="button"
            onClick={onCloseDrawer}
            className="mt-3 w-full rounded-lg border border-slate-200 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            Close
          </button>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-3 py-2.5 text-[11px]">
        <span className="text-slate-500">
          Target: <span className="font-semibold text-slate-700">{target?.name ?? "—"}</span>
        </span>
        <span className="font-mono font-semibold text-slate-700">
          {target ? `${target.rowCount.toLocaleString()} rows` : "0 rows"}
        </span>
      </div>
    </section>
  );
}
