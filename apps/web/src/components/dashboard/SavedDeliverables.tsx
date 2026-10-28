import { ExternalLink, FileText, File } from "lucide-react";
import type { Deliverable } from "@/lib/mock/dashboard";

interface SavedDeliverablesProps {
  deliverables: Deliverable[];
}

export function SavedDeliverables({ deliverables }: SavedDeliverablesProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-900">Saved Deliverables</h3>
        <p className="text-xs text-slate-500">Workspace Memo</p>
      </div>

      <div className="space-y-3">
        {deliverables.map((deliverable) => (
          <div key={deliverable.id} className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition cursor-pointer">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
              deliverable.type === "presentation" ? "bg-indigo-100 text-indigo-600" : "bg-green-100 text-green-600"
            }`}>
              {deliverable.type === "presentation" ? <FileText size={18} /> : <File size={18} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 mb-0.5">{deliverable.title}</p>
              <p className="text-xs text-slate-500">{deliverable.subtitle}</p>
            </div>
            <ExternalLink size={16} className="text-slate-400 flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
