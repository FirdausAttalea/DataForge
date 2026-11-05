"use client";

export type ChartType = "bar" | "line" | "area" | "scatter" | "donut" | "heatmap";

interface ChartFormatPickerProps {
  selectedType?: ChartType;
  onChange?: (type: ChartType) => void;
}

export default function ChartFormatPicker({
  selectedType = "bar",
  onChange,
}: ChartFormatPickerProps) {
  const types: Array<{ id: ChartType; label: string; icon: string }> = [
    { id: "bar", label: "Bar", icon: "📊" },
    { id: "line", label: "Line", icon: "📈" },
    { id: "area", label: "Area", icon: "🔺" },
    { id: "scatter", label: "Scatter", icon: "⚫" },
    { id: "donut", label: "Donut", icon: "🍩" },
    { id: "heatmap", label: "Heatmap", icon: "🔥" },
  ];

  return (
    <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900 mb-3">Chart Format</h3>
      <div className="grid grid-cols-3 gap-2">
        {types.map((type) => (
          <button
            key={type.id}
            onClick={() => onChange?.(type.id)}
            className={`px-2 py-2 text-xs font-medium rounded-lg transition flex items-center justify-center gap-1 ${
              selectedType === type.id
                ? "bg-indigo-600 text-white border border-indigo-600"
                : "text-slate-700 bg-slate-50 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            <span>{type.icon}</span>
            <span>{type.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
