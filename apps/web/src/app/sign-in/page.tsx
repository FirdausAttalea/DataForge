"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, ApiError, type UserOut } from "@/lib/api/client";

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  );
}

function DataForgeIcon() {
  return (
    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="3" width="18" height="18" rx="3" fill="currentColor" />
      <path d="M7 8h10M7 12h7M7 16h10" stroke="white" strokeWidth={1.5} strokeLinecap="round" />
    </svg>
  );
}

function SSOIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  );
}

export default function SignInPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState<UserOut | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  useEffect(() => {
    api
      .me()
      .then((existingUser) => {
        setUser(existingUser);
        router.push("/workspace-setup");
      })
      .catch(() => setUser(null))
      .finally(() => setChecking(false));
  }, [router]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setSubmitting(true);
    setMessage(null);
    try {
      const loggedInUser = await api.login({
        email: String(form.get("email")),
        password: String(form.get("password")),
      });
      setUser(loggedInUser);
      router.push("/workspace-setup");
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : "Could not reach the server.");
      setSubmitting(false);
    }
  }

  async function onSignOut() {
    setSubmitting(true);
    setMessage(null);
    try {
      await api.logout();
      setUser(null);
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : "Could not sign out.");
    } finally {
      setSubmitting(false);
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#eef2ff] via-[#f0f4ff] to-[#f8fafc] flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-500">
          <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-sm">Checking session…</span>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#eef2ff] via-[#f0f4ff] to-[#f8fafc] flex flex-col">
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/60">
          <div className="max-w-[1400px] mx-auto px-6 py-3.5 flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <DataForgeIcon />
              </div>
              <span className="font-bold text-gray-900 text-lg tracking-tight">DataForge</span>
              <span className="text-[10px] font-bold text-indigo-600 tracking-[0.15em] bg-indigo-50 px-2 py-0.5 rounded ml-0.5">WORKBENCH</span>
            </div>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8 max-w-sm w-full text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-1">Signed in</h1>
            <p className="text-gray-500 text-sm mb-6">Welcome, {user.first_name} {user.last_name} ({user.email}).</p>
            <button onClick={onSignOut} disabled={submitting} className="w-full bg-gray-900 text-white py-2.5 rounded-lg font-semibold disabled:opacity-50 hover:bg-gray-800 transition text-sm">
              Sign out
            </button>
            {message && <p role="alert" className="mt-3 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">{message}</p>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#eef2ff] via-[#f0f4ff] to-[#f8fafc] flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/60">
        <div className="max-w-[1400px] mx-auto px-6 py-3.5 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <DataForgeIcon />
            </div>
            <span className="font-bold text-gray-900 text-lg tracking-tight">DataForge</span>
            <span className="text-[10px] font-bold text-indigo-600 tracking-[0.15em] bg-indigo-50 px-2 py-0.5 rounded ml-0.5">WORKBENCH</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              DuckDB Cluster • Production Replica
            </div>
            <button className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
              </svg>
              Support
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Panel */}
        <div className="hidden lg:flex lg:w-[45%] xl:w-[42%] px-12 xl:px-16 py-16 flex-col justify-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-indigo-100/80 text-indigo-700 rounded-full text-xs font-semibold mb-8 tracking-wide">
              <span>🖥️</span>
              <span>Hands-on Analytical Workbench v1.0</span>
            </div>
            
            <h1 className="text-[2.75rem] xl:text-5xl font-black mb-6 text-gray-900 leading-[1.1] tracking-tight">
              Execute queries, isolate insights, forge deliverables.
            </h1>
            
            <p className="text-gray-600 text-base mb-12 leading-relaxed max-w-md">
              Welcome back to your unified analytical environment. Resume your business cases, DuckDB pipelines, and collaborative analytics projects.
            </p>

            {/* Recent Workspace Session Card */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-5 py-3.5 flex items-center justify-between border-b border-gray-100">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Recent Workspace Session
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">200 OK</span>
                  <span className="text-xs font-mono text-gray-400">• 142ms</span>
                </div>
              </div>
              <div className="bg-[#1e1e2e] px-5 py-4">
                <pre className="text-sm font-mono leading-relaxed">
                  <span className="text-violet-400">SELECT</span><span className="text-gray-300"> region, </span><span className="text-blue-400">SUM</span><span className="text-gray-400">(</span><span className="text-gray-300">revenue</span><span className="text-gray-400">)</span><span className="text-violet-400"> AS</span><span className="text-gray-300"> q3_revenue</span>{"\n"}
                  <span className="text-violet-400">FROM</span><span className="text-gray-300"> retail_sales.</span><span className="text-amber-400">orders</span>{"\n"}
                  <span className="text-violet-400">GROUP BY</span><span className="text-gray-300"> 1 </span><span className="text-violet-400">ORDER BY</span><span className="text-gray-300"> 2 </span><span className="text-violet-400">DESC</span><span className="text-violet-400"> LIMIT</span><span className="text-gray-300"> 5;</span>
                </pre>
              </div>
              <div className="px-5 py-3 flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375" />
                  </svg>
                  Dataset: retail_sales_2024.parquet
                </div>
                <span>1.2M rows cached</span>
              </div>
            </div>

            {/* Security Badges */}
            <div className="flex items-center gap-6 mt-8 text-sm text-gray-500">
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
                SOC2 Type II Certified
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
                256-Bit SSL Enforced
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel — Sign-in Form */}
        <div className="w-full lg:w-[55%] xl:w-[58%] flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-[440px] bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8">
            <h2 className="text-2xl font-black mb-1.5 text-gray-900">Sign in to DataForge</h2>
            <p className="text-gray-500 text-sm mb-7">Access your business workspaces, queries, and notebooks.</p>

            <form onSubmit={onSubmit} className="space-y-5">
              {/* Social Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="flex items-center justify-center gap-2.5 border border-gray-300 rounded-lg py-2.5 font-medium text-sm text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition"
                >
                  <GoogleIcon /> Google
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center gap-2.5 border border-gray-300 rounded-lg py-2.5 font-medium text-sm text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition"
                >
                  <GitHubIcon /> GitHub
                </button>
              </div>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 bg-white text-[11px] font-semibold text-gray-400 tracking-[0.12em]">OR WORK EMAIL</span>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">Work Email</label>
                <div className="flex items-center border border-gray-300 rounded-lg px-3.5 py-2.5 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition">
                  <MailIcon />
                  <input 
                    name="email" 
                    type="email" 
                    required 
                    autoComplete="email"
                    placeholder="elena.rostova@acme.com"
                    className="flex-1 ml-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none bg-transparent"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-semibold text-gray-800">Password</label>
                </div>
                <div className="flex items-center border border-gray-300 rounded-lg px-3.5 py-2.5 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition">
                  <LockIcon />
                  <input 
                    name="password" 
                    type={showPassword ? "text" : "password"}
                    required 
                    autoComplete="current-password"
                    placeholder="••••••••••••"
                    className="flex-1 ml-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none bg-transparent"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600 transition ml-2"
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                <div className="flex justify-end">
                  <Link href="/forgot-password" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition">Forgot password?</Link>
                </div>
              </div>

              {/* Remember Me */}
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 accent-indigo-600 rounded border-gray-300 cursor-pointer"
                />
                <span className="text-sm text-gray-600">Remember me for 30 days</span>
              </label>

              {/* Error */}
              {message && <p role="alert" className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">{message}</p>}

              {/* Submit */}
              <button 
                type="submit" 
                disabled={submitting}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-indigo-700 active:bg-indigo-800 transition-all flex items-center justify-center gap-2 text-[15px] shadow-lg shadow-indigo-600/20"
              >
                {submitting ? "Signing in…" : "Sign In to Workbench"}
                {!submitting && <span>→</span>}
              </button>
            </form>

            {/* SSO
            <div className="mt-6 flex items-center justify-between text-sm">
              <span className="text-gray-500">Using company credentials?</span>
              <button className="flex items-center gap-1.5 font-semibold text-gray-900 hover:text-gray-700 transition">
                <SSOIcon />
                Sign in with SSO
              </button>
            </div> */}

            {/* Create Account */}
            <div className="mt-4 text-center text-sm text-gray-500">
              Don&apos;t have a DataForge account?{" "}
              <Link href="/sign-up" className="font-semibold text-indigo-600 hover:text-indigo-700 transition">Create account</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white/60 backdrop-blur-sm border-t border-gray-200/60 py-4">
        <div className="max-w-[1400px] mx-auto px-6 flex justify-between items-center text-sm text-gray-500">
          <span>© 2025 DataForge Technologies Inc. All rights reserved.</span>
          <div className="flex items-center gap-1.5 text-gray-400">
            <Link href="/privacy" className="hover:text-gray-700 transition">Privacy Policy</Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-gray-700 transition">Terms of Service</Link>
            <span>•</span>
            <span className="hover:text-gray-700 transition cursor-pointer">System Status</span>
          </div>
        </div>
      </footer>
    </div>
  );
}