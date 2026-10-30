"use client";

import Link from "next/link";
import { Bell, CircleHelp, Search, Sparkles } from "lucide-react";
import { getEnvironmentLabel } from "@/lib/sqllab/environment";
import type { ProjectEnvironment } from "@/lib/store";

interface SqlLabTopBarProps {
  workspaceName: string;
  projectTitle: string;
  projectId: string;
  environment: ProjectEnvironment;
}

export function SqlLabTopBar({
  workspaceName,
  projectTitle,
  projectId,
  environment,
}: SqlLabTopBarProps) {
  return (
    <header className="flex flex-col gap-3 border-b border-slate-200/80 bg-white/70 px-4 py-3 backdrop-blur sm:px-6 xl:flex-row xl:items-center xl:justify-between">
      <nav aria-label="Breadcrumb" className="min-w-0">
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
          <li>
            <Link
              href="/dashboard"
              className="rounded font-medium hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              {workspaceName}
            </Link>
          </li>
          <li aria-hidden="true" className="text-slate-300">›</li>
          <li>
            <Link
              href="/projects"
              className="rounded font-medium hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              Projects
            </Link>
          </li>
          <li aria-hidden="true" className="text-slate-300">›</li>
          <li className="min-w-0">
            <Link
              href={`/projects/${projectId}`}
              className="block max-w-[18rem] truncate rounded font-medium hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              title={projectTitle}
            >
              {projectTitle}
            </Link>
          </li>
          <li aria-hidden="true" className="text-slate-300">›</li>
          <li aria-current="page" className="font-semibold text-indigo-600">
            SQL Lab
          </li>
        </ol>
      </nav>

      <div className="flex items-center gap-2 self-stretch xl:self-auto">
        <button
          type="button"
          aria-label="Search DataForge (coming soon)"
          title="Search is a visual placeholder in this prototype"
          className="group flex h-9 min-w-0 flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-left text-sm text-slate-400 shadow-sm transition hover:border-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 xl:w-44 xl:flex-none"
        >
          <Search size={15} aria-hidden="true" className="text-slate-400" />
          <span className="truncate">Search</span>
          <kbd className="ml-auto rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
            ⌘K
          </kbd>
        </button>

        <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-green-300 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
          <span className="h-2 w-2 rounded-full bg-green-500" aria-hidden="true" />
          {getEnvironmentLabel(environment)}
        </span>

        <button
          type="button"
          aria-label="Help and documentation"
          title="Help and documentation"
          className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <CircleHelp size={20} aria-hidden="true" />
        </button>

        <button
          type="button"
          aria-label="Notifications, 1 unread"
          title="Notifications"
          className="relative rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <Bell size={20} aria-hidden="true" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-indigo-600 ring-2 ring-white" aria-hidden="true" />
        </button>

        <span className="sr-only">
          <Sparkles aria-hidden="true" />
        </span>
      </div>
    </header>
  );
}
