import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DEMO_RESULT } from "@/lib/sqllab/fixtures";
import { ResultsPanel } from "../ResultsPanel";

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

function renderPanel() {
  return render(
    <ResultsPanel
      status="success"
      result={DEMO_RESULT}
      error={null}
      executions={[]}
      projectId="project-1"
      queryName="query_revenue_by_product.sql"
      onVisualize={vi.fn()}
    />
  );
}

describe("ResultsPanel", () => {
  it("shows the typed status chip and starts sorted by revenue descending", () => {
    renderPanel();
    expect(
      screen.getByText(/200 OK · 10 rows in 118ms · DuckDB 0.10.1/)
    ).toBeInTheDocument();
    const rows = screen.getAllByRole("row");
    expect(within(rows[1]).getByText("PRD-9402")).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: /TOTAL_REVENUE/ })).toHaveAttribute(
      "aria-sort",
      "descending"
    );
  });

  it("filters rows with the results search", async () => {
    const user = userEvent.setup();
    renderPanel();
    await user.type(screen.getByLabelText("Search within results"), "PRD-4109");
    const rows = screen.getAllByRole("row");
    expect(rows).toHaveLength(2);
    expect(within(rows[1]).getByText("PRD-4109")).toBeInTheDocument();
  });

  it("toggles sorting and updates aria-sort", async () => {
    const user = userEvent.setup();
    renderPanel();
    await user.click(screen.getByRole("button", { name: "Sort by TOTAL REVENUE" }));
    expect(screen.getByRole("columnheader", { name: /TOTAL_REVENUE/ })).toHaveAttribute(
      "aria-sort",
      "ascending"
    );
    const rows = screen.getAllByRole("row");
    expect(within(rows[1]).getByText("PRD-9104")).toBeInTheDocument();
  });

  it("navigates result tabs with arrow keys", async () => {
    const user = userEvent.setup();
    renderPanel();
    const resultsTab = screen.getByRole("tab", { name: /Results/ });
    resultsTab.focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Chart Preview" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    expect(screen.getByText("Chart preview arrives with Insights")).toBeInTheDocument();
  });

  it("renders execution details from the same QueryResult", async () => {
    const user = userEvent.setup();
    renderPanel();
    await user.click(screen.getByRole("tab", { name: "Execution Details" }));
    expect(screen.getByText("DuckDB 0.10.1")).toBeInTheDocument();
    expect(screen.getByText("4.2 MB")).toBeInTheDocument();
  });
});

