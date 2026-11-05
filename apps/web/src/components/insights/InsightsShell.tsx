"use client";

import { useState, useEffect } from "react";
import type { Workspace } from "@/lib/session";
import type { Project } from "@/lib/store";
import type { SavedQuery, QueryResult } from "@/lib/sqllab/types";
import { SqlLabTopBar } from "@/components/sqllab/SqlLabTopBar";
import InsightsHeader from "./InsightsHeader";
import SourceQueryCard from "./SourceQueryCard";
import ChartFormatPicker, { type ChartType } from "./ChartFormatPicker";
import EncodingsPanel from "./EncodingsPanel";
import ChartCard from "./ChartCard";
import KpiRow from "./KpiRow";
import EmptyState from "./EmptyState";
import SavedQueriesPanel from "./SavedQueriesPanel";
import SavedChartsPanel from "./SavedChartsPanel";
import * as chartsApi from "@/lib/api/charts";
import type { Chart } from "@/lib/api/charts";

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
  const [colorField, setColorField] = useState<string>("");
  const [chartName, setChartName] = useState<string>("Untitled Chart");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const handleSaveChart = async () => {
    if (!queryResult || !savedQuery) return;
    if (!xField || !yField) {
      setSaveMessage("Please select X and Y axis");
      return;
    }

    setIsSaving(true);
    try {
      await chartsApi.createChart(project.id, {
        name: chartName,
        type: chartType,
        sql_query: savedQuery.sql || "",
        encodings: {
          xAxis: xField,
          yAxis: yField,
          colorBreakdown: colorField || undefined,
        },
        options: {
          title: chartName,
        },
      });
      setSaveMessage("Chart saved successfully!");
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err) {
      setSaveMessage(`Error saving chart: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectChart = (chart: Chart) => {
    if (chart.encodings?.xAxis) setXField(chart.encodings.xAxis);
    if (chart.encodings?.yAxis) setYField(chart.encodings.yAxis);
    setColorField(chart.encodings?.colorBreakdown ?? "");
    setChartType(chart.type as ChartType);
    setChartName(chart.name);
  };

  const handleSelectQuery = async (query: SavedQuery) => {
    // Load the query: set SQL and execute to get results
    // This will be handled by the parent page component
    // For now, just trigger a reload by navigating with queryId
    window.location.href = `?queryId=${query.id}`;
  };

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
            <SavedQueriesPanel projectId={project.id} onSelectQuery={handleSelectQuery} />
            <SavedChartsPanel projectId={project.id} onSelectChart={handleSelectChart} />
            <SourceQueryCard savedQuery={savedQuery} queryResult={queryResult} />
            <ChartFormatPicker selectedType={chartType} onChange={setChartType} />
            <EncodingsPanel
              queryResult={queryResult}
              xField={xField}
              yField={yField}
              colorField={colorField}
              onXFieldChange={setXField}
              onYFieldChange={setYField}
              onColorFieldChange={setColorField}
            />
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm space-y-3">
              <input
                type="text"
                value={chartName}
                onChange={(e) => setChartName(e.target.value)}
                placeholder="Chart name"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={handleSaveChart}
                disabled={isSaving || !xField || !yField}
                className="w-full px-4 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isSaving ? "Saving..." : "Save Chart"}
              </button>
              {saveMessage && (
                <p className={`text-xs ${saveMessage.includes("Error") ? "text-red-600" : "text-green-600"}`}>
                  {saveMessage}
                </p>
              )}
            </div>
          </div>
          <div className="xl:col-span-3 space-y-6">
            <ChartCard
              queryResult={queryResult}
              chartType={chartType}
              xField={xField}
              yField={yField}
              colorField={colorField}
            />
            <KpiRow queryResult={queryResult} />
          </div>
        </div>
      </main>
    </div>
  );
}
