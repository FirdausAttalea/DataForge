import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getBusinessCases, getTables } from "@/lib/store";
import { getCaseRankForRole } from "@/lib/store/recommendations";
import type { UserRole } from "@/lib/store";

const difficultyStyles: Record<string, string> = {
  "Beginner-Friendly": "bg-green-100 text-green-700",
  Intermediate: "bg-slate-100 text-slate-600",
  Advanced: "bg-red-100 text-red-700",
};

export default async function CasesPage() {
  const session = await getSession();
  if (!session.user) redirect("/sign-in");

  const role = session.user.role as UserRole;
  const allCases = getBusinessCases();
  const allTables = getTables();
  const sorted = [...allCases].sort((a, b) => getCaseRankForRole(a.id, role) - getCaseRankForRole(b.id, role));

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-1">Explore Cases</h1>
        <p className="text-slate-600">Discover structured business case scenarios.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {sorted.map((bc, idx) => {
          const tableNames = bc.tableIds
            .map((tid) => allTables.find((t) => t.id === tid)?.name)
            .filter(Boolean) as string[];
          const isRecommended = idx === 0;

          return (
            <div
              key={bc.id}
              className={`px-6 py-5 ${idx > 0 ? "border-t border-slate-100" : ""}`}
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">{bc.title}</h3>
                  {isRecommended && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
                      Recommended
                    </span>
                  )}
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded whitespace-nowrap ${difficultyStyles[bc.difficulty] ?? ""}`}>
                  {bc.difficulty}
                </span>
              </div>

              <p className="text-xs text-slate-500 mb-2">
                {bc.domain} · Target: <span className="font-semibold text-slate-700">{bc.target}</span>
              </p>

              <p className="text-sm text-slate-600 mb-3">{bc.objective}</p>

              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1.5">
                  {tableNames.map((t) => (
                    <span key={t} className="inline-block px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-mono rounded">
                      {t}
                    </span>
                  ))}
                </div>
                <Link
                  href={`/cases/${bc.id}`}
                  className="text-indigo-600 text-sm font-semibold hover:text-indigo-700 transition whitespace-nowrap ml-4"
                >
                  View case brief ›
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
