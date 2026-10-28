"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronUp, LogOut } from "lucide-react";
import { useSession } from "@/lib/session/client";
import { getInitials, getDisplayName, getRoleLabel } from "@/lib/session";
import { api } from "@/lib/api/client";

export function UserCard() {
  const router = useRouter();
  const { user, loading } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  if (loading || !user) {
    return (
      <div className="w-full p-3 rounded-lg bg-slate-50 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-200"></div>
          <div className="flex-1">
            <div className="h-4 bg-slate-200 rounded w-24 mb-1"></div>
            <div className="h-3 bg-slate-200 rounded w-32"></div>
          </div>
        </div>
      </div>
    );
  }

  const displayName = getDisplayName(user);
  const subtitle = user.jobTitle && user.organization
    ? `${user.jobTitle} · ${user.organization}`
    : getRoleLabel(user.role);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await api.logout();
      document.cookie = "df_setup_complete=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      router.push("/sign-in");
    } catch {
      setSigningOut(false);
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg transition-colors text-left"
      >
        {user.avatarUrl ? (
          <Image src={user.avatarUrl} alt={displayName} className="w-9 h-9 rounded-full flex-shrink-0" width={36} height={36} />
        ) : (
          <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
            {getInitials(user)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900" title={displayName}>{displayName}</p>
          <p className="text-xs text-slate-500 truncate" title={subtitle}>{subtitle}</p>
        </div>
        <ChevronUp size={18} className={`text-slate-400 flex-shrink-0 transition-transform ${menuOpen ? "rotate-180" : ""}`} />
      </button>

      {menuOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
          <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-slate-200 rounded-lg shadow-lg z-20 overflow-hidden">
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogOut size={16} />
              {signingOut ? "Signing out..." : "Sign out"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
