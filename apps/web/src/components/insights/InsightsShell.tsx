"use client";

import { useState } from "react";
import type { Workspace } from "@/lib/session";
import type { Project } from "@/lib/store";
import type { SavedQuery, QueryResult } from "@/lib/sqllab/types";
import { SqlLabTopBar } from "@/components/sqllab/SqlLabTopBar";
import InsightsHeader from "./InsightsHeader";
import SourceQueryCard from "./SourceQueryCard";
import ChartFormatPicker from "./ChartFormatPicker";
import EncodingsPanel from "./EncodingsPanel";
import ChartCard from "./ChartCard";
import KpiRow from "./KpiRow";
import EmptyState from "./EmptyState";

type ChartType = "bar" | "line" | "pie";

interface InsightsShellProps {
  project: Project;
  workspace: Workspace;
  savedQuery: SavedQuery | null;
  queryResult: QueryResult | null;
}

export default function InsightsShell({
  project,
  workspace,
  savedQuery,
  queryResult,
}: InsightsShellProps) {
  const firstCol = queryResult?.columns[0];
  const secondCol = queryResult?.columns[1];
  const initialX = firstCol ? (typeof firstCol === "string" ? firstCol : firstCol.name) : "";
  const initialY = secondCol ? (typeof secondCol === "string" ? secondCol : secondCol.name) : "";

  const [chartType, setChartType] = useState<ChartType>("bar");
  const [xField, setXField] = useState<string>(initialX);
  const [yField, setYField] = useState<string>(initialY);

  if (!savedQuery || !queryResult) {
    return <EmptyState projectId={project.id} />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-ambient">
      <SqlLabTopBar
        workspaceName={workspace.name}
        projectTitle={project.title}
        projectId={project.id}
        environment={project.environment || "development"}
      />
      <main className="flex-1 px-4 py-6 md:px-6 lg:px-8">
        <InsightsHeader />
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-1 space-y-6">
            <SourceQueryCard savedQuery={savedQuery} queryResult={queryResult} />
            <ChartFormatPicker selectedType={chartType} onChange={setChartType} />
            <EncodingsPanel
              queryResult={queryResult}
              xField={xField}
              yField={yField}
              onXFieldChange={setXField}
              onYFieldChange={setYField}
            />
          </div>
          <div className="xl:col-span-3 space-y-6">
            <ChartCard
              queryResult={queryResult}
              chartType={chartType}
              xField={xField}
              yField={yField}
            />
            <KpiRow queryResult={queryResult} />
          </div>
        </div>
      </main>
    </div>
  );
}
