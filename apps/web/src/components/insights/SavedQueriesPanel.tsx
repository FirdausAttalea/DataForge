"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Loader, Trash2 } from "lucide-react";
import type { SavedQuery } from "@/lib/sqllab/types";
import * as queriesApi from "@/lib/api/queries";

interface SavedQueriesPanelProps {
  projectId: string;
  onSelectQuery?: (query: SavedQuery) => void;
}

export default function SavedQueriesPanel({ projectId, onSelectQuery }: SavedQueriesPanelProps) {
  const [queries, setQueries] = useState<SavedQuery[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const loadQueries = async () => {
    try {
      const data = await queriesApi.listQueries(projectId);
      setQueries(data);
    } catch {
      setQueries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadQueries();
  }, [projectId]);

  const handleDelete = async (e: React.MouseEvent, queryId: string) => {
    e.stopPropagation();
    if (!confirm("Delete this query?")) return;
    
    setDeleting(queryId);
    try {
      await queriesApi.deleteQuery(projectId, queryId);
      setQueries((prev) => prev.filter((q) => q.id !== queryId));
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition"
      >
        <h3 className="text-sm font-semibold text-slate-900">Saved Queries</h3>
        <ChevronDown
          size={16}
          className={`text-slate-400 transition ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {expanded && (
        <div className="border-t border-slate-200 max-h-64 overflow-y-auto">
          {loading ? (
            <div className="p-4 flex items-center justify-center gap-2 text-slate-500">
              <Loader size={14} className="animate-spin" />
              <span className="text-xs">Loading...</span>
            </div>
          ) : queries.length === 0 ? (
            <p className="p-4 text-xs text-slate-500">No saved queries yet</p>
          ) : (
            <ul className="divide-y divide-slate-200">
              {queries.map((query) => (
                <li key={query.id} className="group">
                  <div className="flex items-center justify-between px-4 py-2 hover:bg-indigo-50 transition">
                    <button
                      onClick={() => onSelectQuery?.(query)}
                      className="flex-1 text-left focus:outline-none"
                      title={query.sql}
                    >
                      <div className="font-medium text-slate-900 truncate text-xs">{query.title || query.name}</div>
                      <div className="text-slate-500 text-[10px]">{query.name}</div>
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, query.id)}
                      disabled={deleting === query.id}
                      className="ml-2 p-1 text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition disabled:opacity-50"
                      title="Delete query"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
