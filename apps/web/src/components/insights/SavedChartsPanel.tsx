"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Loader } from "lucide-react";
import type { Chart } from "@/lib/api/charts";
import * as chartsApi from "@/lib/api/charts";

interface SavedChartsPanelProps {
  projectId: string;
  onSelectChart?: (chart: Chart) => void;
}

export default function SavedChartsPanel({ projectId, onSelectChart }: SavedChartsPanelProps) {
  const [charts, setCharts] = useState<Chart[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    const loadCharts = async () => {
      try {
        const data = await chartsApi.listCharts(projectId);
        setCharts(data);
      } catch {
        setCharts([]);
      } finally {
        setLoading(false);
      }
    };
    
    void loadCharts();
  }, [projectId]);

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition"
      >
        <h3 className="text-sm font-semibold text-slate-900">Saved Charts</h3>
        <ChevronDown
          size={16}
          className={`text-slate-400 transition ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {expanded && (
        <div className="border-t border-slate-200 max-h-64 overflow-y-auto">
          {loading ? (
            <div className="p-4 flex items-center justify-center gap-2 text-slate-500">
              <Loader size={14} className="animate-spin" />
              <span className="text-xs">Loading...</span>
            </div>
          ) : charts.length === 0 ? (
            <p className="p-4 text-xs text-slate-500">No saved charts yet</p>
          ) : (
            <ul className="divide-y divide-slate-200">
              {charts.map((chart) => (
                <li key={chart.id}>
                  <button
                    onClick={() => onSelectChart?.(chart)}
                    className="w-full text-left px-4 py-2 text-xs hover:bg-indigo-50 transition focus:outline-none focus:bg-indigo-50"
                    title={chart.description || chart.name}
                  >
                    <div className="font-medium text-slate-900 truncate">{chart.name}</div>
                    <div className="text-slate-500 text-[10px]">{chart.type}</div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
