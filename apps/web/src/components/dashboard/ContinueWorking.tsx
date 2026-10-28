import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProjectCard } from "./ProjectCard";
import type { Project } from "@/lib/mock/dashboard";

interface ContinueWorkingProps {
  projects: Project[];
  totalCount: number;
}

export function ContinueWorking({ projects, totalCount }: ContinueWorkingProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-slate-900">Continue Working</h2>
          <span className="text-xs font-semibold bg-indigo-100 text-indigo-600 px-2.5 py-1 rounded-full">
            {projects.length} active sessions
          </span>
        </div>
        <Link href="/projects" className="text-sm text-indigo-600 font-semibold hover:text-indigo-700 transition flex items-center gap-1">
          View all projects ({totalCount})
          <ArrowRight size={16} />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
        {projects.slice(0, 3).map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}
