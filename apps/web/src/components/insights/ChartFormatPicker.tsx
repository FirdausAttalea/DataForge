"use client";

type ChartType = "bar" | "line" | "pie";

interface ChartFormatPickerProps {
  selectedType?: ChartType;
  onChange?: (type: ChartType) => void;
}

export default function ChartFormatPicker({
  selectedType = "bar",
  onChange,
}: ChartFormatPickerProps) {
  const types: Array<{ id: ChartType; label: string }> = [
    { id: "bar", label: "Bar Chart" },
    { id: "line", label: "Line Chart" },
    { id: "pie", label: "Pie Chart" },
  ];

  return (
    <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900 mb-3">Chart Type</h3>
      <div className="grid grid-cols-3 gap-2">
        {types.map((type) => (
          <button
            key={type.id}
            onClick={() => onChange?.(type.id)}
            className={`px-2 py-2 text-xs font-medium rounded-lg transition ${
              selectedType === type.id
                ? "bg-indigo-600 text-white border border-indigo-600"
                : "text-slate-700 bg-slate-50 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>
    </div>
  );
}
