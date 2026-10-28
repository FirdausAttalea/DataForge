"use client";

import { useEffect, useState } from "react";
import type { SessionContext } from "./index";

export function useSession() {
  const [session, setSession] = useState<SessionContext>({ user: null, workspace: null, isAuthenticated: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch("/api/v1/auth/me", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setSession({
            user: data.user || null,
            workspace: data.workspace || null,
            isAuthenticated: !!data.user,
          });
        } else {
          setSession({ user: null, workspace: null, isAuthenticated: false });
        }
      } catch {
        setSession({ user: null, workspace: null, isAuthenticated: false });
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, []);

  return { ...session, loading };
}
