"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { LIMIT_OPTIONS, formatCursor, type BasicSyntaxCheck, type CursorPosition } from "@/lib/sqllab/sql";

interface EditorStatusBarProps {
  limit: number;
  onLimitChange: (limit: number) => void;
  cursor: CursorPosition;
  syntax: BasicSyntaxCheck;
}

export function EditorStatusBar({ limit, onLimitChange, cursor, syntax }: EditorStatusBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-200/80 bg-slate-50/80 px-3 py-2 text-[11px] text-slate-500">
      <label className="flex items-center gap-1.5">
        <span>Limit:</span>
        <select
          aria-label="Result limit"
          value={limit}
          onChange={(event) => onLimitChange(Number(event.target.value))}
          className="rounded-md border border-slate-300 bg-white px-1.5 py-0.5 text-[11px] font-semibold text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        >
          {LIMIT_OPTIONS.map((option) => (
            <option key={option} value={option}>
              Limit {option}
            </option>
          ))}
        </select>
      </label>

      <span className="h-3 w-px bg-slate-200" aria-hidden="true" />
      <span className="font-mono" aria-label={`Cursor position ${formatCursor(cursor)}`}>
        Cursor: {formatCursor(cursor)}
      </span>

      <span className="ml-auto inline-flex items-center gap-1.5" title="Basic syntax check: empty or unbalanced parentheses">
        {syntax.valid ? (
          <CheckCircle2 size={13} className="text-green-600" aria-hidden="true" />
        ) : (
          <XCircle size={13} className="text-red-500" aria-hidden="true" />
        )}
        <span className={syntax.valid ? "font-medium text-green-700" : "font-medium text-red-600"}>
          {syntax.valid ? "Syntax Valid" : "Basic check failed"}
        </span>
        <span className="text-slate-400">(basic)</span>
      </span>

      <span className="h-3 w-px bg-slate-200" aria-hidden="true" />
      <span className="font-mono">Encoding: UTF-8</span>
    </div>
  );
}
