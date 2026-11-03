import type { SavedQuery, QueryResult } from "@/lib/sqllab/types";

interface SourceQueryCardProps {
  savedQuery: SavedQuery;
  queryResult: QueryResult;
}

export default function SourceQueryCard({ savedQuery, queryResult }: SourceQueryCardProps) {
  return (
    <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 flex items-center justify-center bg-indigo-50 text-indigo-600 rounded-lg">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Source Query</h3>
          <p className="text-xs text-slate-500 line-clamp-1">{savedQuery.title}</p>
        </div>
      </div>
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{queryResult.rows.length} rows</span>
        <span>{queryResult.columns.length} columns</span>
      </div>
    </div>
  );
}
