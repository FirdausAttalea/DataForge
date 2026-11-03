"use client";

import { useEffect, useRef } from "react";
import * as echarts from "echarts";
import type { QueryResult } from "@/lib/sqllab/types";

type ChartType = "bar" | "line" | "pie";

interface ChartRendererProps {
  type: ChartType;
  queryResult: QueryResult;
  xField?: string;
  yField?: string;
}

export default function ChartRenderer({
  type,
  queryResult,
  xField,
  yField,
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
    const xValues = queryResult.rows.map((row) => {
      const val = row[xField];
      return val !== null && val !== undefined ? String(val) : "";
    });
    const yValues = queryResult.rows.map((row) => {
      const val = row[yField];
      return typeof val === "number" ? val : 0;
    });

    const option: echarts.EChartsOption =
      type === "pie"
        ? {
            title: { text: `${yField} by ${xField}` },
            tooltip: { trigger: "item" },
            series: [
              {
                type: "pie",
                radius: "50%",
                data: xValues.map((x, i) => ({
                  value: yValues[i],
                  name: x,
                })),
              },
            ],
          }
        : {
            title: { text: `${yField} by ${xField}` },
            xAxis: { type: "category", data: xValues },
            yAxis: { type: "value" },
            series: [
              {
                type,
                data: yValues,
              },
            ],
          };

    chart.setOption(option);
  }, [type, queryResult, xField, yField]);

  return <div ref={containerRef} className="w-full h-full" />;
}
