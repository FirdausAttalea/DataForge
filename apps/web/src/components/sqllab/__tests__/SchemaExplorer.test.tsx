import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { seedTables } from "@/lib/store/seed";
import { SchemaExplorer } from "../SchemaExplorer";

const retail = seedTables.filter((table) => table.domain === "Retail & E-commerce");

describe("SchemaExplorer", () => {
  it("renders the database tree and expands a table to reveal typed columns", async () => {
    const user = userEvent.setup();
    render(
      <SchemaExplorer
        tables={retail}
        selectedTableId="t-orders"
        onSelectTable={vi.fn()}
        onCollapse={vi.fn()}
      />
    );

    expect(screen.getByRole("tree", { name: "Project schema" })).toBeInTheDocument();
    expect(screen.getByText("analytics_prod")).toBeInTheDocument();
    expect(screen.getByText("4 tables")).toBeInTheDocument();
    expect(screen.getByText("order_id")).toBeInTheDocument();
    expect(screen.getByText("DECIMAL(10,2)")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Expand customers/i }));
    expect(screen.getByText("email")).toBeInTheDocument();
    expect(screen.getByText("lifetime_value")).toBeInTheDocument();
  });

  it("filters tables and columns client-side", async () => {
    const user = userEvent.setup();
    render(
      <SchemaExplorer
        tables={retail}
        selectedTableId="t-orders"
        onSelectTable={vi.fn()}
        onCollapse={vi.fn()}
      />
    );

    await user.type(screen.getByLabelText("Filter tables and columns"), "email");
    const tree = screen.getByRole("tree", { name: "Project schema" });
    expect(within(tree).getByText("customers")).toBeInTheDocument();
    expect(within(tree).getByText("email")).toBeInTheDocument();
    expect(within(tree).queryByText("orders")).not.toBeInTheDocument();

    await user.clear(screen.getByLabelText("Filter tables and columns"));
    await user.type(screen.getByLabelText("Filter tables and columns"), "zzzz");
    expect(screen.getByText(/No tables or columns match/)).toBeInTheDocument();
  });

  it("collapses and expands a table with the toggle button", async () => {
    const user = userEvent.setup();
    render(
      <SchemaExplorer
        tables={retail}
        selectedTableId="t-orders"
        onSelectTable={vi.fn()}
        onCollapse={vi.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: /Collapse orders/i }));
    expect(screen.queryByText("order_date")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Expand orders/i }));
    expect(screen.getByText("order_date")).toBeInTheDocument();
  });
});
