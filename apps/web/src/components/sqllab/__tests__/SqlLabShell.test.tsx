import { afterEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import userEvent from "@testing-library/user-event";
import { seedTables } from "@/lib/store/seed";
import type { SavedQuery } from "@/lib/store";
import { SqlLabShell } from "../SqlLabShell";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...rest
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock("@/components/sqllab/SqlEditor", () => ({
  SqlEditor: ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (value: string) => void;
  }) => (
    <textarea
      aria-label="SQL editor mock"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  ),
}));

afterEach(() => {
  vi.unstubAllGlobals();
});

const retailTables = seedTables.filter((table) => table.domain === "Retail & E-commerce");
const saasTables = seedTables.filter((table) => table.domain === "Subscription SaaS");

function saved(id: string, projectId: string, workspaceId: string, name: string, title: string): SavedQuery {
  return {
    id,
    projectId,
    workspaceId,
    name,
    title,
    sql: "SELECT 1;",
    createdAt: "2026-10-30T10:00:00.000Z",
    updatedAt: "2026-10-30T10:00:00.000Z",
  };
}

describe("SqlLabShell session isolation", () => {
  it("shows the first session's own workspace, project, tables, and saved query", () => {
    render(
      <SqlLabShell
        workspaceName="Workspace Alpha"
        workspaceId="ws-alpha"
        project={{ id: "project-alpha", title: "Alpha Project", environment: "production" }}
        tables={retailTables}
        initialSavedQuery={saved("sq-a", "project-alpha", "ws-alpha", "query_alpha.sql", "Alpha Query")}
        initialExecutions={[]}
      />
    );

    expect(screen.getByRole("link", { name: "Workspace Alpha" })).toBeInTheDocument();
    expect(screen.getAllByText("Alpha Project").length).toBeGreaterThan(0);
    expect(screen.getByText("query_alpha.sql")).toBeInTheDocument();
    expect(screen.getByText("Alpha Query")).toBeInTheDocument();
    expect(screen.getByText("order_id")).toBeInTheDocument();
    expect(screen.getByText("Production Replica")).toBeInTheDocument();
  });

  it("never leaks another session's project data when a second user loads the lab", () => {
    const first = render(
      <SqlLabShell
        workspaceName="Workspace Alpha"
        workspaceId="ws-alpha"
        project={{ id: "project-alpha", title: "Alpha Project", environment: "production" }}
        tables={retailTables}
        initialSavedQuery={saved("sq-a", "project-alpha", "ws-alpha", "query_alpha.sql", "Alpha Query")}
        initialExecutions={[]}
      />
    );
    expect(screen.getByText("query_alpha.sql")).toBeInTheDocument();
    first.unmount();

    render(
      <SqlLabShell
        workspaceName="Workspace Beta"
        workspaceId="ws-beta"
        project={{ id: "project-beta", title: "Beta Project", environment: "staging" }}
        tables={saasTables}
        initialSavedQuery={saved("sq-b", "project-beta", "ws-beta", "query_beta.sql", "Beta Query")}
        initialExecutions={[]}
      />
    );

    expect(screen.getByRole("link", { name: "Workspace Beta" })).toBeInTheDocument();
    expect(screen.getAllByText("Beta Project").length).toBeGreaterThan(0);
    expect(screen.getByText("query_beta.sql")).toBeInTheDocument();
    expect(screen.getByText("saas_prod")).toBeInTheDocument();
    expect(screen.getAllByText("subscriptions").length).toBeGreaterThan(0);
    expect(screen.getByText("Staging Replica")).toBeInTheDocument();
    expect(screen.queryByText("query_alpha.sql")).not.toBeInTheDocument();
    expect(screen.queryByText("Alpha Query")).not.toBeInTheDocument();
    expect(screen.queryByText("Workspace Alpha")).not.toBeInTheDocument();
  });

  it("opens a blank untitled.sql tab with an empty-state hint for projects without a saved query", () => {
    const { container } = render(
      <SqlLabShell
        workspaceName="Workspace Gamma"
        workspaceId="ws-gamma"
        project={{ id: "project-gamma", title: "Gamma Project", environment: "development" }}
        tables={retailTables}
        initialSavedQuery={null}
        initialExecutions={[]}
      />
    );

    expect(screen.getAllByText("untitled.sql").length).toBeGreaterThan(0);
    expect(
      container.querySelector('[role="tab"][data-tab-id="tab-blank-1"]')
    ).not.toBeNull();
    expect(screen.getByText(/Blank query tab/)).toBeInTheDocument();
    expect(screen.queryByText(/Auto-saved/)).not.toBeInTheDocument();
  });

  it("hydrates the initial server HTML without attribute mismatches", async () => {
    const element = (
      <SqlLabShell
        workspaceName="Workspace Gamma"
        workspaceId="ws-gamma"
        project={{ id: "project-gamma", title: "Gamma Project", environment: "development" }}
        tables={retailTables}
        initialSavedQuery={null}
        initialExecutions={[]}
      />
    );

    const container = document.createElement("div");
    document.body.appendChild(container);
    container.innerHTML = renderToString(element);

    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    let root: ReturnType<typeof hydrateRoot> | undefined;
    await act(async () => {
      root = hydrateRoot(container, element);
    });
    await act(async () => {
      root?.unmount();
    });
    const hydrationErrors = consoleError.mock.calls.filter((call) =>
      call.some((value) =>
        String(value).toLowerCase().includes("hydrat")
      )
    );
    consoleError.mockRestore();
    container.remove();

    expect(hydrationErrors).toEqual([]);
  });

  it("runs custom SQL through the project endpoint and renders the returned rows", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      void init;
      const url = String(input);
      if (url.includes("/api/v1/sql-lab/query")) {
        return new Response(
          JSON.stringify({
            status: "success",
            columns: [
              { name: "region", type: "VARCHAR", alignment: "left" },
              { name: "orders", type: "BIGINT", alignment: "right" },
              { name: "revenue", type: "DECIMAL(38,2)", alignment: "right" },
            ],
            rows: [
              { region: "LATAM", orders: 1544, revenue: 1126644.36 },
              { region: "Europe", orders: 1529, revenue: 1087879.27 },
            ],
            rowCount: 2,
            durationMs: 12,
            engineVersion: "DuckDB 1.5.6",
            memoryMb: 0.1,
            truncated: false,
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }
      if (url.includes("/api/v1/sql-lab/executions")) {
        return new Response(
          JSON.stringify({
            execution: {
              id: "execution-1",
              projectId: "project-alpha",
              workspaceId: "ws-alpha",
              sqlPreview: "SELECT region FROM orders",
              status: "success",
              rows: 2,
              durationMs: 12,
              executedAt: "2026-10-30T10:00:00.000Z",
            },
          }),
          { status: 201, headers: { "Content-Type": "application/json" } }
        );
      }
      return new Response("{}", { status: 200 });
    });
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    render(
      <SqlLabShell
        workspaceName="Workspace Alpha"
        workspaceId="ws-alpha"
        project={{ id: "project-alpha", title: "Alpha Project", environment: "production" }}
        tables={retailTables}
        initialSavedQuery={{
          ...saved("sq-run", "project-alpha", "ws-alpha", "query_regions.sql", "Regional Revenue"),
          sql: "SELECT region, COUNT(*) AS orders FROM orders GROUP BY region;",
        }}
        initialExecutions={[]}
      />
    );

    await user.click(screen.getByRole("button", { name: /run query/i }));

    expect(await screen.findByText("LATAM")).toBeInTheDocument();
    expect(screen.getByText("Live result")).toBeInTheDocument();

    const queryCall = fetchMock.mock.calls.find(([url]) =>
      String(url).includes("/api/v1/sql-lab/query")
    );
    expect(queryCall).toBeDefined();
    const request = queryCall?.[1];
    expect(request).toBeDefined();
    expect(JSON.parse(String(request?.body))).toEqual({
      projectId: "project-alpha",
      sql: "SELECT region, COUNT(*) AS orders FROM orders GROUP BY region;",
    });
    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/v1/sql-lab/executions",
        expect.objectContaining({ method: "POST" })
      )
    );
  });
});

