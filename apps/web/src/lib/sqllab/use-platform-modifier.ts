"use client";

import { useSyncExternalStore } from "react";

function subscribe() {
  return () => {};
}

function getSnapshot(): string {
  const platform = navigator.platform || navigator.userAgent;
  return /Mac|iPhone|iPad|iPod/i.test(platform) ? "⌘" : "Ctrl";
}

function getServerSnapshot(): string {
  return "Ctrl";
}

/**
 * Returns the platform-appropriate shortcut modifier without a post-mount
 * state update, so hydration and lint stay happy.
 */
export function usePlatformModifier(): string {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
