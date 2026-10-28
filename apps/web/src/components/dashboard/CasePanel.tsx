import { Lightbulb, SlidersHorizontal, Upload } from "lucide-react";
import { CaseRow } from "./CaseRow";
import type { BusinessCase } from "@/lib/mock/dashboard";

interface CasePanelProps {
  cases: BusinessCase[];
}

export function CasePanel({ cases }: CasePanelProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-start justify-between gap-4 mb-2">
          <h2 className="text-xl font-bold text-slate-900">Explore Business Cases</h2>
          <button className="px-3 py-2 border border-slate-300 bg-white rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition flex items-center gap-2 whitespace-nowrap">
            <SlidersHorizontal size={16} />
            Filter Domain
          </button>
        </div>
        <p className="text-sm text-slate-600">
          Structured analytical scenarios with defined business objectives and production schemas.
        </p>
      </div>

      <div className="px-6">
        {cases.map((c) => (
          <CaseRow key={c.id} case={c} />
        ))}
      </div>

      <div className="bg-indigo-50 px-6 py-4 border-t border-indigo-100">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Lightbulb size={20} />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-slate-900 text-sm mb-1">
              Need a custom analytical brief for your organization?
            </p>
            <p className="text-slate-600 text-sm">
              Define business questions against custom S3 buckets or local Parquet files.
            </p>
          </div>
          <button className="px-4 py-2 border border-slate-300 bg-white rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition flex items-center gap-2 whitespace-nowrap">
            <Upload size={16} />
            Upload Schema
          </button>
        </div>
      </div>
    </div>
  );
}
