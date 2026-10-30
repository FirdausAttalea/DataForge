"use client";

import { useEffect, useRef, useState } from "react";
import { prototypeExecutor, type SqlExecutor } from "./executor";
import type { QueryResult, RunStatus } from "./types";

export interface RunOutcome {
  status: RunStatus;
  result?: QueryResult;
  message?: string;
}

interface UseQueryRunnerOptions {
  executor?: SqlExecutor;
  timeoutMs?: number;
  onComplete?: (outcome: RunOutcome) => void;
}

const TIMEOUT_MESSAGE =
  "Query timed out after 30 seconds. The SQL service stopped waiting.";

export function useQueryRunner({
  executor = prototypeExecutor,
  timeoutMs = 30_000,
  onComplete,
}: UseQueryRunnerOptions = {}) {
  const [status, setStatus] = useState<RunStatus>("idle");
  const [result, setResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function clearTimer() {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }

  useEffect(() => {
    return () => {
      controllerRef.current?.abort();
      clearTimer();
    };
  }, []);

  async function run(sql: string) {
    controllerRef.current?.abort();
    clearTimer();

    const controller = new AbortController();
    controllerRef.current = controller;
    let timedOut = false;

    setStatus("running");
    setResult(null);
    setError(null);

    timeoutRef.current = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, timeoutMs);

    try {
      const next = await executor.execute(sql, { signal: controller.signal });
      if (controller.signal.aborted) return;
      setResult(next);
      setStatus(next.status);
      if (next.status === "error") {
        setError(next.error?.message ?? "The SQL service returned an error.");
      }
      onComplete?.({ status: next.status, result: next, message: next.error?.message });
    } catch {
      if (controller.signal.aborted) {
        if (timedOut) {
          setStatus("timeout");
          setError(TIMEOUT_MESSAGE);
          onComplete?.({ status: "timeout", message: TIMEOUT_MESSAGE });
        } else {
          setStatus("cancelled");
          setError("Query cancelled.");
          onComplete?.({ status: "cancelled", message: "Query cancelled." });
        }
      } else {
        const message = "The query service failed unexpectedly. Please try again.";
        setStatus("error");
        setError(message);
        onComplete?.({ status: "error", message });
      }
    } finally {
      clearTimer();
      if (controllerRef.current === controller) controllerRef.current = null;
    }
  }

  function cancel() {
    controllerRef.current?.abort();
  }

  return { status, result, error, run, cancel, isRunning: status === "running" };
}
