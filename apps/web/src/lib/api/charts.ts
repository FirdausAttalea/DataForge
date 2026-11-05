/**
 * API client for charts endpoint.
 */

import type { ChartType } from "@/components/insights/ChartFormatPicker";

export interface ChartEncodings {
  xAxis: string;
  yAxis: string;
  colorBreakdown?: string;
}

export interface ChartOptions {
  title?: string;
  legend?: boolean;
  tooltip?: boolean;
}

export interface Chart {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  type: ChartType;
  sql_query: string;
  encodings: ChartEncodings;
  options: ChartOptions;
  created_at: string;
  updated_at: string;
}

export interface ChartRenderResult {
  status: "success" | "error" | "empty";
  option: Record<string, any>;
  row_count?: number;
  duration_ms?: number;
  message?: string;
}

/**
 * Create a new chart.
 */
export async function createChart(
  projectId: string,
  data: {
    name: string;
    description?: string;
    type: ChartType;
    sql_query: string;
    encodings: ChartEncodings;
    options?: ChartOptions;
  }
): Promise<Chart> {
  const response = await fetch(`/api/v1/charts?project_id=${projectId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Create chart failed: ${response.statusText}`);
  return response.json();
}

/**
 * Get a chart by ID.
 */
export async function getChart(projectId: string, chartId: string): Promise<Chart> {
  const response = await fetch(`/api/v1/charts/${chartId}?project_id=${projectId}`, {
    credentials: "include",
  });
  if (!response.ok) throw new Error(`Get chart failed: ${response.statusText}`);
  return response.json();
}

/**
 * List charts in a project.
 */
export async function listCharts(projectId: string): Promise<Chart[]> {
  const response = await fetch(`/api/v1/charts/project/${projectId}`, {
    credentials: "include",
  });
  if (!response.ok) {
    console.error("listCharts failed:", response.status, response.statusText);
    return [];
  }
  return response.json();
}

/**
 * Update a chart.
 */
export async function updateChart(
  projectId: string,
  chartId: string,
  data: Partial<{
    name: string;
    description: string;
    type: ChartType;
    sql_query: string;
    encodings: ChartEncodings;
    options: ChartOptions;
  }>
): Promise<Chart> {
  const response = await fetch(`/api/v1/charts/${chartId}?project_id=${projectId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Update chart failed: ${response.statusText}`);
  return response.json();
}

/**
 * Delete a chart.
 */
export async function deleteChart(projectId: string, chartId: string): Promise<void> {
  const response = await fetch(`/api/v1/charts/${chartId}?project_id=${projectId}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!response.ok) throw new Error(`Delete chart failed: ${response.statusText}`);
}

/**
 * Render a chart (execute query and get ECharts option).
 */
export async function renderChart(projectId: string, chartId: string): Promise<ChartRenderResult> {
  const response = await fetch(`/api/v1/charts/${chartId}/render?project_id=${projectId}`, {
    method: "POST",
    credentials: "include",
  });
  if (!response.ok) throw new Error(`Render chart failed: ${response.statusText}`);
  return response.json();
}
