"use client";

import { useState, type FormEvent } from "react";
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

function DatabaseIcon() {
  return (
    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
    </svg>
  );
}

const QUERY_ENGINES = [
  {
    id: "duckdb",
    badge: "PG RECOMMENDED",
    name: "DuckDB Embedded v0.10",
    description: "High-speed analytical columnar execution in-memory and Parquet storage.",
    recommended: true,
  },
  {
    id: "postgres",
    badge: "PG",
    name: "PostgreSQL 16 Engine",
    description: "Standard OLTP compatibility with strict schema constraints.",
    recommended: false,
  },
  {
    id: "cloud",
    badge: "DW",
    name: "Cloud Data Warehouse",
    description: "Remote connection to Snowflake, BigQuery, or MotherDuck.",
    recommended: false,
    tag: "Enterprise",
  },
];

const DATASETS = [
  {
    id: "retail",
    name: "Retail Sales Performance",
    tag: "Starter PG",
    description: "Tables: orders (1.2M rows), order_items, customers, products (Parquet)",
    selected: true,
  },
  {
    id: "churn",
    name: "Customer Churn Analysis",
    tag: "Cohort Analysis",
    description: "Tables: subscriptions, events, user_activity, tickets",
    selected: true,
  },
  {
    id: "marketing",
    name: "Marketing Campaign Effectiveness",
    tag: "Attribution",
    description: "Tables: ad_spend, clicks, conversions, channel_metrics",
    selected: false,
  },
];

export default function WorkspaceSetupPage() {
  const router = useRouter();
  const { user, loading } = useSession();
  const [selectedEngine, setSelectedEngine] = useState("duckdb");
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceDomain, setWorkspaceDomain] = useState("");
  const [datasets, setDatasets] = useState(DATASETS);
  const [submitting, setSubmitting] = useState(false);

  function toggleDataset(id: string) {
    setDatasets((prev) => prev.map((d) => (d.id === id ? { ...d, selected: !d.selected } : d)));
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: workspaceName,
          slug: workspaceDomain,
          engine: selectedEngine,
          datasets: datasets.filter((d) => d.selected).map((d) => d.id),
        }),
      });
      if (res.ok) {
        document.cookie = "df_setup_complete=true; path=/; max-age=31536000";
        router.push("/dashboard");
      } else {
        setSubmitting(false);
      }
    } catch {
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

  if (!workspaceName && user) {
    setWorkspaceName(`${user.firstName}'s Workspace`);
    setWorkspaceDomain(`${user.firstName.toLowerCase()}-workspace`);
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
          <div className="flex items-center gap-3">
            <div className="text-xs font-semibold text-gray-500">Step 2 of 3</div>
            <div className="flex gap-1.5">
              <div className="w-16 h-1.5 bg-emerald-500 rounded-full"></div>
              <div className="w-16 h-1.5 bg-emerald-500 rounded-full"></div>
              <div className="w-16 h-1.5 bg-gray-300 rounded-full"></div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <form onSubmit={onSubmit} className="w-full max-w-[720px] bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8 lg:p-10">
          <div className="flex items-center gap-2.5 mb-4">
            <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-sm font-bold text-indigo-600 tracking-wide">Workspace Provisioning</span>
          </div>

          <h1 className="text-3xl font-black mb-2 text-gray-900">Configure your DataForge environment</h1>
          <p className="text-gray-600 text-sm mb-8 leading-relaxed">
            Choose your analytical workspace name, default query engine, and preload sample business datasets.
          </p>

          <div className="space-y-7">
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">Workspace Display Name</label>
                <div className="flex items-center border border-gray-300 rounded-lg px-3.5 py-2.5 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
                  </svg>
                  <input
                    type="text"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    className="flex-1 ml-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none bg-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">Workspace Identifier / Domain</label>
                <div className="flex items-center border border-gray-300 rounded-lg px-3.5 py-2.5 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition">
                  <span className="text-xs text-gray-400 font-medium">dataforge.app/</span>
                  <input
                    type="text"
                    value={workspaceDomain}
                    onChange={(e) => setWorkspaceDomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    className="flex-1 ml-1 text-sm text-gray-900 placeholder-gray-400 focus:outline-none bg-transparent"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">Primary SQL Query Engine</label>
              <div className="space-y-3">
                {QUERY_ENGINES.map((engine) => (
                  <button
                    key={engine.id}
                    type="button"
                    onClick={() => setSelectedEngine(engine.id)}
                    className={`w-full border rounded-xl p-4 text-left transition-all ${
                      selectedEngine === engine.id
                        ? "border-indigo-600 bg-indigo-50 ring-2 ring-indigo-600"
                        : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${selectedEngine === engine.id ? "bg-indigo-600" : "bg-gray-200"}`}>
                        <DatabaseIcon />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded ${engine.recommended ? "bg-emerald-100 text-emerald-700" : "bg-indigo-100 text-indigo-700"}`}>
                            {engine.badge}
                          </span>
                          {engine.tag && <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{engine.tag}</span>}
                        </div>
                        <h3 className="font-bold text-gray-900 text-sm mb-1">{engine.name}</h3>
                        <p className="text-xs text-gray-600 leading-relaxed">{engine.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-semibold text-gray-800">Preload Starter Business Cases & Datasets</label>
                <span className="text-xs text-gray-500 italic">Select what to initialize in your workspace</span>
              </div>
              <div className="space-y-2.5">
                {datasets.map((dataset) => (
                  <button
                    key={dataset.id}
                    type="button"
                    onClick={() => toggleDataset(dataset.id)}
                    className={`w-full border rounded-lg p-3.5 text-left transition-all flex items-start gap-3 ${
                      dataset.selected ? "border-indigo-300 bg-indigo-50/50" : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition ${dataset.selected ? "bg-indigo-600 border-indigo-600" : "border-gray-300"}`}>
                      {dataset.selected && (
                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900 text-sm">{dataset.name}</h3>
                        <span className="text-[10px] font-semibold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">{dataset.tag}</span>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">{dataset.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <button type="button" onClick={() => router.push("/dashboard")} className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition">
              Skip for now
            </button>
            <button type="submit" disabled={submitting || !workspaceName || !workspaceDomain} className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-indigo-700 active:bg-indigo-800 transition-all flex items-center gap-2 text-[15px] shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed">
              {submitting ? "Setting up..." : "Initialize Workspace & Continue"}
              {!submitting && <span>→</span>}
            </button>
          </div>
        </form>
      </div>

      <footer className="bg-white/60 backdrop-blur-sm border-t border-gray-200/60 py-4">
        <div className="max-w-[1400px] mx-auto px-6 flex justify-between items-center text-sm text-gray-500">
          <span>© 2025 DataForge Technologies Inc. All rights reserved.</span>
          <div className="flex items-center gap-1.5 text-gray-400">
            <span className="hover:text-gray-700 transition cursor-pointer">Workspace Docs</span>
            <span>•</span>
            <span className="hover:text-gray-700 transition cursor-pointer">Security Settings</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
