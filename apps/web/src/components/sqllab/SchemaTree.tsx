"use client";

import { useRef, useState } from "react";
import { ChevronDown, ChevronRight, Database, Table2 } from "lucide-react";
import type { TableDef } from "@/lib/store";
import { filterSchema, groupTablesByDatabase } from "@/lib/sqllab/schema";
import { ColumnRow } from "./ColumnRow";

interface SchemaTreeProps {
  tables: TableDef[];
  filter: string;
  selectedTableId: string;
  onSelectTable: (tableId: string) => void;
}

export function SchemaTree({ tables, filter, selectedTableId, onSelectTable }: SchemaTreeProps) {
  const [expandedTables, setExpandedTables] = useState<Set<string>>(
    () => new Set(selectedTableId ? [selectedTableId] : tables[0] ? [tables[0].id] : [])
  );
  const [collapsedDatabases, setCollapsedDatabases] = useState<Set<string>>(new Set());
  const treeRef = useRef<HTMLUListElement>(null);
  const filtered = filterSchema(tables, filter);
  const groups = groupTablesByDatabase(filtered.map((entry) => entry.table));
  const isFiltering = filter.trim().length > 0;

  function toggleTable(tableId: string) {
    setExpandedTables((current) => {
      const next = new Set(current);
      if (next.has(tableId)) next.delete(tableId);
      else next.add(tableId);
      return next;
    });
  }

  function toggleDatabase(key: string) {
    setCollapsedDatabases((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function onTreeKeyDown(event: React.KeyboardEvent<HTMLUListElement>) {
    const items = Array.from(
      treeRef.current?.querySelectorAll<HTMLElement>('[role="treeitem"]') ?? []
    );
    const active = document.activeElement as HTMLElement | null;
    if (!active) return;
    const index = items.indexOf(active);
    if (index === -1) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      items[Math.min(items.length - 1, index + 1)]?.focus();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      items[Math.max(0, index - 1)]?.focus();
    } else if (event.key === "Home") {
      event.preventDefault();
      items[0]?.focus();
    } else if (event.key === "End") {
      event.preventDefault();
      items[items.length - 1]?.focus();
    } else if (event.key === "ArrowRight") {
      if (active.getAttribute("aria-expanded") === "false") {
        event.preventDefault();
        active.click();
      }
    } else if (event.key === "ArrowLeft") {
      if (active.getAttribute("aria-expanded") === "true") {
        event.preventDefault();
        active.click();
      } else {
        const parentGroup = active.parentElement?.closest('[role="treeitem"]');
        if (parentGroup instanceof HTMLElement) {
          event.preventDefault();
          parentGroup.focus();
        }
      }
    } else if (event.key === "Enter" || event.key === " ") {
      if (active.getAttribute("aria-expanded") !== null) {
        event.preventDefault();
        active.querySelector<HTMLButtonElement>("button")?.click();
      }
    }
  }

  if (tables.length === 0) {
    return (
      <p className="px-3 py-6 text-center text-xs text-slate-500">
        This project has no catalog tables yet. Add tables when editing the project.
      </p>
    );
  }

  if (filtered.length === 0) {
    return (
      <p className="px-3 py-6 text-center text-xs text-slate-500">
        No tables or columns match “{filter}”.
      </p>
    );
  }

  return (
    <ul
      ref={treeRef}
      role="tree"
      aria-label="Project schema"
      onKeyDown={onTreeKeyDown}
      className="space-y-0.5"
    >
      {groups.map((group) => {
        const key = `${group.database}.${group.schema}`;
        const databaseCollapsed = !isFiltering && collapsedDatabases.has(key);
        return (
          <li
            key={key}
            role="treeitem"
            aria-level={1}
            aria-selected={false}
            aria-expanded={!databaseCollapsed}
            tabIndex={0}
            className="outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <button
              type="button"
              onClick={() => toggleDatabase(key)}
              className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-xs font-semibold text-slate-700 transition hover:bg-slate-100 focus:outline-none"
              aria-label={`${group.database}, ${group.tables.length} tables`}
            >
              {databaseCollapsed ? (
                <ChevronRight size={14} aria-hidden="true" />
              ) : (
                <ChevronDown size={14} aria-hidden="true" />
              )}
              <Database size={14} className="text-slate-500" aria-hidden="true" />
              <span className="font-mono">{group.database}</span>
              <span className="ml-auto font-normal text-slate-400">
                {group.tables.length} table{group.tables.length === 1 ? "" : "s"}
              </span>
            </button>

            {!databaseCollapsed && (
              <ul role="group" className="mt-0.5 space-y-0.5">
                {group.tables.map((table) => {
                  const entry = filtered.find((candidate) => candidate.table.id === table.id);
                  const columns = entry?.columns ?? table.columns;
                  const expanded = isFiltering || expandedTables.has(table.id);
                  const selected = table.id === selectedTableId;
                  return (
                    <li
                      key={table.id}
                      role="treeitem"
                      aria-level={2}
                      aria-selected={selected}
                      aria-expanded={expanded}
                      tabIndex={0}
                      className="outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    >
                      <div
                        className={`flex items-center rounded-lg text-xs transition ${
                          selected ? "bg-indigo-50 text-indigo-700" : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => toggleTable(table.id)}
                          aria-label={`${expanded ? "Collapse" : "Expand"} ${table.name}`}
                          className="shrink-0 rounded p-1.5 text-slate-400 hover:text-slate-700 focus:outline-none"
                        >
                          {expanded ? (
                            <ChevronDown size={13} aria-hidden="true" />
                          ) : (
                            <ChevronRight size={13} aria-hidden="true" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onSelectTable(table.id);
                            if (!expanded) toggleTable(table.id);
                          }}
                          className={`flex min-w-0 flex-1 items-center gap-1.5 py-1.5 text-left font-mono focus:outline-none ${
                            selected ? "font-semibold" : ""
                          }`}
                        >
                          <Table2 size={14} className={selected ? "text-indigo-500" : "text-slate-400"} aria-hidden="true" />
                          <span className="truncate">{table.name}</span>
                          {!expanded && (
                            <span className="ml-auto pr-2 font-sans text-[10px] font-normal text-slate-400">
                              {table.columns.length} cols
                            </span>
                          )}
                        </button>
                      </div>

                      {expanded && (
                        <ul role="group" className="mt-0.5 space-y-0">
                          {columns.map((column) => (
                            <ColumnRow key={column.name} column={column} />
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
}
