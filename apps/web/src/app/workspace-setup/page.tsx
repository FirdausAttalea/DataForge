"use client";

import { useState, type FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/session/client";

function DataForgeIcon() {
  return (
    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="3" width="18" height="18" rx="3" fill="currentColor" />
      <path d="M7 8h10M7 12h7M7 16h10" stroke="white" strokeWidth={1.5} strokeLinecap="round" />
    </svg>
  );
}

export default function WorkspaceSetupPage() {
  const router = useRouter();
  const { user, loading } = useSession();
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceDomain, setWorkspaceDomain] = useState("");
  const [primaryGoal, setPrimaryGoal] = useState("data_analyst");
  const [experienceLevel, setExperienceLevel] = useState("intermediate");
  const [createStarterProject, setCreateStarterProject] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!loading && user && !initialized) {
      setWorkspaceName(`${user.firstName}'s Workspace`);
      setWorkspaceDomain(`${user.firstName.toLowerCase()}-workspace`);
      setPrimaryGoal(user.role || "data_analyst");
      setInitialized(true);
    }
  }, [loading, user, initialized]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    if (!workspaceName.trim() || !workspaceDomain.trim()) {
      setError("Workspace name and domain are required");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/v1/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: workspaceName,
          slug: workspaceDomain,
          primaryGoal,
          experienceLevel,
          createStarterProject,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message || "Setup failed");
      }

      document.cookie = "df_setup_complete=true; path=/; max-age=31536000; SameSite=Lax";
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not complete setup");
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#eef2ff] via-[#f0f4ff] to-[#f8fafc] flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-500">
          <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#eef2ff] via-[#f0f4ff] to-[#f8fafc] flex flex-col">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/60">
        <div className="max-w-[1400px] mx-auto px-6 py-3.5 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <DataForgeIcon />
            </div>
            <span className="font-bold text-gray-900 text-lg tracking-tight">DataForge</span>
            <span className="text-[10px] font-bold text-indigo-600 tracking-[0.15em] bg-indigo-50 px-2 py-0.5 rounded ml-0.5">SETUP</span>
          </div>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <form onSubmit={onSubmit} className="w-full max-w-[720px] bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8 lg:p-10">
          <h1 className="text-3xl font-black mb-2 text-gray-900">Configure your workspace</h1>
          <p className="text-gray-600 text-sm mb-8 leading-relaxed">
            Set up your workspace with a name, experience level, and optional starter project.
          </p>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">Workspace Name</label>
                <input
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder="My Workspace"
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">Workspace Domain</label>
                <div className="flex items-center border border-gray-300 rounded-lg px-3.5 py-2.5 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition">
                  <span className="text-xs text-gray-400 font-medium">dataforge.app/</span>
                  <input
                    type="text"
                    value={workspaceDomain}
                    onChange={(e) => setWorkspaceDomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    placeholder="my-workspace"
                    className="flex-1 ml-1 text-sm text-gray-900 placeholder-gray-400 focus:outline-none bg-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">Primary Goal</label>
                <select
                  value={primaryGoal}
                  onChange={(e) => setPrimaryGoal(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                >
                  <option value="data_analyst">Data Analyst</option>
                  <option value="analytics_engineer">Analytics Engineer</option>
                  <option value="learner">Learner / Career</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">Experience Level</label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={createStarterProject}
                  onChange={(e) => setCreateStarterProject(e.target.checked)}
                  className="w-4 h-4 accent-indigo-600 rounded"
                />
                <span className="text-sm text-gray-700">
                  <span className="font-semibold">Start with a recommended project</span>
                  <span className="text-gray-600"> – We&apos;ll create a starter project tailored to your role</span>
                </span>
              </label>
            </div>
          </div>

          {error && <p role="alert" className="mt-4 text-red-600 text-sm bg-red-50 p-3 rounded border border-red-200">{error}</p>}

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition"
            >
              Skip for now
            </button>
            <button
              type="submit"
              disabled={submitting || !workspaceName || !workspaceDomain}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-indigo-700 active:bg-indigo-800 transition-all flex items-center gap-2 text-[15px] shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Setting up..." : "Initialize Workspace & Continue"}
              {!submitting && <span>→</span>}
            </button>
          </div>
        </form>
      </div>

      <footer className="bg-white/60 backdrop-blur-sm border-t border-gray-200/60 py-4">
        <div className="max-w-[1400px] mx-auto px-6 flex justify-between items-center text-sm text-gray-500">
          <span>© 2025 DataForge Technologies Inc. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
