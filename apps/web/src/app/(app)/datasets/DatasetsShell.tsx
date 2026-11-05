"use client";

import { useState } from "react";
import type { TableDef } from "@/lib/store/types";
import { ChevronDown, Database, Table2, Key } from "lucide-react";

const domainColors: Record<string, string> = {
  "Retail & E-commerce": "bg-orange-100 text-orange-700",
  "Subscription SaaS": "bg-blue-100 text-blue-700",
  "Growth Marketing": "bg-green-100 text-green-700",
};

function TableRow({ table }: { table: TableDef }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-200 rounded-xl bg-white overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <Table2 size={16} className="text-indigo-500 shrink-0" />
          <div className="min-w-0">
            <div className="font-semibold text-slate-900 font-mono text-sm">{table.name}</div>
            <div className="text-xs text-slate-500 truncate">
              {table.database}.{table.schema} · {table.rowCount.toLocaleString()} rows
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-4">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${domainColors[table.domain] ?? "bg-slate-100 text-slate-600"}`}>
            {table.domain}
          </span>
          <ChevronDown size={16} className={`text-slate-400 transition ${open ? "rotate-180" : ""}`} />
        </div>
      </button>
      {open && (
        <div className="border-t border-slate-200 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider">
                <th className="px-4 py-2 text-left font-medium">Column</th>
                <th className="px-4 py-2 text-left font-medium">Type</th>
                <th className="px-4 py-2 text-left font-medium">Key</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {table.columns.map((col) => (
                <tr key={col.name} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-2 font-mono text-slate-800">{col.name}</td>
                  <td className="px-4 py-2 text-slate-500">{col.dataType}</td>
                  <td className="px-4 py-2">
                    {col.key && (
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${
                        col.key === "primary" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"
                      }`}>
                        <Key size={9} />
                        {col.key}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function DatasetsShell({ tables }: { tables: TableDef[] }) {
  const [search, setSearch] = useState("");
  const domains = [...new Set(tables.map((t) => t.domain))];
  const filtered = tables.filter(
    (t) =>
      !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.domain.toLowerCase().includes(search.toLowerCase()) ||
      t.database.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <Database size={22} className="text-indigo-600" />
          <h1 className="text-2xl font-bold text-slate-900">Datasets</h1>
        </div>
        <p className="text-slate-500 text-sm">{tables.length} tables across {domains.length} domains</p>
      </div>

      <div className="mb-6">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tables..."
          className="w-full max-w-sm px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {domains.map((domain) => {
        const domainTables = filtered.filter((t) => t.domain === domain);
        if (!domainTables.length) return null;
        return (
          <div key={domain} className="mb-8">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">{domain}</h2>
            <div className="space-y-2">
              {domainTables.map((t) => (
                <TableRow key={t.id} table={t} />
              ))}
            </div>
          </div>
        );
      })}

      {filtered.length === 0 && (
        <p className="text-slate-500 text-sm">No tables match &quot;{search}&quot;</p>
      )}
    </div>
  );
}
