import { describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { act } from "react";
import type { QueryResult } from "../types";
import { useQueryRunner } from "../use-query-runner";
import type { SqlExecutor } from "../executor";

function successResult(): QueryResult {
  return {
    status: "success",
    columns: [{ name: "A", type: "INT", alignment: "right" }],
    rows: [{ A: 1 }],
    rowCount: 1,
    durationMs: 12,
    engineVersion: "DuckDB 0.10.1",
    memoryMb: 4.2,
  };
}

describe("useQueryRunner", () => {
  it("runs the mock executor and exposes success metadata", async () => {
    const executor: SqlExecutor = {
      execute: vi.fn().mockResolvedValue(successResult()),
    };
    const onComplete = vi.fn();
    const { result } = renderHook(() => useQueryRunner({ executor, onComplete }));

    await act(async () => {
      await result.current.run("SELECT 1");
    });

    expect(result.current.status).toBe("success");
    expect(result.current.result?.rowCount).toBe(1);
    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({ status: "success" })
    );
  });

  it("surfaces a prototype error result", async () => {
    const executor: SqlExecutor = {
      execute: vi.fn().mockResolvedValue({
        ...successResult(),
        status: "error",
        rows: [],
        rowCount: 0,
        error: { message: "Prototype executor: only the sample query is simulated." },
      }),
    };
    const { result } = renderHook(() => useQueryRunner({ executor }));

    await act(async () => {
      await result.current.run("SELECT secret");
    });

    expect(result.current.status).toBe("error");
    expect(result.current.error).toContain("only the sample query");
  });

  it("supports cancellation with AbortController", async () => {
    const executor: SqlExecutor = {
      execute: vi.fn(
        (_sql, options) =>
          new Promise<QueryResult>((_resolve, reject) => {
            options?.signal?.addEventListener("abort", () => {
              reject(new DOMException("cancelled", "AbortError"));
            });
          })
      ),
    };
    const { result } = renderHook(() => useQueryRunner({ executor }));

    let pending: Promise<void> | undefined;
    act(() => {
      pending = result.current.run("SELECT 1");
    });
    expect(result.current.status).toBe("running");
    act(() => result.current.cancel());
    await act(async () => {
      await pending;
    });
    expect(result.current.status).toBe("cancelled");
  });

  it("reports a timeout after the configured deadline", async () => {
    const executor: SqlExecutor = {
      execute: vi.fn(
        (_sql, options) =>
          new Promise<QueryResult>((_resolve, reject) => {
            options?.signal?.addEventListener("abort", () => {
              reject(new DOMException("timeout", "AbortError"));
            });
          })
      ),
    };
    const onComplete = vi.fn();
    const { result } = renderHook(() =>
      useQueryRunner({ executor, timeoutMs: 10, onComplete })
    );

    await act(async () => {
      await result.current.run("SELECT 1");
    });
    await waitFor(() => expect(result.current.status).toBe("timeout"));
    expect(result.current.error).toContain("timed out");
  });
});
