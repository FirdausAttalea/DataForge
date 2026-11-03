"use client";

import type { QueryResult } from "@/lib/sqllab/types";

interface KpiRowProps {
  queryResult?: QueryResult;
}

export default function KpiRow({ queryResult }: KpiRowProps) {
  const kpis = queryResult
    ? calculateKpis(queryResult)
    : [
        { label: "Total Revenue", value: "$124,500" },
        { label: "Total Orders", value: "1,240" },
        { label: "Avg Order Value", value: "$100.40" },
      ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {kpis.map((kpi) => (
        <div key={kpi.label} className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
          <p className="text-xs text-slate-500">{kpi.label}</p>
          <p className="text-lg font-semibold text-slate-900 mt-1">{kpi.value}</p>
        </div>
      ))}
    </div>
  );
}

function calculateKpis(
  queryResult: QueryResult
): Array<{ label: string; value: string }> {
  if (queryResult.rows.length === 0) return [];

  const kpis: Array<{ label: string; value: string }> = [];

  // Find numeric columns for aggregation
  const numericCols = queryResult.columns.filter((col) =>
    queryResult.rows.some((row) => typeof row[String(col)] === "number")
  );

  if (numericCols.length > 0) {
    const firstNumCol = String(numericCols[0]);
    const sum = (queryResult.rows as Record<string, any>[]).reduce(
      (acc, row) => acc + (typeof row[firstNumCol] === "number" ? row[firstNumCol] : 0),
      0
    );
    kpis.push({
      label: `Total ${firstNumCol}`,
      value: sum > 1000 ? `$${(sum / 1000).toFixed(1)}K` : sum.toLocaleString(),
    });

    const avg = sum / queryResult.rows.length;
    kpis.push({
      label: `Average ${firstNumCol}`,
      value: avg > 1000 ? `$${(avg / 1000).toFixed(1)}K` : avg.toFixed(2),
    });
  }

  kpis.push({
    label: "Row Count",
    value: queryResult.rows.length.toLocaleString(),
  });

  return kpis.slice(0, 3);
}
