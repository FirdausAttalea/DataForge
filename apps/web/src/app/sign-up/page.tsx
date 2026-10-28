"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, ApiError } from "@/lib/api/client";

const ROLES = [
  { label: "Data Analyst", icon: "chart" },
  { label: "Analytics Eng", icon: "cog" },
  { label: "Learner/Career", icon: "academic" },
] as const;

function RoleIcon({ type }: { type: string }) {
  if (type === "chart")
    return (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    );
  if (type === "cog")
    return (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    );
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
    </svg>
  );
}

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

function DataForgeIcon() {
  return (
    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="3" width="18" height="18" rx="3" fill="currentColor" />
      <path d="M7 8h10M7 12h7M7 16h10" stroke="white" strokeWidth={1.5} strokeLinecap="round" />
    </svg>
  );
}

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: "", color: "" };
  
  let score = 0;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 2) return { score, label: "Weak", color: "red" };
  if (score <= 3) return { score, label: "Fair", color: "yellow" };
  return { score: Math.min(score, 4), label: "Strong", color: "green" };
}

export default function SignUpPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>(ROLES[0].label);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [password, setPassword] = useState("");
  const strength = getPasswordStrength(password);
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    
    if (!agreedToTerms) {
      setMessage("You must agree to the terms of service.");
      return;
    }

    setStatus("submitting");
    setMessage(null);
    try {
      await api.register({
        email: String(form.get("email")),
        password: String(form.get("password")),
        first_name: String(form.get("firstName")),
        last_name: String(form.get("lastName")),
        role: selectedRole,
      });
      document.cookie = "df_setup_complete=false; path=/; max-age=31536000";
      router.push("/workspace-setup");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof ApiError ? err.message : "Could not reach the server.");
      setStatus("idle");
    }
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
            <span className="text-sm text-gray-600">Already have an account?</span>
            <Link href="/sign-in" className="text-sm font-semibold text-gray-900 border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50 transition">Sign In</Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Panel */}
        <div className="hidden lg:flex lg:w-[45%] xl:w-[42%] px-12 xl:px-16 py-16 flex-col justify-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-indigo-100/80 text-indigo-700 rounded-full text-xs font-semibold mb-8 tracking-wide">
              <span>🚀</span>
              <span>14-Day Free Professional Sandbox</span>
            </div>
            
            <h1 className="text-[2.75rem] xl:text-5xl font-black mb-6 text-gray-900 leading-[1.1] tracking-tight">
              Start mastering realistic business data analytics.
            </h1>
            
            <p className="text-gray-600 text-base mb-12 leading-relaxed max-w-md">
              Spin up an isolated DuckDB instance with realistic retail, marketing, and SaaS schemas pre-loaded in seconds. No credit card required.
            </p>

            <div className="space-y-7">
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1 text-[15px]">High-Performance SQL Lab</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">Instant in-browser query execution powered by DuckDB WASM and remote server replicas.</p>
                </div>
              </div>
              
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1 text-[15px]">Realistic Business Cases</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">Solve actual customer churn, retail revenue, and marketing ROI scenarios with real deliverables.</p>
                </div>
              </div>
              
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1 text-[15px]">One-Click Visual Insights</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">Seamlessly turn query results into board-ready executive charts and shareable decks.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Testimonial */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-indigo-100 mt-12">
            <p className="text-sm text-gray-700 italic mb-4 leading-relaxed">
              &ldquo;DataForge feels like a real production data warehouse rather than an artificial toy. The DuckDB speed is staggering.&rdquo;
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 text-xs font-bold">ER</div>
              <p className="text-sm font-semibold text-gray-900">Elena Rostova <span className="font-normal text-gray-500">• Staff Architect, Acme Analytics</span></p>
            </div>
          </div>
        </div>

        {/* Right Panel — Form */}
        <div className="w-full lg:w-[55%] xl:w-[58%] flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-[440px] bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8">
            <h2 className="text-2xl font-black mb-1.5 text-gray-900">Create your DataForge account</h2>
            <p className="text-gray-500 text-sm mb-7">Get instant access to your private data workbench.</p>

            <form onSubmit={onSubmit} className="space-y-5">
              {/* Social Buttons — side by side */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="flex items-center justify-center gap-2.5 border border-gray-300 rounded-lg py-2.5 font-medium text-sm text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition"
                >
                  <GoogleIcon /> Sign up with Google
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center gap-2.5 border border-gray-300 rounded-lg py-2.5 font-medium text-sm text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition"
                >
                  <GitHubIcon /> Sign up with GitHub
                </button>
              </div>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 bg-white text-[11px] font-semibold text-gray-400 tracking-[0.12em]">OR REGISTER WITH EMAIL</span>
                </div>
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1.5">First Name</label>
                  <input 
                    name="firstName" 
                    type="text" 
                    required 
                    autoComplete="given-name"
                    placeholder="Elena"
                    className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1.5">Last Name</label>
                  <input 
                    name="lastName" 
                    type="text" 
                    required 
                    autoComplete="family-name"
                    placeholder="Rostova"
                    className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white transition"
                  />
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
                    placeholder="elena.rostova@analytics.io"
                    className="flex-1 ml-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none bg-transparent"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">Create Password</label>
                <div className="flex items-center border border-gray-300 rounded-lg px-3.5 py-2.5 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition">
                  <LockIcon />
                  <input 
                    name="password" 
                    type={showPassword ? "text" : "password"}
                    required 
                    minLength={12} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    placeholder="••••••••••••••••"
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
                
                {password && (
                  <>
                    <div className="flex gap-1.5 mt-2.5">
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-1.5 flex-1 rounded-full transition-colors ${
                            i < strength.score
                              ? strength.color === "green"
                                ? "bg-emerald-500"
                                : strength.color === "yellow"
                                ? "bg-amber-400"
                                : "bg-red-400"
                              : "bg-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                    
                    <div className="flex justify-between items-center text-xs mt-1.5">
                      <span className={strength.color === "green" ? "text-emerald-600 font-semibold" : strength.color === "yellow" ? "text-amber-600 font-semibold" : "text-red-500 font-semibold"}>
                        {strength.label && `✓ ${strength.label} security score`}
                      </span>
                      <span className="text-gray-400">Min 8 chars, numbers & symbol</span>
                    </div>
                   </>
                 )}
               </div>

               <div className="flex justify-end">
                 <Link href="/forgot-password" className="text-xs text-indigo-600 hover:text-indigo-700 transition">Forgot password?</Link>
               </div>

               {/* Role Selection */}
              <div className="space-y-2.5 pt-1">
                <span className="block text-sm font-semibold text-gray-800">Primary Role / Objective</span>
                <div className="grid grid-cols-3 gap-2.5">
                  {ROLES.map((role) => (
                    <button
                      key={role.label}
                      type="button"
                      onClick={() => setSelectedRole(role.label)}
                      className={`py-3.5 px-2 rounded-xl border text-xs font-semibold transition-all flex flex-col items-center gap-2 ${
                        selectedRole === role.label
                          ? "border-indigo-600 bg-indigo-50 text-indigo-600 ring-1 ring-indigo-600"
                          : "border-gray-300 text-gray-600 hover:border-gray-400 hover:bg-gray-50"
                      }`}
                    >
                      <RoleIcon type={role.icon} />
                      <span>{role.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Terms */}
              <label className="flex items-start gap-3 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 w-4.5 h-4.5 accent-indigo-600 rounded border-gray-300 cursor-pointer"
                />
                <span className="text-sm text-gray-600 leading-relaxed">
                  I agree to DataForge&apos;s{" "}
                  <a href="/terms" className="text-indigo-600 font-semibold underline hover:no-underline">Terms of Service</a> and{" "}
                  <a href="/privacy" className="text-indigo-600 font-semibold underline hover:no-underline">Privacy Policy</a>.
                </span>
              </label>

              {/* Error */}
              {message && <p role="alert" className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">{message}</p>}

              {/* Submit */}
              <button 
                type="submit" 
                disabled={status === "submitting" || !agreedToTerms}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-indigo-700 active:bg-indigo-800 transition-all flex items-center justify-center gap-2 text-[15px] mt-4 shadow-lg shadow-indigo-600/20"
              >
                {status === "submitting" ? "Creating account…" : "Create Free Workbench Account"}
                {status !== "submitting" && <span>→</span>}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white/60 backdrop-blur-sm border-t border-gray-200/60 py-4">
        <div className="max-w-[1400px] mx-auto px-6 flex justify-between items-center text-sm text-gray-500">
          <span>© 2025 DataForge Technologies Inc. All rights reserved.</span>
          <div className="flex items-center gap-1.5 text-gray-400">
            <Link href="/privacy" className="hover:text-gray-700 transition">Privacy</Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-gray-700 transition">Terms</Link>
            <span>•</span>
            <span className="hover:text-gray-700 transition cursor-pointer">Security Overview</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
