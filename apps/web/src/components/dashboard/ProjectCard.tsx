import Link from "next/link";
import { Clock, Play, Check } from "lucide-react";
import type { Project } from "@/lib/mock/dashboard";

interface StatusPillProps {
  status: "In progress" | "Draft" | "Completed";
}

function StatusPill({ status }: StatusPillProps) {
  const styles = {
    "In progress": "bg-orange-100 text-orange-700",
    Draft: "bg-slate-100 text-slate-600",
    Completed: "bg-green-100 text-green-700",
  };

  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${styles[status]}`}>
      {status}
    </span>
  );
}

function TableChip({ name }: { name: string }) {
  return (
    <span className="inline-flex px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-mono rounded whitespace-nowrap">
      {name}
    </span>
  );
}

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const lastActionIcon = {
    clock: <Clock size={16} />,
    play: <Play size={16} />,
    check: <Check size={16} />,
  }[project.lastAction.icon];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            {project.domain}
          </div>
          <h3 className="text-lg font-bold text-slate-900">{project.title}</h3>
        </div>
        <StatusPill status={project.status} />
      </div>

      <p className="text-slate-600 text-sm mb-4 line-clamp-2">{project.description}</p>

      <div className="mb-4">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Tables</p>
        <div className="flex flex-wrap gap-2">
          {project.tables.map((table) => (
            <TableChip key={table} name={table} />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between text-sm border-t border-slate-100 pt-3">
        <div className="flex items-center gap-1.5 text-slate-600">
          {lastActionIcon}
          <span>{project.lastAction.text}</span>
        </div>
        <Link href={project.actionLink.href} className="text-indigo-600 font-semibold hover:text-indigo-700 transition">
          {project.actionLink.text}
        </Link>
      </div>
    </div>
  );
}
