"use client";

import type { QueryResult } from "@/lib/sqllab/types";
import type { ChartType } from "./ChartFormatPicker";
import ChartRenderer from "./ChartRenderer";

interface ChartCardProps {
  queryResult: QueryResult;
  chartType?: ChartType;
  xField?: string;
  yField?: string;
  colorField?: string;
}

export default function ChartCard({
  queryResult,
  chartType = "bar",
  xField,
  yField,
  colorField,
}: ChartCardProps) {
  if (!xField || !yField) {
    return (
      <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
        <h3 className="text-base font-semibold text-slate-900 mb-4">Chart Preview</h3>
        <div className="h-64 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-lg text-slate-400">
          Select X and Y axis fields to render chart
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
      <h3 className="text-base font-semibold text-slate-900 mb-4">Chart Preview</h3>
      <div className="h-96 border border-slate-200 rounded-lg overflow-hidden">
        <ChartRenderer
          type={chartType}
          queryResult={queryResult}
          xField={xField}
          yField={yField}
          colorField={colorField}
        />
      </div>
    </div>
  );
}
