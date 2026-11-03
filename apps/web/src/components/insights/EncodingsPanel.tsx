"use client";

import type { QueryResult } from "@/lib/sqllab/types";

interface EncodingsPanelProps {
  queryResult: QueryResult;
  xField?: string;
  yField?: string;
  onXFieldChange?: (field: string) => void;
  onYFieldChange?: (field: string) => void;
}

export default function EncodingsPanel({
  queryResult,
  xField,
  yField,
  onXFieldChange,
  onYFieldChange,
}: EncodingsPanelProps) {
  return (
    <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm space-y-4">
      <h3 className="text-sm font-semibold text-slate-900">Encodings</h3>
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">X-Axis</label>
        <select
          value={xField || ""}
          onChange={(e) => onXFieldChange?.(e.target.value)}
          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Select field...</option>
          {queryResult.columns.map((col) => {
            const colName = typeof col === "string" ? col : col.name;
            return (
              <option key={colName} value={colName}>
                {colName}
              </option>
            );
          })}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Y-Axis</label>
        <select
          value={yField || ""}
          onChange={(e) => onYFieldChange?.(e.target.value)}
          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Select field...</option>
          {queryResult.columns.map((col) => {
            const colName = typeof col === "string" ? col : col.name;
            return (
              <option key={colName} value={colName}>
                {colName}
              </option>
            );
          })}
        </select>
      </div>
    </div>
  );
}
