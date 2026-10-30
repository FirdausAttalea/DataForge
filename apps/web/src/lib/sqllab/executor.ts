import { DEMO_ENGINE, DEMO_RESULT } from "./fixtures";
import { isDemoQuery, normalizeSql } from "./sql";
import type { QueryResult } from "./types";

export interface ExecuteQueryOptions {
  signal?: AbortSignal;
  /** Test seam; the fixture-only demo path uses simulated latency. */
  latencyMs?: number;
  /** Required for live queries so the API can verify project access. */
  projectId?: string;
}

export interface SqlExecutor {
  execute(sql: string, options?: ExecuteQueryOptions): Promise<QueryResult>;
}

function abortError(): DOMException {
  return new DOMException("Query cancelled.", "AbortError");
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(abortError());
      return;
    }
    if (ms <= 0) {
      resolve();
      return;
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    function onAbort() {
      clearTimeout(timer);
      reject(abortError());
    }
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

function randomLatency(): number {
  return 400 + Math.floor(Math.random() * 501);
}

function emptyDemoResult(): QueryResult {
  return {
    ...DEMO_RESULT,
    status: "empty",
    rows: [],
    rowCount: 0,
    durationMs: 96,
    memoryMb: 3.8,
  };
}

function errorResult(message: string, durationMs = 0): QueryResult {
  return {
    status: "error",
    columns: [],
    rows: [],
    rowCount: 0,
    durationMs,
    engineVersion: DEMO_ENGINE.version,
    memoryMb: 0,
    error: { message },
  };
}

function demoResult(sql: string): QueryResult | null {
  if (isDemoQuery(sql)) {
    return {
      ...DEMO_RESULT,
      columns: [...DEMO_RESULT.columns],
      rows: [...DEMO_RESULT.rows],
    };
  }
  if (normalizeSql(sql) === normalizeSql(demoEmptySql())) {
    return emptyDemoResult();
  }
  return null;
}

async function executeViaApi(
  sql: string,
  projectId: string,
  options: ExecuteQueryOptions
): Promise<QueryResult> {
  const started = Date.now();
  let response: Response;

  try {
    response = await fetch("/api/v1/sql-lab/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ projectId, sql }),
      signal: options.signal,
    });
  } catch (cause) {
    // Let the runner distinguish a user cancellation from a network failure.
    if (options.signal?.aborted || (cause instanceof DOMException && cause.name === "AbortError")) {
      throw cause;
    }
    return errorResult(
      "Could not reach the SQL service. Make sure the API server is running on port 8000.",
      Date.now() - started
    );
  }

  let data: unknown = null;
  try {
    data = await response.json();
  } catch {
    // Fall through to the status-based error below.
  }

  if (!response.ok) {
    const payload = data as { error?: { message?: unknown } } | null;
    const message =
      typeof payload?.error?.message === "string"
        ? payload.error.message
        : `The query failed with status ${response.status}.`;
    return errorResult(message, Date.now() - started);
  }

  const result = data as QueryResult | null;
  if (
    !result ||
    !Array.isArray(result.columns) ||
    !Array.isArray(result.rows)
  ) {
    return errorResult(
      "The SQL service returned an invalid result.",
      Date.now() - started
    );
  }

  return {
    ...result,
    durationMs:
      typeof result.durationMs === "number"
        ? result.durationMs
        : Date.now() - started,
  };
}

/**
 * Returns an executor for one project. The documented demo query keeps using
 * the typed fixture (so the product screenshot stays stable); every other
 * statement is sent to the authorized, read-only SQL service.
 */
export function createSqlExecutor(projectId: string): SqlExecutor {
  return {
    async execute(sql, options = {}) {
      const demo = demoResult(sql);
      if (demo) {
        await sleep(options.latencyMs ?? randomLatency(), options.signal);
        return demo;
      }
      return executeViaApi(sql, projectId, options);
    },
  };
}

/** Demo-only executor used by tests and as a safe default. */
export const prototypeExecutor: SqlExecutor = {
  async execute(sql, options = {}) {
    const demo = demoResult(sql);
    if (demo) {
      await sleep(options.latencyMs ?? randomLatency(), options.signal);
      return demo;
    }
    return errorResult("Choose a project before running a query.");
  },
};

export async function executeQuery(
  sql: string,
  options: ExecuteQueryOptions = {}
): Promise<QueryResult> {
  if (options.projectId) {
    return createSqlExecutor(options.projectId).execute(sql, options);
  }
  return prototypeExecutor.execute(sql, options);
}

function demoEmptySql(): string {
  // Kept alongside the fixture matcher so the empty state is reachable only
  // through a documented variant of the demo query.
  return `
-- Calculate top revenue generating products across all sales channels
SELECT
  product_id,
  SUM(revenue) AS total_revenue,
  COUNT(order_id) AS total_orders,
  ROUND(AVG(revenue), 2) AS avg_order_value
FROM orders
GROUP BY product_id
ORDER BY total_revenue DESC
LIMIT 0;`;
}
