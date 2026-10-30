import { afterEach, describe, expect, it, vi } from "vitest";
import { DEMO_SQL } from "../fixtures";
import { executeQuery } from "../executor";
import type { QueryResult } from "../types";

const API_RESULT: QueryResult = {
  status: "success",
  columns: [{ name: "n", type: "INT", alignment: "right" }],
  rows: [{ n: 42 }],
  rowCount: 1,
  durationMs: 12,
  engineVersion: "DuckDB 1.5.6",
  memoryMb: 0.2,
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("SQL executor", () => {
  it("returns the typed demo result for the sample query", async () => {
    const result = await executeQuery(DEMO_SQL, { latencyMs: 0 });
    expect(result.status).toBe("success");
    expect(result.rowCount).toBe(10);
    expect(result.rows[0].PRODUCT_ID).toBe("PRD-9402");
    expect(result.engineVersion).toBe("DuckDB 0.10.1");
    expect(result.memoryMb).toBe(4.2);
  });

  it("supports a documented empty demo variant", async () => {
    const result = await executeQuery(DEMO_SQL.replace("LIMIT 10;", "LIMIT 0;"), { latencyMs: 0 });
    expect(result.status).toBe("empty");
    expect(result.rows).toHaveLength(0);
  });

  it("rejects with an AbortError when cancelled", async () => {
    const controller = new AbortController();
    const promise = executeQuery(DEMO_SQL, { latencyMs: 50, signal: controller.signal });
    controller.abort();
    await expect(promise).rejects.toMatchObject({ name: "AbortError" });
  });

  it("asks for a project when a live query has no project context", async () => {
    const result = await executeQuery("SELECT 1 AS n", { latencyMs: 0 });
    expect(result.status).toBe("error");
    expect(result.error?.message).toContain("Choose a project");
  });

  it("sends custom SQL to the authorized query endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(API_RESULT), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await executeQuery("SELECT 42 AS n", { projectId: "project-1" });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/sql-lab/query",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ projectId: "project-1", sql: "SELECT 42 AS n" }),
      })
    );
    expect(result.status).toBe("success");
    expect(result.rows).toEqual([{ n: 42 }]);
    expect(result.engineVersion).toBe("DuckDB 1.5.6");
  });

  it("surfaces a server-side SQL error without throwing", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({ error: { message: "Referenced column not found" } }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        )
      )
    );

    const result = await executeQuery("SELECT missing FROM orders", {
      projectId: "project-1",
    });
    expect(result.status).toBe("error");
    expect(result.error?.message).toBe("Referenced column not found");
  });

  it("explains when the SQL service cannot be reached", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));

    const result = await executeQuery("SELECT 1", { projectId: "project-1" });
    expect(result.status).toBe("error");
    expect(result.error?.message).toContain("Could not reach the SQL service");
  });
});
