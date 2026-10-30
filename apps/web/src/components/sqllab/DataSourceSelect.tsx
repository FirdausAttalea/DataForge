"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown, Database, Table2 } from "lucide-react";
import type { TableDef } from "@/lib/store";

interface DataSourceSelectProps {
  tables: TableDef[];
  value: string;
  onChange: (tableId: string) => void;
}

export function DataSourceSelect({ tables, value, onChange }: DataSourceSelectProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listboxId = useId();
  const selected = tables.find((table) => table.id === value) ?? tables[0];

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  function openList() {
    setActiveIndex(Math.max(0, tables.findIndex((table) => table.id === value)));
    setOpen(true);
  }

  function choose(table: TableDef) {
    onChange(table.id);
    setOpen(false);
    buttonRef.current?.focus();
  }

  function onListKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(tables.length - 1, index + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(0, index - 1));
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (tables[activeIndex]) choose(tables[activeIndex]);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      buttonRef.current?.focus();
    }
  }

  if (!selected) {
    return (
      <span className="text-sm text-slate-500">No tables in this project catalog</span>
    );
  }

  return (
    <div ref={rootRef} className="relative w-full min-w-0 xl:w-auto">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openList();
          }
        }}
        className="flex w-full min-w-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition hover:border-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 xl:w-auto"
      >
        <Database size={15} className="shrink-0 text-slate-500" aria-hidden="true" />
        <span className="truncate font-mono text-[13px]">
          {selected.database} / {selected.schema} /
        </span>
        <Table2 size={15} className="shrink-0 text-indigo-500" aria-hidden="true" />
        <span className="font-semibold text-slate-800">{selected.name}</span>
        <ChevronDown size={15} className="ml-auto shrink-0 text-slate-400" aria-hidden="true" />
      </button>

      {open && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label="Data source"
          aria-activedescendant={`${listboxId}-option-${activeIndex}`}
          tabIndex={-1}
          onKeyDown={onListKeyDown}
          className="absolute left-0 right-0 z-30 mt-2 max-h-72 overflow-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl focus:outline-none xl:left-auto xl:w-80"
        >
          {tables.map((table, index) => (
            <li
              key={table.id}
              id={`${listboxId}-option-${index}`}
              role="option"
              aria-selected={table.id === selected.id}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => choose(table)}
              className={`flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                index === activeIndex ? "bg-indigo-50 text-indigo-700" : "text-slate-700"
              }`}
            >
              <Table2 size={15} aria-hidden="true" />
              <span className="font-mono">{table.name}</span>
              <span className="ml-auto text-xs text-slate-400">
                {table.rowCount.toLocaleString()} rows
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
