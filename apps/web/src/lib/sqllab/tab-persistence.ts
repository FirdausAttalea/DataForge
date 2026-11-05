/**
 * sessionStorage persistence for SQL Lab tab state.
 * Keyed per project so multi-project use doesn't bleed.
 * sessionStorage survives same-tab navigation (SPA) but clears on browser close.
 */
import type { QueryTab } from "./types";

interface PersistedTabState {
  tabs: QueryTab[];
  activeTabId: string;
}

function key(projectId: string) {
  return `df:sqllab:tabs:${projectId}`;
}

export function loadTabState(projectId: string): PersistedTabState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(key(projectId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedTabState;
    if (!Array.isArray(parsed.tabs) || !parsed.tabs.length) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveTabState(projectId: string, tabs: QueryTab[], activeTabId: string) {
  if (typeof window === "undefined") return;
  try {
    const state: PersistedTabState = { tabs, activeTabId };
    sessionStorage.setItem(key(projectId), JSON.stringify(state));
  } catch {
    // quota exceeded — silently skip
  }
}

export function clearTabState(projectId: string) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(key(projectId));
  } catch {}
}
