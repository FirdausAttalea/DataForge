"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

function DataForgeIcon() {
  return (
    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="3" width="18" height="18" rx="3" fill="currentColor" />
      <path d="M7 8h10M7 12h7M7 16h10" stroke="white" strokeWidth={1.5} strokeLinecap="round" />
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

function KeyIcon() {
  return (
    <svg className="w-16 h-16 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
    </svg>
  );
}

export default function ForgotPasswordPage() {
  const [status, setStatus] = useState<"idle" | "submitting" | "sent">("idle");
  const [email, setEmail] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    await new Promise((r) => setTimeout(r, 800));
    setStatus("sent");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#eef2ff] via-[#f0f4ff] to-[#f8fafc] flex items-center justify-center p-4">
      <div className="absolute top-6 left-6 flex items-center gap-2.5">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
          <DataForgeIcon />
        </div>
        <span className="font-bold text-gray-900 text-lg tracking-tight">DataForge</span>
        <span className="text-[10px] font-bold text-indigo-600 tracking-[0.15em] bg-indigo-50 px-2 py-0.5 rounded">WORKBENCH</span>
      </div>

      <Link href="/sign-in" className="absolute top-6 right-6 text-sm text-gray-600 hover:text-gray-900 transition flex items-center gap-1.5">
        <span>←</span> Return to Sign In
      </Link>

      <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8 max-w-md w-full">
        <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <KeyIcon />
        </div>

        <h1 className="text-2xl font-black mb-2 text-gray-900 text-center">Forgot your password?</h1>
        <p className="text-gray-500 text-sm mb-8 text-center leading-relaxed">
          Enter the verified work email address linked to your DataForge workspace and we&apos;ll send you an encrypted recovery link.
        </p>

        {status === "sent" ? (
          <div className="space-y-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-start gap-3">
              <svg className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-emerald-900 mb-1">Reset email dispatched.</p>
                <p className="text-xs text-emerald-700 leading-relaxed">Check your inbox in 1-2 minutes.</p>
              </div>
            </div>

            <Link href="/sign-in" className="block text-center text-sm text-indigo-600 font-semibold hover:underline mt-6">
              ← Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">Account Work Email</label>
              <div className="flex items-center border border-gray-300 rounded-lg px-3.5 py-2.5 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition">
                <MailIcon />
                <input
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  placeholder="elena.rostova@acme.io"
                  className="flex-1 ml-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none bg-transparent"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed flex items-start gap-1.5">
                <svg className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>If your organization enforces Single Sign-On (SSO, via Google Workspace), you will be directed to your identity provider.</span>
              </p>
            </div>

            <button
              type="submit"
              disabled={status === "submitting"}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-indigo-700 active:bg-indigo-800 transition-all flex items-center justify-center gap-2 text-[15px] shadow-lg shadow-indigo-600/20"
            >
              {status === "submitting" ? "Sending..." : "Send Reset Instructions"}
              {status !== "submitting" && <span>→</span>}
            </button>

            <Link href="/sign-in" className="block text-center text-sm text-gray-600 hover:text-gray-900 transition mt-4">
              ← Back to Sign In
            </Link>
          </form>
        )}
      </div>

      <footer className="absolute bottom-0 left-0 right-0 bg-white/60 backdrop-blur-sm border-t border-gray-200/60 py-4">
        <div className="max-w-[1400px] mx-auto px-6 flex justify-between items-center text-sm text-gray-500">
          <span>© 2025 DataForge Technologies Inc. All rights reserved.</span>
          <div className="flex items-center gap-1.5 text-gray-400">
            <span className="hover:text-gray-700 transition cursor-pointer">Security Documentation</span>
            <span>•</span>
            <span className="hover:text-gray-700 transition cursor-pointer">Contact Data Team</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
