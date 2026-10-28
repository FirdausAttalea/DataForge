import { Folder, Database, Zap, FileText } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  footer: React.ReactNode;
  iconType: "folder" | "database" | "zap" | "file";
}

export function StatCard({ label, value, footer, iconType }: StatCardProps) {
  const icons = {
    folder: <Folder size={20} />,
    database: <Database size={20} />,
    zap: <Zap size={20} />,
    file: <FileText size={20} />,
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              {label}
            </p>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
          </div>
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
            {icons[iconType]}
          </div>
        </div>
      </div>
      <div className="bg-slate-50 px-5 py-3 text-sm text-slate-600 border-t border-slate-100">
        {footer}
      </div>
    </div>
  );
}
