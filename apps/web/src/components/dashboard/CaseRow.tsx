import Link from "next/link";
import type { BusinessCase, DifficultyLevel } from "@/lib/mock/dashboard";

function DifficultyBadge({ difficulty }: { difficulty: DifficultyLevel }) {
  const styles = {
    "Beginner-Friendly": "bg-green-100 text-green-700",
    Intermediate: "bg-slate-100 text-slate-600",
    Advanced: "bg-red-100 text-red-700",
  };

  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded whitespace-nowrap ${styles[difficulty]}`}>
      {difficulty}
    </span>
  );
}

interface CaseRowProps {
  case: BusinessCase;
}

export function CaseRow({ case: businessCase }: CaseRowProps) {
  return (
    <div className="border-b border-slate-100 py-5 last:border-b-0">
      <div className="flex items-start justify-between gap-4 mb-2">
        <div>
          <h4 className="text-sm font-bold text-slate-900">{businessCase.title}</h4>
        </div>
        <DifficultyBadge difficulty={businessCase.difficulty} />
      </div>

      <p className="text-xs text-slate-500 mb-2">
        <span className="inline-block mr-1">•</span>
        {businessCase.domain}
      </p>

      <p className="text-sm text-slate-600 mb-3 truncate">{businessCase.description}</p>

      <div className="text-xs text-slate-500 mb-3">
        <span className="font-mono text-slate-600">{businessCase.tableCount} tables</span>
        {" ("}
        {businessCase.tables.map((t, i) => (
          <span key={t}>
            {i > 0 && ", "}
            <span className="font-mono">{t}</span>
          </span>
        ))}
        {")"}
        <span className="ml-2">• Target: {businessCase.target}</span>
      </div>

      <div className="text-right">
        <Link href="#" className="text-indigo-600 text-sm font-semibold hover:text-indigo-700 transition">
          View case brief ›
        </Link>
      </div>
    </div>
  );
}
