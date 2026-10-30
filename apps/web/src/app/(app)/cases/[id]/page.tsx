import { notFound } from "next/navigation";
import Link from "next/link";
import { getBusinessCaseById, getTableById } from "@/lib/store";

const difficultyStyles: Record<string, string> = {
  "Beginner-Friendly": "bg-green-100 text-green-700",
  Intermediate: "bg-slate-100 text-slate-600",
  Advanced: "bg-red-100 text-red-700",
};

export default async function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const businessCase = getBusinessCaseById(id);
  if (!businessCase) notFound();

  const tables = businessCase.tableIds.map((tid) => getTableById(tid)).filter(Boolean);

  return (
    <div className="p-6 md:p-8 max-w-3xl">
      <div className="mb-6">
        <Link href="/cases" className="text-sm text-indigo-600 hover:underline">
          ← Explore Cases
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-start justify-between gap-4 mb-2">
          <h1 className="text-2xl font-bold text-slate-900">{businessCase.title}</h1>
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded whitespace-nowrap ${difficultyStyles[businessCase.difficulty] ?? ""}`}
          >
            {businessCase.difficulty}
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500 mb-6">
          <span>{businessCase.domain}</span>
          <span>·</span>
          <span>Target: <span className="font-semibold text-slate-700">{businessCase.target}</span></span>
        </div>

        <div className="mb-6">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Objective</h3>
          <p className="text-slate-700 text-sm leading-relaxed">{businessCase.objective}</p>
        </div>

        {tables.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Tables ({tables.length})
            </h3>
            <div className="space-y-2">
              {tables.map((t) => (
                <div
                  key={t!.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <div>
                    <span className="font-mono text-sm font-semibold text-slate-800">{t!.name}</span>
                    <p className="text-xs text-slate-500 mt-0.5">{t!.columnsSummary}</p>
                  </div>
                  <span className="text-xs text-slate-400 font-mono whitespace-nowrap ml-4">
                    {t!.rowCount.toLocaleString()} rows
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-slate-100">
          <Link
            href={`/projects/new?caseId=${businessCase.id}`}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition inline-block"
          >
            Start New Project →
          </Link>
        </div>
      </div>
    </div>
  );
}
