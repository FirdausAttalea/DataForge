"use client";

import { useEffect, useRef } from "react";
import * as echarts from "echarts";
import type { QueryResult } from "@/lib/sqllab/types";
import type { ChartType } from "./ChartFormatPicker";

interface ChartRendererProps {
  type: ChartType;
  queryResult: QueryResult;
  xField?: string;
  yField?: string;
  colorField?: string;
}

export default function ChartRenderer({
  type,
  queryResult,
  xField,
  yField,
  colorField,
}: ChartRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    if (!xField || !yField) return;

    if (!chartRef.current) {
      chartRef.current = echarts.init(containerRef.current);
    }

    const chart = chartRef.current;
    
    // Group data by colorField if provided
    let groupedData: Record<string, Array<{ x: string; y: number }>> = {};
    
    queryResult.rows.forEach((row) => {
      const xVal = row[xField];
      const yVal = row[yField];
      const colorVal = colorField ? String(row[colorField] ?? "default") : "default";
      
      const xStr = xVal !== null && xVal !== undefined ? String(xVal) : "";
      const yNum = typeof yVal === "number" ? yVal : 0;
      
      if (!groupedData[colorVal]) {
        groupedData[colorVal] = [];
      }
      groupedData[colorVal].push({ x: xStr, y: yNum });
    });

    const xValues = Array.from(
      new Set(queryResult.rows.map((r) => String(r[xField] ?? "")))
    ).sort();

    let option: echarts.EChartsOption = {};

    if (type === "donut") {
      // Donut chart: use first series or aggregate
      const firstSeries = Object.values(groupedData)[0] || [];
      option = {
        title: { text: `${yField} by ${xField}` },
        tooltip: { trigger: "item" },
        legend: { orient: "vertical", left: "left" },
        series: [
          {
            type: "pie",
            radius: ["40%", "70%"],
            data: firstSeries.map((d) => ({
              value: d.y,
              name: d.x,
            })),
          },
        ],
      };
    } else if (type === "scatter") {
      const scatterData: Array<[number, number, string]> = [];
      Object.entries(groupedData).forEach(([group, data]) => {
        data.forEach((d, idx) => {
          scatterData.push([idx, d.y, group]);
        });
      });
      
      option = {
        title: { text: `${yField} by ${xField}` },
        tooltip: { trigger: "item" },
        xAxis: { type: "category", data: xValues },
        yAxis: { type: "value" },
        series: [
          {
            type: "scatter",
            data: scatterData.map(([x, y]) => [x, y]),
            symbolSize: 8,
          },
        ],
      };
    } else if (type === "heatmap") {
      const heatmapData: Array<[number, number, number]> = [];
      Object.entries(groupedData).forEach(([group, data], groupIdx) => {
        data.forEach((d, xIdx) => {
          heatmapData.push([xIdx, groupIdx, d.y]);
        });
      });
      
      option = {
        title: { text: `${yField} by ${xField}` },
        tooltip: { position: "top" },
        xAxis: { type: "category", data: xValues },
        yAxis: { type: "category", data: Object.keys(groupedData) },
        visualMap: { min: 0, max: Math.max(...heatmapData.map((d) => d[2])) },
        series: [
          {
            type: "heatmap",
            data: heatmapData,
          },
        ],
      };
    } else {
      // Bar, Line, Area
      const series = Object.entries(groupedData).map(([group, data]) => {
        const yValues = xValues.map((x) => {
          const found = data.find((d) => d.x === x);
          return found?.y ?? 0;
        });
        
        return {
          name: group !== "default" ? String(group) : "",
          type: type === "area" ? "line" : type,
          data: yValues,
          ...(type === "area" ? { areaStyle: {} } : {}),
        };
      });

      option = {
        title: { text: `${yField} by ${xField}` },
        tooltip: { trigger: "axis" },
        legend: { data: series.map((s) => s.name).filter((n) => n) },
        xAxis: { type: "category", data: xValues },
        yAxis: { type: "value" },
        series,
        grid: { containLabel: true },
      };
    }

    chart.setOption(option);
  }, [type, queryResult, xField, yField, colorField]);

  return <div ref={containerRef} className="w-full h-full min-h-96" />;
}
