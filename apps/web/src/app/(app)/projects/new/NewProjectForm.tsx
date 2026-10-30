"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import type { BusinessCase, TableDef } from "@/lib/store";

interface NewProjectFormProps {
  cases: BusinessCase[];
  tables: TableDef[];
}

export function NewProjectForm({ cases, tables }: NewProjectFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefillCaseId = searchParams.get("caseId") || "";
  const prefillCase = prefillCaseId ? cases.find((c) => c.id === prefillCaseId) : undefined;

  const [title, setTitle] = useState(prefillCase?.title ?? "");
  const [description, setDescription] = useState(prefillCase?.objective ?? "");
  const [caseId, setCaseId] = useState(prefillCaseId);
  const [selectedTableIds, setSelectedTableIds] = useState<string[]>(prefillCase?.tableIds ?? []);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleCaseChange(newCaseId: string) {
    setCaseId(newCaseId);
    if (newCaseId) {
      const bc = cases.find((c) => c.id === newCaseId);
      if (bc) {
        setTitle(bc.title);
        setDescription(bc.objective);
        setSelectedTableIds(bc.tableIds);
      }
    }
  }

  function toggleTable(id: string) {
    setSelectedTableIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const res = await fetch("/api/v1/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ title, description, caseId: caseId || undefined, tableIds: selectedTableIds }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error?.message || "Could not create project.");
      setSubmitting(false);
      return;
    }

    const data = await res.json();
    router.push(`/projects/${data.project.id}`);
  }

  return (
    <div className="p-6 md:p-8 max-w-2xl">
      <div className="mb-6">
        <Link href="/projects" className="text-sm text-indigo-600 hover:underline">
          ← My Projects
        </Link>
        <h1 className="text-3xl font-bold text-slate-900 mt-2 mb-1">New Project</h1>
        <p className="text-slate-600 text-sm">Start a new analytical investigation.</p>
      </div>

      <form onSubmit={onSubmit} className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-1.5">Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="e.g. Retail Sales Performance"
            className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-1.5">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="What are you trying to answer?"
            className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-1.5">Linked Business Case</label>
          <select
            value={caseId}
            onChange={(e) => handleCaseChange(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
          >
            <option value="">— None —</option>
            {cases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-2">Tables</label>
          <div className="grid grid-cols-2 gap-2">
            {tables.map((t) => (
              <label
                key={t.id}
                className={`flex items-center gap-2 p-2.5 border rounded-lg cursor-pointer text-sm transition ${
                  selectedTableIds.includes(t.id)
                    ? "border-indigo-400 bg-indigo-50"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedTableIds.includes(t.id)}
                  onChange={() => toggleTable(t.id)}
                  className="accent-indigo-600"
                />
                <span className="font-mono text-slate-700">{t.name}</span>
              </label>
            ))}
          </div>
        </div>

        {error && (
          <p role="alert" className="text-red-600 text-sm bg-red-50 p-3 rounded border border-red-200">
            {error}
          </p>
        )}

        <div className="flex items-center justify-between pt-2">
          <Link href="/projects" className="text-sm text-slate-600 hover:text-slate-900 font-semibold">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting || !title.trim()}
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {submitting ? "Creating..." : "Create Project →"}
          </button>
        </div>
      </form>
    </div>
  );
}
